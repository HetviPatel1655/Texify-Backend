import type { Request, Response } from "express";
import { z } from "zod";

import { asyncHandler } from "../common/middleware/asyncHandler";
import { ApiResponse } from "../common/utils/apiResponse";
import { AppError } from "../common/errors/appError";
import { parseListQuery, toOptionalString } from "../common/utils/query";
import { BeamsService } from "./beams.service";

const service = new BeamsService();
const idSchema = z.string().uuid();

export const listBeams = asyncHandler(async (req: Request, res: Response) => {
  const { tenantId } = (req as any).user;
  const parsedQuery = parseListQuery(req.query as Record<string, unknown>);

  const result = await service.list(
    {
      ...parsedQuery,
      status: toOptionalString(req.query.status),
      partyId: toOptionalString(req.query.partyId),
      itemName: toOptionalString(req.query.itemName),
      warperName: toOptionalString(req.query.warperName),
      loomNo: toOptionalString(req.query.loomNo),
      beamPipeNo: toOptionalString(req.query.beamPipeNo),
      dateFrom: toOptionalString(req.query.dateFrom),
      dateTo: toOptionalString(req.query.dateTo),
    },
    tenantId
  );

  return ApiResponse.ok(res, "Beams retrieved", result);
});

export const getBeamById = asyncHandler(async (req: Request, res: Response) => {
  const { tenantId } = (req as any).user;
  const id = idSchema.parse(req.params.id);
  const beam = await service.getById(id, tenantId);

  if (!beam) throw new AppError("Beam not found", 404);
  return ApiResponse.ok(res, "Beam retrieved", beam);
});

export const getNextBeamNo = asyncHandler(async (req: Request, res: Response) => {
  const { tenantId } = (req as any).user;
  const beamNo = await service.getNextBeamNo(tenantId);
  return ApiResponse.ok(res, "Next beam number", { beamNo });
});

export const getDistinctBeamValues = asyncHandler(async (req: Request, res: Response) => {
  const { tenantId } = (req as any).user;
  const field = req.params.field as "itemName" | "warperName" | "loomNo";
  if (!["itemName", "warperName", "loomNo"].includes(field)) {
    throw new AppError("Invalid field", 400);
  }
  const values = await service.getDistinctValues(field, tenantId);
  return ApiResponse.ok(res, "Distinct values retrieved", values);
});

export const createBeam = asyncHandler(async (req: Request, res: Response) => {
  const { id: actorId, tenantId } = (req as any).user;
  const result = await service.create(req.body, { actorId, tenantId });
  return ApiResponse.created(res, "Beam created", result.data);
});

export const updateBeam = asyncHandler(async (req: Request, res: Response) => {
  const id = idSchema.parse(req.params.id);
  const { id: actorId, tenantId } = (req as any).user;
  const result = await service.update(id, req.body, { actorId, tenantId });
  return ApiResponse.ok(res, "Beam updated", result.data);
});

export const deleteBeam = asyncHandler(async (req: Request, res: Response) => {
  const id = idSchema.parse(req.params.id);
  const { id: actorId, tenantId } = (req as any).user;
  await service.remove(id, { actorId, tenantId });
  return ApiResponse.noContent(res);
});
