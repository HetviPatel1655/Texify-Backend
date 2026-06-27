import type { Request, Response } from "express";
import { asyncHandler } from "../common/middleware/asyncHandler";
import { ApiResponse } from "../common/utils/apiResponse";
import { FeatureGateService } from "./feature-gate.service";

export const getUsage = asyncHandler(async (req: Request, res: Response) => {
  const { tenantId } = (req as any).user;
  const usage = await FeatureGateService.getUsage(tenantId);
  ApiResponse.ok(res, "Usage retrieved", usage);
});
