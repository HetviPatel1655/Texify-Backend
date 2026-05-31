import type { Request, Response } from "express";

import { asyncHandler } from "../common/middleware/asyncHandler";
import { ApiResponse } from "../common/utils/apiResponse";
import { CompanyProfileService } from "./company-profile.service";

const service = new CompanyProfileService();

export const getCompanyProfile = asyncHandler(async (_req: Request, res: Response) => {
  const profile = await service.get();
  return ApiResponse.ok(res, "Company profile retrieved", profile);
});

export const upsertCompanyProfile = asyncHandler(async (req: Request, res: Response) => {
  const profile = await service.upsert(req.body);
  return ApiResponse.ok(res, "Company profile saved", profile);
});
