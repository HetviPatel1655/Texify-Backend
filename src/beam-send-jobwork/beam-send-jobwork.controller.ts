import type { Request, Response } from "express";
import { z } from "zod";

import { asyncHandler } from "../common/middleware/asyncHandler";
import { ApiResponse } from "../common/utils/apiResponse";
import { AppError } from "../common/errors/appError";
import { parseListQuery, toOptionalString } from "../common/utils/query";
import { BeamSendJobworkService } from "./beam-send-jobwork.service";

const service = new BeamSendJobworkService();
const idSchema = z.string().uuid();

export const listBeamSends = asyncHandler(async (req: Request, res: Response) => {
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

  return ApiResponse.ok(res, "Beam send jobwork entries retrieved", result);
});

export const getBeamSendById = asyncHandler(async (req: Request, res: Response) => {
  const { tenantId } = (req as any).user;
  const id = idSchema.parse(req.params.id);
  const entry = await service.getById(id, tenantId);

  if (!entry) throw new AppError("Beam send jobwork not found", 404);
  return ApiResponse.ok(res, "Beam send jobwork retrieved", entry);
});

export const getNextBeamSendNumber = asyncHandler(async (req: Request, res: Response) => {
  const { tenantId } = (req as any).user;
  const serialNumber = await service.getNextSerialNumber(tenantId);
  return ApiResponse.ok(res, "Next serial number", { serialNumber });
});

export const createBeamSend = asyncHandler(async (req: Request, res: Response) => {
  const { id: actorId, tenantId } = (req as any).user;
  const result = await service.create(req.body, { actorId, tenantId });
  return ApiResponse.created(res, "Beam send jobwork created", result.data);
});

export const updateBeamSend = asyncHandler(async (req: Request, res: Response) => {
  const id = idSchema.parse(req.params.id);
  const { id: actorId, tenantId } = (req as any).user;
  const result = await service.update(id, req.body, { actorId, tenantId });
  return ApiResponse.ok(res, "Beam send jobwork updated", result.data);
});

export const deleteBeamSend = asyncHandler(async (req: Request, res: Response) => {
  const id = idSchema.parse(req.params.id);
  const { id: actorId, tenantId } = (req as any).user;
  await service.remove(id, { actorId, tenantId });
  return ApiResponse.noContent(res);
});
