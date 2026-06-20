import type { NextFunction, Request, Response } from "express";
import { randomUUID } from "crypto";

import { logger } from "../../lib/logger";

const SENSITIVE_FIELDS = new Set(["password", "currentPassword", "newPassword", "confirmPassword", "token", "refreshToken", "apiKey"]);

function sanitizeBody(body: unknown): unknown {
  if (!body || typeof body !== "object") return body;
  if (Array.isArray(body)) return body.map(sanitizeBody);

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(body as Record<string, unknown>)) {
    if (SENSITIVE_FIELDS.has(key)) {
      result[key] = "***";
    } else if (typeof value === "string" && value.length > 200) {
      result[key] = value.slice(0, 200) + "...[truncated]";
    } else {
      result[key] = value;
    }
  }
  return result;
}

export function requestLogger(request: Request, response: Response, next: NextFunction): void {
  const startedAt = Date.now();
  const requestId = request.header("x-request-id") ?? randomUUID();

  request.headers["x-request-id"] = requestId;
  response.setHeader("x-request-id", requestId);

  response.on("finish", () => {
    const durationMs = Date.now() - startedAt;
    const status = response.statusCode;
    const logLevel = status >= 500 ? "error" : status >= 400 ? "warn" : "info";

    const logData: Record<string, unknown> = {
      requestId,
      method: request.method,
      path: request.originalUrl,
      statusCode: status,
      statusLabel: `${Math.floor(status / 100)}xx`,
      durationMs,
    };

    if (status >= 400 && request.body && Object.keys(request.body).length > 0) {
      logData.body = sanitizeBody(request.body);
    }

    if (status >= 400) {
      logData.query = Object.keys(request.query).length > 0 ? request.query : undefined;
    }

    logger[logLevel](
      logData,
      `${request.method} ${request.originalUrl} -> ${status} (${durationMs}ms)`
    );
  });

  next();
}
