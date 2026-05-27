import type { NextFunction, Request, Response } from "express";

import { logger } from "../../lib/logger";

export function requestLogger(request: Request, response: Response, next: NextFunction): void {
  const startedAt = Date.now();

  response.on("finish", () => {
    logger.info(
      {
        method: request.method,
        path: request.originalUrl,
        statusCode: response.statusCode,
        durationMs: Date.now() - startedAt
      },
      "HTTP request completed"
    );
  });

  next();
}