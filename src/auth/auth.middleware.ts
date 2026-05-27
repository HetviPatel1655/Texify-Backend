import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { env } from "../config";
import { AppError } from "../common/errors/appError";

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new AppError("Authorization header missing", 401);
    }

    const token = authHeader.replace("Bearer ", "");

    const secret = env.JWT_SECRET as unknown as jwt.Secret;
    const payload = jwt.verify(token, secret) as { sub: string; role?: string };

    // attach minimal user info; service layer can load more
    (req as any).user = { id: payload.sub, role: payload.role };

    next();
  } catch (err) {
    next(new AppError("Unauthorized", 401));
  }
}
