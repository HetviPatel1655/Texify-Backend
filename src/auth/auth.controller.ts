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
  const reqUser = (req as any).user;
  const user = await AuthService.getProfile(reqUser.id);

  return ApiResponse.ok(res, "Current user", { user });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const tokens = await AuthService.refresh(req.body.refreshToken);

  return ApiResponse.ok(res, "Token refreshed", tokens);
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  await AuthService.forgotPassword(req.body);
  return ApiResponse.ok(res, "If that email exists, a reset link has been sent");
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  await AuthService.resetPassword(req.body);
  return ApiResponse.ok(res, "Password reset successful");
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  await AuthService.changePassword({ userId: user.id, ...req.body });
  return ApiResponse.ok(res, "Password changed successfully");
});
