import bcrypt from "bcrypt";
import jwt, { type JwtPayload } from "jsonwebtoken";

import { prisma } from "../lib/prisma";
import { env } from "../config";
import { AppError } from "../common/errors/appError";

export const AuthService = {
  async register(input: { name: string; email: string; password: string; companyName: string; role?: string }) {
    const existing = await prisma.user.findUnique({ where: { email: input.email } });

    if (existing) throw new AppError("Email already in use", 409);

    const hashed = await bcrypt.hash(input.password, 12);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: input.name,
          email: input.email,
          password: hashed,
          role: input.role ?? "USER"
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true
        }
      });

      const tenant = await tx.tenant.create({
        data: { name: input.companyName }
      });

      await tx.tenantUser.create({
        data: {
          tenantId: tenant.id,
          userId: user.id,
          role: "OWNER"
        }
      });

      return { user, tenantId: tenant.id };
    });

    return result;
  },

  async login(input: { email: string; password: string }) {
    const user = await prisma.user.findUnique({ where: { email: input.email } });

    if (!user) throw new AppError("Invalid credentials", 401);

    const ok = await bcrypt.compare(input.password, user.password);

    if (!ok) throw new AppError("Invalid credentials", 401);

    const tenantUser = await prisma.tenantUser.findFirst({
      where: { userId: user.id },
      select: { tenantId: true }
    });

    if (!tenantUser) throw new AppError("No organization associated with this account", 403);

    const secret = env.JWT_SECRET as unknown as jwt.Secret;
    const j: any = jwt as any;

    const accessToken = j.sign(
      { sub: user.id, role: user.role, tenantId: tenantUser.tenantId },
      secret,
      { expiresIn: env.ACCESS_TOKEN_EXPIRES_IN ?? "15m" }
    );
    const refreshToken = j.sign(
      { sub: user.id, role: user.role, tenantId: tenantUser.tenantId },
      secret,
      { expiresIn: env.REFRESH_TOKEN_EXPIRES_IN ?? "7d" }
    );

    return { accessToken, refreshToken };
  },

  async refresh(incomingRefreshToken: string) {
    const secret = env.JWT_SECRET as unknown as jwt.Secret;

    let payload: JwtPayload;
    try {
      payload = jwt.verify(incomingRefreshToken, secret) as JwtPayload;
    } catch {
      throw new AppError("Invalid or expired refresh token", 401);
    }

    const user = await prisma.user.findUnique({ where: { id: payload.sub as string }, select: { id: true, role: true } });
    if (!user) {
      throw new AppError("User not found", 401);
    }

    const tenantUser = await prisma.tenantUser.findFirst({
      where: { userId: user.id },
      select: { tenantId: true }
    });

    if (!tenantUser) throw new AppError("No organization associated with this account", 403);

    const j: any = jwt as any;
    const accessToken = j.sign(
      { sub: user.id, role: user.role, tenantId: tenantUser.tenantId },
      secret,
      { expiresIn: env.ACCESS_TOKEN_EXPIRES_IN ?? "15m" }
    );
    const newRefreshToken = j.sign(
      { sub: user.id, role: user.role, tenantId: tenantUser.tenantId },
      secret,
      { expiresIn: env.REFRESH_TOKEN_EXPIRES_IN ?? "7d" }
    );

    return { accessToken, refreshToken: newRefreshToken };
  }
};
