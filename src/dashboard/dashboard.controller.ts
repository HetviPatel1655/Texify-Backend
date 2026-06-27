import type { Request, Response } from "express";
import { asyncHandler } from "../common/middleware/asyncHandler";
import { ApiResponse } from "../common/utils/apiResponse";
import { DashboardService } from "./dashboard.service";

export const getDashboardStats = asyncHandler(
  async (req: Request, res: Response) => {
    const { tenantId } = (req as any).user;
    const stats = await DashboardService.getStats(tenantId);
    ApiResponse.ok(res, "Dashboard stats retrieved", stats);
  },
);
