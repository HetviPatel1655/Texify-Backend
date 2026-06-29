import type { Request, Response } from "express";
import { z } from "zod";

import { asyncHandler } from "../common/middleware/asyncHandler";
import { ApiResponse } from "../common/utils/apiResponse";
import { AppError } from "../common/errors/appError";
import { parseListQuery, toOptionalString } from "../common/utils/query";
import { EmployeesService } from "./employees.service";

const service = new EmployeesService();
const idSchema = z.string().uuid();

export const listEmployees = asyncHandler(async (req: Request, res: Response) => {
  const { tenantId } = (req as any).user;
  const parsedQuery = parseListQuery(req.query as Record<string, unknown>);

  const result = await service.list(
    {
      ...parsedQuery,
      employeeType: toOptionalString(req.query.employeeType),
      isActive: toOptionalString(req.query.isActive),
    },
    tenantId
  );

  return ApiResponse.ok(res, "Employees retrieved", result);
});

export const getEmployeeById = asyncHandler(async (req: Request, res: Response) => {
  const { tenantId } = (req as any).user;
  const id = idSchema.parse(req.params.id);
  const employee = await service.getById(id, tenantId);

  if (!employee) throw new AppError("Employee not found", 404);
  return ApiResponse.ok(res, "Employee retrieved", employee);
});

export const createEmployee = asyncHandler(async (req: Request, res: Response) => {
  const { id: actorId, tenantId } = (req as any).user;
  const result = await service.create(req.body, { actorId, tenantId });
  return ApiResponse.created(res, "Employee created", result.data);
});

export const updateEmployee = asyncHandler(async (req: Request, res: Response) => {
  const id = idSchema.parse(req.params.id);
  const { id: actorId, tenantId } = (req as any).user;
  const result = await service.update(id, req.body, { actorId, tenantId });
  return ApiResponse.ok(res, "Employee updated", result.data);
});

export const deleteEmployee = asyncHandler(async (req: Request, res: Response) => {
  const id = idSchema.parse(req.params.id);
  const { id: actorId, tenantId } = (req as any).user;
  await service.remove(id, { actorId, tenantId });
  return ApiResponse.noContent(res);
});
