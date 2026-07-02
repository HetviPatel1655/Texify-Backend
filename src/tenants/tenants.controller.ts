import type { Request, Response } from "express";

import { asyncHandler } from "../common/middleware/asyncHandler";
import { TenantsService } from "./tenants.service";
import { ApiResponse } from "../common/utils/apiResponse";

export const listTenants = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = await TenantsService.list(user.id);
  return ApiResponse.ok(res, "User tenants", result);
});

export const createTenant = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const tenant = await TenantsService.create(user.id, req.body.companyName);
  return ApiResponse.created(res, "Company created", { tenant });
});

export const switchTenant = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const tokens = await TenantsService.switchTenant(user.id, req.params.tenantId, user.role);
  return ApiResponse.ok(res, "Switched company", tokens);
});
