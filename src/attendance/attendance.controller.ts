import type { Request, Response } from "express";

import { asyncHandler } from "../common/middleware/asyncHandler";
import { ApiResponse } from "../common/utils/apiResponse";
import { toOptionalString } from "../common/utils/query";
import { AttendanceService } from "./attendance.service";

const service = new AttendanceService();

export const getMonthlyGrid = asyncHandler(async (req: Request, res: Response) => {
  const { tenantId } = (req as any).user;
  const month = Number(req.query.month);
  const year = Number(req.query.year);
  const employeeType = toOptionalString(req.query.employeeType);

  const grid = await service.getMonthlyGrid(tenantId, month, year, employeeType);
  return ApiResponse.ok(res, "Monthly attendance grid retrieved", grid);
});

export const bulkUpsertAttendance = asyncHandler(async (req: Request, res: Response) => {
  const { id: actorId, tenantId } = (req as any).user;
  const result = await service.bulkUpsertAttendance(req.body, { actorId, tenantId });
  return ApiResponse.ok(res, "Attendance updated", result);
});

export const getAttendanceSalaryReport = asyncHandler(async (req: Request, res: Response) => {
  const { tenantId } = (req as any).user;
  const query = {
    fromDate: req.query.fromDate as string,
    toDate: req.query.toDate as string,
    employeeType: toOptionalString(req.query.employeeType),
    employeeId: toOptionalString(req.query.employeeId),
    reportType: (toOptionalString(req.query.reportType) ?? "summary") as "detailed" | "summary",
  };

  const result = await service.getSalaryReport(tenantId, query);
  return ApiResponse.ok(res, "Salary report generated", result);
});

export const getWorkerSalaryReport = asyncHandler(async (req: Request, res: Response) => {
  const { tenantId } = (req as any).user;
  const query = {
    fromDate: req.query.fromDate as string,
    toDate: req.query.toDate as string,
    dateType: (toOptionalString(req.query.dateType) ?? "foldingDate") as "foldingDate" | "startingDate" | "salaryDate",
    groupBy: (toOptionalString(req.query.groupBy) ?? "worker") as "worker" | "firm",
    reportType: (toOptionalString(req.query.reportType) ?? "summary") as "detailed" | "summary",
    sortOn: toOptionalString(req.query.sortOn) as any,
    particular: toOptionalString(req.query.particular),
  };

  const result = await service.getWorkerSalaryReport(tenantId, query);
  return ApiResponse.ok(res, "Worker salary report generated", result);
});

export const getPatiaReport = asyncHandler(async (req: Request, res: Response) => {
  const { tenantId } = (req as any).user;
  const query = {
    fromDate: req.query.fromDate as string,
    toDate: req.query.toDate as string,
    firmId: toOptionalString(req.query.firmId),
    machineType: (toOptionalString(req.query.machineType) ?? "all") as "selected" | "all",
    reportType: (toOptionalString(req.query.reportType) ?? "summary") as "takaWise" | "dateWise" | "summary",
    machines: req.query.machines
      ? (typeof req.query.machines === "string" ? req.query.machines.split(",") : req.query.machines as string[])
      : undefined,
  };

  const result = await service.getPatiaReport(tenantId, query);
  return ApiResponse.ok(res, "Patia report generated", result);
});

export const getDistinctMachines = asyncHandler(async (req: Request, res: Response) => {
  const { tenantId } = (req as any).user;
  const machines = await service.getDistinctMachines(tenantId);
  return ApiResponse.ok(res, "Machines retrieved", machines);
});
