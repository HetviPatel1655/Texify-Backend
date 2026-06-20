import type { ErrorRequestHandler } from "express";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";

import { logger } from "../../lib/logger";
import { AppError } from "./appError";

function buildErrorResponse(message: string, code: string, details?: unknown) {
  return {
    success: false,
    message,
    error: {
      code,
      details
    }
  };
}

function isPrismaKnownError(error: unknown): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError;
}

function isPrismaValidationError(error: unknown): error is Prisma.PrismaClientValidationError {
  return error instanceof Prisma.PrismaClientValidationError;
}

function isPrismaUnknownRequestError(error: unknown): error is Prisma.PrismaClientUnknownRequestError {
  return error instanceof Prisma.PrismaClientUnknownRequestError;
}

export const errorHandler: ErrorRequestHandler = (error, request, response, _next) => {
  const requestId = request.headers["x-request-id"] as string | undefined;

  if (error instanceof ZodError) {
    const flat = error.flatten();
    logger.warn(
      { requestId, errorCode: "VALIDATION_ERROR", fields: flat.fieldErrors },
      `Validation failed: ${Object.keys(flat.fieldErrors).join(", ")}`
    );
    response.status(400).json(buildErrorResponse("Validation failed", "VALIDATION_ERROR", flat));
    return;
  }

  if (error instanceof AppError) {
    const logLevel = error.statusCode >= 500 ? "error" : "warn";
    logger[logLevel](
      { requestId, errorCode: error.code, statusCode: error.statusCode, details: error.details },
      error.message
    );
    response.status(error.statusCode).json(buildErrorResponse(error.expose ? error.message : "Request failed", error.code, error.details));
    return;
  }

  if (isPrismaKnownError(error)) {
    const prismaCode = error.code;
    logger.warn(
      { requestId, errorCode: `PRISMA_${prismaCode}`, meta: error.meta },
      `Prisma error ${prismaCode}: ${error.message.split("\n").pop()?.trim()}`
    );

    if (prismaCode === "P2002") {
      const target = (error.meta?.target as string[])?.join(", ") ?? "field";
      response.status(409).json(buildErrorResponse(`A record with this ${target} already exists`, "DUPLICATE_RECORD", error.meta));
      return;
    }

    if (prismaCode === "P2025") {
      response.status(404).json(buildErrorResponse("Requested record was not found", "RECORD_NOT_FOUND", error.meta));
      return;
    }

    if (prismaCode === "P2003") {
      response.status(409).json(buildErrorResponse("This record is linked to other data and cannot be modified", "FOREIGN_KEY_VIOLATION", error.meta));
      return;
    }

    if (prismaCode === "P2014") {
      response.status(409).json(buildErrorResponse("The operation violates a required relation", "RELATION_VIOLATION", error.meta));
      return;
    }

    response.status(400).json(buildErrorResponse("Database request failed", "DATABASE_REQUEST_ERROR", { code: prismaCode, meta: error.meta }));
    return;
  }

  if (isPrismaValidationError(error)) {
    logger.warn({ requestId, errorCode: "DATABASE_VALIDATION_ERROR" }, `Prisma validation: ${error.message.split("\n").pop()?.trim()}`);
    response.status(400).json(buildErrorResponse("Database validation failed", "DATABASE_VALIDATION_ERROR"));
    return;
  }

  if (isPrismaUnknownRequestError(error)) {
    logger.error({ requestId, errorCode: "DATABASE_UNKNOWN_ERROR" }, `Prisma unknown: ${error.message}`);
    response.status(500).json(buildErrorResponse("Database connection failed", "DATABASE_UNKNOWN_ERROR"));
    return;
  }

  logger.error(
    {
      requestId,
      errorName: error instanceof Error ? error.name : typeof error,
      errorMessage: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    },
    `Unhandled: ${error instanceof Error ? error.message : String(error)}`
  );

  response.status(500).json(buildErrorResponse("Internal server error", "INTERNAL_SERVER_ERROR"));
};
