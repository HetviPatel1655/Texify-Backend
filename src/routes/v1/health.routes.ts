import { Router } from "express";

import { asyncHandler } from "../../common/middleware/asyncHandler";
import { env } from "../../config";

const healthRouter = Router();

healthRouter.get(
  "/health",
  asyncHandler(async (_request, response) => {
    response.status(200).json({
      success: true,
      message: "Service is healthy",
      data: {
        service: "texify-backend",
        environment: env.NODE_ENV,
        timestamp: new Date().toISOString()
      }
    });
  })
);

export { healthRouter };