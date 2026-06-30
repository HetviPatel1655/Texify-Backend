import type { Request, Response } from "express";
import { asyncHandler } from "../common/middleware/asyncHandler";
import { ApiResponse } from "../common/utils/apiResponse";
import { ReportsRepository } from "./reports.repository";
import type {
  BeamCardReportQuery,
  BeamIssueReportQuery,
  BeamRegisterReportQuery,
  YarnIssueReportQuery,
  YarnReceiveReportQuery,
  RollsIssueReportQuery,
  TakaReceivedReportQuery,
  YarnSaleChallanReportQuery,
  SaleOutstandingReportQuery,
  PurchaseOutstandingReportQuery,
} from "./reports.types";

const reportsRepo = new ReportsRepository();

export const getBeamCardReport = asyncHandler(
  async (req: Request, res: Response) => {
    const { tenantId } = (req as any).user;
    const query = req.query as unknown as BeamCardReportQuery;
    const result = await reportsRepo.getBeamCardReport(tenantId, query);
    ApiResponse.ok(res, "Beam card report generated", result);
  },
);

export const getBeamIssueReport = asyncHandler(
  async (req: Request, res: Response) => {
    const { tenantId } = (req as any).user;
    const query = req.query as unknown as BeamIssueReportQuery;
    const result = await reportsRepo.getBeamIssueReport(tenantId, query);
    ApiResponse.ok(res, "Beam issue report generated", result);
  },
);

export const getBeamRegisterReport = asyncHandler(
  async (req: Request, res: Response) => {
    const { tenantId } = (req as any).user;
    const query = req.query as unknown as BeamRegisterReportQuery;
    const result = await reportsRepo.getBeamRegisterReport(tenantId, query);
    ApiResponse.ok(res, "Beam register report generated", result);
  },
);

export const getYarnIssueReport = asyncHandler(
  async (req: Request, res: Response) => {
    const { tenantId } = (req as any).user;
    const query = req.query as unknown as YarnIssueReportQuery;
    const result = await reportsRepo.getYarnIssueReport(tenantId, query);
    ApiResponse.ok(res, "Yarn issue report generated", result);
  },
);

export const getYarnReceiveReport = asyncHandler(
  async (req: Request, res: Response) => {
    const { tenantId } = (req as any).user;
    const query = req.query as unknown as YarnReceiveReportQuery;
    const result = await reportsRepo.getYarnReceiveReport(tenantId, query);
    ApiResponse.ok(res, "Yarn receive report generated", result);
  },
);

export const getRollsIssueReport = asyncHandler(
  async (req: Request, res: Response) => {
    const { tenantId } = (req as any).user;
    const query = req.query as unknown as RollsIssueReportQuery;
    const result = await reportsRepo.getRollsIssueReport(tenantId, query);
    ApiResponse.ok(res, "Rolls issue report generated", result);
  },
);

export const getTakaReceivedReport = asyncHandler(
  async (req: Request, res: Response) => {
    const { tenantId } = (req as any).user;
    const query = req.query as unknown as TakaReceivedReportQuery;
    const result = await reportsRepo.getTakaReceivedReport(tenantId, query);
    ApiResponse.ok(res, "Taka received report generated", result);
  },
);

export const getYarnSaleChallanReport = asyncHandler(
  async (req: Request, res: Response) => {
    const { tenantId } = (req as any).user;
    const query = req.query as unknown as YarnSaleChallanReportQuery;
    const result = await reportsRepo.getYarnSaleChallanReport(tenantId, query);
    ApiResponse.ok(res, "Yarn sale challan report generated", result);
  },
);

export const getSaleOutstandingReport = asyncHandler(
  async (req: Request, res: Response) => {
    const { tenantId } = (req as any).user;
    const query = req.query as unknown as SaleOutstandingReportQuery;
    const result = await reportsRepo.getSaleOutstandingReport(tenantId, query);
    ApiResponse.ok(res, "Sale outstanding report generated", result);
  },
);

export const getPurchaseOutstandingReport = asyncHandler(
  async (req: Request, res: Response) => {
    const { tenantId } = (req as any).user;
    const query = req.query as unknown as PurchaseOutstandingReportQuery;
    const result = await reportsRepo.getPurchaseOutstandingReport(tenantId, query);
    ApiResponse.ok(res, "Purchase outstanding report generated", result);
  },
);
