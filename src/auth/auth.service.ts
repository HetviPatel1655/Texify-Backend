import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { prisma } from "../lib/prisma";
import { env } from "../config";
import { AppError } from "../common/errors/appError";

export const AuthService = {
  async register(input: { name: string; email: string; password: string; role?: string }) {
    const existing = await prisma.user.findUnique({ where: { email: input.email } });

    if (existing) throw new AppError("Email already in use", 409);

    const hashed = await bcrypt.hash(input.password, 12);

    const user = await prisma.user.create({
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

    return user;
  },

  async login(input: { email: string; password: string }) {
    const user = await prisma.user.findUnique({ where: { email: input.email } });

    if (!user) throw new AppError("Invalid credentials", 401);

    const ok = await bcrypt.compare(input.password, user.password);

    if (!ok) throw new AppError("Invalid credentials", 401);

    const secret = env.JWT_SECRET as unknown as jwt.Secret;

    const j: any = jwt as any;

    const accessToken = j.sign({ sub: user.id, role: user.role }, secret, { expiresIn: env.ACCESS_TOKEN_EXPIRES_IN ?? "15m" });
    const refreshToken = j.sign({ sub: user.id, role: user.role }, secret, { expiresIn: env.REFRESH_TOKEN_EXPIRES_IN ?? "7d" });

    return { accessToken, refreshToken };
  }
};
