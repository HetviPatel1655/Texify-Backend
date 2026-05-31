import type { Request, Response } from "express";
import { z } from "zod";

import { asyncHandler } from "../common/middleware/asyncHandler";
import { ApiResponse } from "../common/utils/apiResponse";
import { AppError } from "../common/errors/appError";
import { parseListQuery, toOptionalString } from "../common/utils/query";
import { ChallansService } from "./challans.service";

const challansService = new ChallansService();
const idSchema = z.string().uuid();

export const listChallans = asyncHandler(async (req: Request, res: Response) => {
  const parsedQuery = parseListQuery(req.query as Record<string, unknown>);

  const result = await challansService.list({
    ...parsedQuery,
    status: toOptionalString(req.query.status) as never,
    partyId: toOptionalString(req.query.partyId)
  });

  return ApiResponse.ok(res, "Challans retrieved", result);
});

export const getChallanById = asyncHandler(async (req: Request, res: Response) => {
  const id = idSchema.parse(req.params.id);
  const challan = await challansService.getById(id);

  if (!challan) throw new AppError("Challan not found", 404);

  return ApiResponse.ok(res, "Challan retrieved", challan);
});

export const createChallan = asyncHandler(async (req: Request, res: Response) => {
  const actorId = (req as any).user?.id;
  const result = await challansService.create(req.body, { actorId });

  return ApiResponse.created(res, "Challan created", result.data);
});

export const updateChallan = asyncHandler(async (req: Request, res: Response) => {
  const id = idSchema.parse(req.params.id);
  const actorId = (req as any).user?.id;
  const result = await challansService.update(id, req.body, { actorId });

  return ApiResponse.ok(res, "Challan updated", result.data);
});

export const deleteChallan = asyncHandler(async (req: Request, res: Response) => {
  const id = idSchema.parse(req.params.id);
  await challansService.remove(id);

  return ApiResponse.noContent(res);
});
