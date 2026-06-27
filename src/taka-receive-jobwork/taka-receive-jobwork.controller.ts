import type { Request, Response } from "express";
import { z } from "zod";

import { asyncHandler } from "../common/middleware/asyncHandler";
import { ApiResponse } from "../common/utils/apiResponse";
import { AppError } from "../common/errors/appError";
import { parseListQuery, toOptionalString } from "../common/utils/query";
import { TakaReceiveJobworkService } from "./taka-receive-jobwork.service";

const service = new TakaReceiveJobworkService();
const idSchema = z.string().uuid();

export const listTakaReceives = asyncHandler(async (req: Request, res: Response) => {
  const { tenantId } = (req as any).user;
  const parsedQuery = parseListQuery(req.query as Record<string, unknown>);

  const result = await service.list(
    {
      ...parsedQuery,
      firmId: toOptionalString(req.query.firmId),
      partyId: toOptionalString(req.query.partyId),
      dateFrom: toOptionalString(req.query.dateFrom),
      dateTo: toOptionalString(req.query.dateTo),
    },
    tenantId
  );

  return ApiResponse.ok(res, "Taka receive jobwork entries retrieved", result);
});

export const getTakaReceiveById = asyncHandler(async (req: Request, res: Response) => {
  const { tenantId } = (req as any).user;
  const id = idSchema.parse(req.params.id);
  const entry = await service.getById(id, tenantId);

  if (!entry) throw new AppError("Taka receive jobwork not found", 404);
  return ApiResponse.ok(res, "Taka receive jobwork retrieved", entry);
});

export const getNextTakaReceiveNumber = asyncHandler(async (req: Request, res: Response) => {
  const { tenantId } = (req as any).user;
  const serialNumber = await service.getNextSerialNumber(tenantId);
  return ApiResponse.ok(res, "Next serial number", { serialNumber });
});

export const createTakaReceive = asyncHandler(async (req: Request, res: Response) => {
  const { id: actorId, tenantId } = (req as any).user;
  const result = await service.create(req.body, { actorId, tenantId });
  return ApiResponse.created(res, "Taka receive jobwork created", result.data);
});

export const updateTakaReceive = asyncHandler(async (req: Request, res: Response) => {
  const id = idSchema.parse(req.params.id);
  const { id: actorId, tenantId } = (req as any).user;
  const result = await service.update(id, req.body, { actorId, tenantId });
  return ApiResponse.ok(res, "Taka receive jobwork updated", result.data);
});

export const deleteTakaReceive = asyncHandler(async (req: Request, res: Response) => {
  const id = idSchema.parse(req.params.id);
  const { id: actorId, tenantId } = (req as any).user;
  await service.remove(id, { actorId, tenantId });
  return ApiResponse.noContent(res);
});
