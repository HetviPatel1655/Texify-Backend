import crypto from "crypto";
import bcrypt from "bcrypt";
import jwt, { type JwtPayload } from "jsonwebtoken";

import { prisma } from "../lib/prisma";
import { env } from "../config";
import { AppError } from "../common/errors/appError";
import { EmailService } from "../common/services/email.service";

export const AuthService = {
  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
    if (!user) throw new AppError("User not found", 404);

    const tenantUser = await prisma.tenantUser.findFirst({
      where: { userId },
      select: { tenantId: true, role: true, tenant: { select: { name: true } } },
    });

    return {
      ...user,
      tenantId: tenantUser?.tenantId ?? null,
      tenantRole: tenantUser?.role ?? null,
      companyName: tenantUser?.tenant?.name ?? null,
    };
  },

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
  },

  async forgotPassword(input: { email: string }) {
    if (!env.SMTP_USER || !env.SMTP_PASS) {
      throw new AppError("Password reset is not available at this time. Please contact the administrator.", 503);
    }

    const user = await prisma.user.findUnique({ where: { email: input.email } });
    if (!user) return;

    const token = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: hashedToken,
        passwordResetExpiry: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    await EmailService.sendPasswordResetEmail(user.email, token);
  },

  async resetPassword(input: { token: string; newPassword: string }) {
    const hashedToken = crypto.createHash("sha256").update(input.token).digest("hex");

    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: hashedToken,
        passwordResetExpiry: { gt: new Date() },
      },
    });

    if (!user) throw new AppError("Invalid or expired reset token", 400);

    const hashed = await bcrypt.hash(input.newPassword, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashed,
        passwordResetToken: null,
        passwordResetExpiry: null,
      },
    });
  },

  async changePassword(input: { userId: string; currentPassword: string; newPassword: string }) {
    const user = await prisma.user.findUnique({ where: { id: input.userId } });
    if (!user) throw new AppError("User not found", 404);

    const ok = await bcrypt.compare(input.currentPassword, user.password);
    if (!ok) throw new AppError("Current password is incorrect", 401);

    const hashed = await bcrypt.hash(input.newPassword, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashed },
    });
  },
};
