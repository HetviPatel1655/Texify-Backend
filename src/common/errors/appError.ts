export class AppError extends Error {
  public readonly statusCode: number;

  public readonly isOperational: boolean;

  public readonly code: string;

  public readonly details?: unknown;

  public readonly expose: boolean;

  constructor(message: string, statusCode = 500, isOperational = true, code = "APP_ERROR", details?: unknown, expose = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.code = code;
    this.details = details;
    this.expose = expose;
    this.name = "AppError";
    Error.captureStackTrace(this, this.constructor);
  }
}