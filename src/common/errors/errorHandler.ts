import type { ErrorRequestHandler } from "express";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";

import { logger } from "../../lib/logger";
import { AppError } from "./appError";

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  if (error instanceof ZodError) {
    response.status(400).json({
      success: false,
      message: "Validation failed",
      errors: error.flatten()
    });

    return;
  }

  if (error instanceof AppError) {
    response.status(error.statusCode).json({
      success: false,
      message: error.message
    });

    return;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    response.status(409).json({
      success: false,
      message: "A record with the provided value already exists"
    });

    return;
  }

  logger.error({ error }, "Unhandled application error");

  response.status(500).json({
    success: false,
    message: "Internal server error"
  });
};