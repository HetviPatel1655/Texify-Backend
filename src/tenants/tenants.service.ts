import jwt from "jsonwebtoken";

import { prisma } from "../lib/prisma";
import { env } from "../config";
import { AppError } from "../common/errors/appError";
import { FeatureGateService } from "../feature-gate/feature-gate.service";

const FREE_MAX_COMPANIES = 1;
const PRO_MAX_COMPANIES = 3;

export const TenantsService = {
  async list(userId: string) {
    const tenantUsers = await prisma.tenantUser.findMany({
      where: { userId },
      select: {
        role: true,
        createdAt: true,
        tenant: {
          select: {
            id: true,
            name: true,
            createdAt: true,
            companyProfile: { select: { companyName: true } },
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    const tenants = tenantUsers.map((tu: any) => ({
      id: tu.tenant.id,
      name: tu.tenant.name,
      companyName: tu.tenant.companyProfile?.companyName ?? tu.tenant.name,
      role: tu.role,
      createdAt: tu.tenant.createdAt,
    }));

    const tenantIds = tenantUsers.map((tu: any) => tu.tenant.id);
    const hasProSub = tenantIds.length > 0
      ? !!(await prisma.subscription.findFirst({
          where: {
            tenantId: { in: tenantIds },
            planName: "pro",
            status: { in: ["ACTIVE", "AUTHENTICATED"] },
          },
        }))
      : false;

    const maxCompanies = hasProSub ? PRO_MAX_COMPANIES : FREE_MAX_COMPANIES;

    return { tenants, maxCompanies };
  },

  async create(userId: string, companyName: string) {
    await FeatureGateService.checkCompanyLimit(userId);

    const result = await prisma.$transaction(async (tx: any) => {
      const tenant = await tx.tenant.create({
        data: { name: companyName },
      });

      await tx.tenantUser.create({
        data: {
          tenantId: tenant.id,
          userId,
          role: "OWNER",
        },
      });

      return tenant;
    });

    return { id: result.id, name: result.name, companyName, role: "OWNER", createdAt: result.createdAt };
  },

  async deleteTenant(userId: string, tenantId: string) {
    const tenantUser = await prisma.tenantUser.findUnique({
      where: { tenantId_userId: { tenantId, userId } },
    });

    if (!tenantUser || tenantUser.role !== "OWNER") {
      throw new AppError("Only the owner can delete a company", 403);
    }

    const tenantCount = await prisma.tenantUser.count({ where: { userId } });
    if (tenantCount <= 1) {
      throw new AppError("Cannot delete your only company", 400);
    }

    await prisma.tenant.delete({ where: { id: tenantId } });
  },

  async switchTenant(userId: string, tenantId: string, userRole: string) {
    const tenantUser = await prisma.tenantUser.findUnique({
      where: { tenantId_userId: { tenantId, userId } },
    });

    if (!tenantUser) {
      throw new AppError("You do not belong to this organization", 403);
    }

    const secret = env.JWT_SECRET as unknown as jwt.Secret;
    const j: any = jwt as any;

    const accessToken = j.sign(
      { sub: userId, role: userRole, tenantId },
      secret,
      { expiresIn: env.ACCESS_TOKEN_EXPIRES_IN ?? "15m" },
    );
    const refreshToken = j.sign(
      { sub: userId, role: userRole, tenantId },
      secret,
      { expiresIn: env.REFRESH_TOKEN_EXPIRES_IN ?? "7d" },
    );

    return { accessToken, refreshToken };
  },
};
