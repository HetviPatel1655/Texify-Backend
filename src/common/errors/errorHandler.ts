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

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  if (error instanceof ZodError) {
    response.status(400).json(buildErrorResponse("Validation failed", "VALIDATION_ERROR", error.flatten()));

    return;
  }

  if (error instanceof AppError) {
    response.status(error.statusCode).json(buildErrorResponse(error.expose ? error.message : "Request failed", error.code, error.details));

    return;
  }

  if (isPrismaKnownError(error)) {
    if (error.code === "P2002") {
      response.status(409).json(buildErrorResponse("A record with the provided value already exists", "DUPLICATE_RECORD", error.meta));
      return;
    }

    if (error.code === "P2025") {
      response.status(404).json(buildErrorResponse("Requested record was not found", "RECORD_NOT_FOUND", error.meta));
      return;
    }

    if (error.code === "P2003") {
      response.status(409).json(buildErrorResponse("This record is linked to other data and cannot be modified", "FOREIGN_KEY_VIOLATION", error.meta));
      return;
    }

    if (error.code === "P2014") {
      response.status(409).json(buildErrorResponse("The operation violates a required relation", "RELATION_VIOLATION", error.meta));
      return;
    }

    response.status(400).json(buildErrorResponse("Database request failed", "DATABASE_REQUEST_ERROR", { code: error.code, meta: error.meta }));

    return;
  }

  if (isPrismaValidationError(error)) {
    response.status(400).json(buildErrorResponse("Database validation failed", "DATABASE_VALIDATION_ERROR"));
    return;
  }

  if (isPrismaUnknownRequestError(error)) {
    response.status(500).json(buildErrorResponse("Database connection failed", "DATABASE_UNKNOWN_ERROR"));
    return;
  }

  logger.error(
    {
      errorName: error instanceof Error ? error.name : typeof error,
      errorMessage: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    },
    "Unhandled application error"
  );

  response.status(500).json(buildErrorResponse("Internal server error", "INTERNAL_SERVER_ERROR"));
};