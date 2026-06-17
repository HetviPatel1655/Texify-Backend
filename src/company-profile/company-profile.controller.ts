import type { Request, Response } from "express";

import { asyncHandler } from "../common/middleware/asyncHandler";
import { ApiResponse } from "../common/utils/apiResponse";
import { CompanyProfileService } from "./company-profile.service";

const service = new CompanyProfileService();

export const getCompanyProfile = asyncHandler(async (req: Request, res: Response) => {
  const { tenantId } = (req as any).user;
  const profile = await service.get(tenantId);
  return ApiResponse.ok(res, "Company profile retrieved", profile);
});

export const upsertCompanyProfile = asyncHandler(async (req: Request, res: Response) => {
  const { tenantId } = (req as any).user;
  const profile = await service.upsert(req.body, tenantId);
  return ApiResponse.ok(res, "Company profile saved", profile);
});
