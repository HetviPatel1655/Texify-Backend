import type { Request, Response } from "express";
import { z } from "zod";

import { asyncHandler } from "../common/middleware/asyncHandler";
import { ApiResponse } from "../common/utils/apiResponse";
import { AppError } from "../common/errors/appError";
import { parseListQuery, toOptionalString } from "../common/utils/query";
import { YarnIssuesService } from "./yarn-issues.service";

const service = new YarnIssuesService();
const idSchema = z.string().uuid();

export const listYarnIssues = asyncHandler(async (req: Request, res: Response) => {
  const { tenantId } = (req as any).user;
  const parsedQuery = parseListQuery(req.query as Record<string, unknown>);

  const result = await service.list(
    {
      ...parsedQuery,
      cartonNo: toOptionalString(req.query.cartonNo),
      deptName: toOptionalString(req.query.deptName),
    },
    tenantId
  );

  return ApiResponse.ok(res, "Yarn issues retrieved", result);
});

export const getYarnIssueById = asyncHandler(async (req: Request, res: Response) => {
  const { tenantId } = (req as any).user;
  const id = idSchema.parse(req.params.id);
  const issue = await service.getById(id, tenantId);

  if (!issue) throw new AppError("Yarn issue not found", 404);
  return ApiResponse.ok(res, "Yarn issue retrieved", issue);
});

export const getNextYarnIssueSlipNo = asyncHandler(async (req: Request, res: Response) => {
  const { tenantId } = (req as any).user;
  const slipNo = await service.getNextSlipNo(tenantId);
  return ApiResponse.ok(res, "Next slip number", { slipNo });
});

export const createYarnIssue = asyncHandler(async (req: Request, res: Response) => {
  const { id: actorId, tenantId } = (req as any).user;
  const result = await service.create(req.body, { actorId, tenantId });
  return ApiResponse.created(res, "Yarn issue created", result.data);
});

export const updateYarnIssue = asyncHandler(async (req: Request, res: Response) => {
  const id = idSchema.parse(req.params.id);
  const { id: actorId, tenantId } = (req as any).user;
  const result = await service.update(id, req.body, { actorId, tenantId });
  return ApiResponse.ok(res, "Yarn issue updated", result.data);
});

export const deleteYarnIssue = asyncHandler(async (req: Request, res: Response) => {
  const id = idSchema.parse(req.params.id);
  const { id: actorId, tenantId } = (req as any).user;
  await service.remove(id, { actorId, tenantId });
  return ApiResponse.noContent(res);
});
