import type { Request, Response } from "express";
import { z } from "zod";

import { asyncHandler } from "../common/middleware/asyncHandler";
import { ApiResponse } from "../common/utils/apiResponse";
import { AppError } from "../common/errors/appError";
import { parseListQuery, toOptionalString } from "../common/utils/query";
import { ReturnTakasService } from "./return-takas.service";

const service = new ReturnTakasService();
const idSchema = z.string().uuid();

export const listReturnTakas = asyncHandler(async (req: Request, res: Response) => {
  const { tenantId } = (req as any).user;
  const parsedQuery = parseListQuery(req.query as Record<string, unknown>);

  const result = await service.list(
    {
      ...parsedQuery,
      takaId: toOptionalString(req.query.takaId),
      partyId: toOptionalString(req.query.partyId),
      dateFrom: toOptionalString(req.query.dateFrom),
      dateTo: toOptionalString(req.query.dateTo),
    },
    tenantId
  );

  return ApiResponse.ok(res, "Return takas retrieved", result);
});

export const getReturnTakaById = asyncHandler(async (req: Request, res: Response) => {
  const { tenantId } = (req as any).user;
  const id = idSchema.parse(req.params.id);
  const entry = await service.getById(id, tenantId);

  if (!entry) throw new AppError("Return taka entry not found", 404);
  return ApiResponse.ok(res, "Return taka retrieved", entry);
});

export const createReturnTaka = asyncHandler(async (req: Request, res: Response) => {
  const { id: actorId, tenantId } = (req as any).user;
  const result = await service.create(req.body, { actorId, tenantId });
  return ApiResponse.created(res, "Return taka created", result.data);
});

export const updateReturnTaka = asyncHandler(async (req: Request, res: Response) => {
  const id = idSchema.parse(req.params.id);
  const { id: actorId, tenantId } = (req as any).user;
  const result = await service.update(id, req.body, { actorId, tenantId });
  return ApiResponse.ok(res, "Return taka updated", result.data);
});

export const deleteReturnTaka = asyncHandler(async (req: Request, res: Response) => {
  const id = idSchema.parse(req.params.id);
  const { id: actorId, tenantId } = (req as any).user;
  await service.remove(id, { actorId, tenantId });
  return ApiResponse.noContent(res);
});
