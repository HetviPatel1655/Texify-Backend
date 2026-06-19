import type { Request, Response } from "express";
import { asyncHandler } from "../common/middleware/asyncHandler.js";
import { ApiResponse } from "../common/utils/apiResponse.js";
import { DashboardService } from "./dashboard.service.js";

export const getDashboardStats = asyncHandler(
  async (req: Request, res: Response) => {
    const { tenantId } = (req as any).user;
    const stats = await DashboardService.getStats(tenantId);
    ApiResponse.ok(res, "Dashboard stats retrieved", stats);
  },
);
