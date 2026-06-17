import type { Request, Response } from "express";

import { asyncHandler } from "../common/middleware/asyncHandler";
import { AuthService } from "./auth.service";
import { ApiResponse } from "../common/utils/apiResponse";

export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await AuthService.register(req.body);

  return ApiResponse.created(res, "User registered", { user: result.user, tenantId: result.tenantId });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const tokens = await AuthService.login(req.body);

  return ApiResponse.ok(res, "Login successful", tokens);
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;

  return ApiResponse.ok(res, "Current user", { user });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const tokens = await AuthService.refresh(req.body.refreshToken);

  return ApiResponse.ok(res, "Token refreshed", tokens);
});
