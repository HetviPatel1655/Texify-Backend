import type { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";

export const validateQuery = (schema: ZodSchema) => (req: Request, _res: Response, next: NextFunction) => {
  const result = schema.safeParse(req.query);

  if (!result.success) {
    next(result.error);
    return;
  }

  // Express 5 makes req.query a read-only getter — use defineProperty to override it.
  Object.defineProperty(req, "query", {
    value: result.data,
    writable: true,
    configurable: true,
    enumerable: true
  });

  next();
};
