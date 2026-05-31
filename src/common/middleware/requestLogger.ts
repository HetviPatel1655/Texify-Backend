import type { NextFunction, Request, Response } from "express";
import { randomUUID } from "crypto";

import { logger } from "../../lib/logger";

export function requestLogger(request: Request, response: Response, next: NextFunction): void {
  const startedAt = Date.now();
  const requestId = request.header("x-request-id") ?? randomUUID();

  request.headers["x-request-id"] = requestId;
  response.setHeader("x-request-id", requestId);

  response.on("finish", () => {
    const durationMs = Date.now() - startedAt;
    const logLevel = response.statusCode >= 500 ? "error" : response.statusCode >= 400 ? "warn" : "info";

    logger[logLevel](
      {
        requestId,
        method: request.method,
        path: request.originalUrl,
        statusCode: response.statusCode,
        statusLabel: `${Math.floor(response.statusCode / 100)}xx`,
        durationMs
      },
      `${request.method} ${request.originalUrl} -> ${response.statusCode} (${durationMs}ms)`
    );
  });

  next();
}