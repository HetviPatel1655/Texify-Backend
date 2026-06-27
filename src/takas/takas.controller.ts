import type { Request, Response } from "express";
import { z } from "zod";

import { asyncHandler } from "../common/middleware/asyncHandler";
import { ApiResponse } from "../common/utils/apiResponse";
import { AppError } from "../common/errors/appError";
import { parseListQuery, toOptionalString } from "../common/utils/query";
import { TakasService } from "./takas.service";

const service = new TakasService();
const idSchema = z.string().uuid();

export const listTakas = asyncHandler(async (req: Request, res: Response) => {
  const { tenantId } = (req as any).user;
  const parsedQuery = parseListQuery(req.query as Record<string, unknown>);

  const result = await service.list(
    {
      ...parsedQuery,
      status: toOptionalString(req.query.status),
      isWithBeam: toOptionalString(req.query.isWithBeam),
      beamId: toOptionalString(req.query.beamId),
      firmId: toOptionalString(req.query.firmId),
      loomNo: toOptionalString(req.query.loomNo),
      itemName: toOptionalString(req.query.itemName),
      grade: toOptionalString(req.query.grade),
      workerName: toOptionalString(req.query.workerName),
      shadeName: toOptionalString(req.query.shadeName),
      dateFrom: toOptionalString(req.query.dateFrom),
      dateTo: toOptionalString(req.query.dateTo),
      dateType: toOptionalString(req.query.dateType),
    },
    tenantId
  );

  return ApiResponse.ok(res, "Takas retrieved", result);
});

export const getTakaById = asyncHandler(async (req: Request, res: Response) => {
  const { tenantId } = (req as any).user;
  const id = idSchema.parse(req.params.id);
  const taka = await service.getById(id, tenantId);

  if (!taka) throw new AppError("Taka not found", 404);
  return ApiResponse.ok(res, "Taka retrieved", taka);
});

export const getTakaByNo = asyncHandler(async (req: Request, res: Response) => {
  const { tenantId } = (req as any).user;
  const takaNo = String(req.params.takaNo);
  const taka = await service.getByTakaNo(takaNo, tenantId);

  if (!taka) throw new AppError("Taka not found", 404);
  return ApiResponse.ok(res, "Taka retrieved", taka);
});

export const getNextTakaNo = asyncHandler(async (req: Request, res: Response) => {
  const { tenantId } = (req as any).user;
  const prefix = toOptionalString(req.query.prefix);
  const takaNo = await service.getNextTakaNo(tenantId, prefix);
  return ApiResponse.ok(res, "Next taka number", { takaNo });
});

export const getDistinctTakaValues = asyncHandler(async (req: Request, res: Response) => {
  const { tenantId } = (req as any).user;
  const field = req.params.field as any;
  const validFields = ["itemName", "workerName", "loomNo", "grade", "shadeName", "designNo"];
  if (!validFields.includes(field)) {
    throw new AppError("Invalid field", 400);
  }
  const values = await service.getDistinctValues(field, tenantId);
  return ApiResponse.ok(res, "Distinct values retrieved", values);
});

export const getTakaStock = asyncHandler(async (req: Request, res: Response) => {
  const { tenantId } = (req as any).user;
  const result = await service.getStockSummary(tenantId, {
    dateFrom: toOptionalString(req.query.dateFrom),
    dateTo: toOptionalString(req.query.dateTo),
    itemName: toOptionalString(req.query.itemName),
  });
  return ApiResponse.ok(res, "Taka stock retrieved", result);
});

export const createTaka = asyncHandler(async (req: Request, res: Response) => {
  const { id: actorId, tenantId } = (req as any).user;
  const result = await service.create(req.body, { actorId, tenantId });
  return ApiResponse.created(res, "Taka created", result.data);
});

export const createMultiTakas = asyncHandler(async (req: Request, res: Response) => {
  const { id: actorId, tenantId } = (req as any).user;
  const { takas, ...commonFields } = req.body;
  const result = await service.createMulti(takas, commonFields, { actorId, tenantId });
  return ApiResponse.created(res, "Takas created", result.data);
});

export const updateTaka = asyncHandler(async (req: Request, res: Response) => {
  const id = idSchema.parse(req.params.id);
  const { id: actorId, tenantId } = (req as any).user;
  const result = await service.update(id, req.body, { actorId, tenantId });
  return ApiResponse.ok(res, "Taka updated", result.data);
});

export const deleteTaka = asyncHandler(async (req: Request, res: Response) => {
  const id = idSchema.parse(req.params.id);
  const { id: actorId, tenantId } = (req as any).user;
  await service.remove(id, { actorId, tenantId });
  return ApiResponse.noContent(res);
});
