import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { env } from "../config";
import { AppError } from "../common/errors/appError";
import { tenantContext } from "../lib/tenant-context";

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new AppError("Authorization header missing", 401);
    }

    const token = authHeader.replace("Bearer ", "");

    const secret = env.JWT_SECRET as unknown as jwt.Secret;
    const payload = jwt.verify(token, secret) as { sub: string; role?: string; tenantId?: string };

    if (!payload.tenantId) {
      throw new AppError("Token missing tenant context. Please log in again.", 401);
    }

    (req as any).user = { id: payload.sub, role: payload.role, tenantId: payload.tenantId };

    tenantContext.run({ tenantId: payload.tenantId }, () => next());
  } catch (err) {
    if (err instanceof AppError) {
      next(err);
    } else {
      next(new AppError("Unauthorized", 401));
    }
  }
}
