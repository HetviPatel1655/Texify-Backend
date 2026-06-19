import type { Request, Response } from "express";
import { asyncHandler } from "../common/middleware/asyncHandler.js";
import { ApiResponse } from "../common/utils/apiResponse.js";
import { FeatureGateService } from "./feature-gate.service.js";

export const getUsage = asyncHandler(async (req: Request, res: Response) => {
  const { tenantId } = (req as any).user;
  const usage = await FeatureGateService.getUsage(tenantId);
  ApiResponse.ok(res, "Usage retrieved", usage);
});
