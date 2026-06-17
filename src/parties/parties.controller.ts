import type { Request, Response } from "express";
import { z } from "zod";

import { asyncHandler } from "../common/middleware/asyncHandler";
import { ApiResponse } from "../common/utils/apiResponse";
import { AppError } from "../common/errors/appError";
import { parseListQuery, toOptionalBoolean, toOptionalString } from "../common/utils/query";
import { PartyTypes } from "../common/constants/erp";
import { PartiesService } from "./parties.service";

const partiesService = new PartiesService();
const idSchema = z.string().uuid();

export const listParties = asyncHandler(async (req: Request, res: Response) => {
	const { tenantId } = (req as any).user;
	const parsedQuery = parseListQuery(req.query as Record<string, unknown>);
	const partyType = toOptionalString(req.query.partyType);

	const result = await partiesService.list({
		...parsedQuery,
		partyType: partyType && PartyTypes.includes(partyType as never) ? (partyType as never) : undefined,
		isActive: toOptionalBoolean(req.query.isActive)
	}, tenantId);

	return ApiResponse.ok(res, "Parties retrieved", result);
});

export const getPartyById = asyncHandler(async (req: Request, res: Response) => {
	const { tenantId } = (req as any).user;
	const id = idSchema.parse(req.params.id);
	const party = await partiesService.getById(id, tenantId);

	if (!party) throw new AppError("Party not found", 404);

	return ApiResponse.ok(res, "Party retrieved", party);
});

export const createParty = asyncHandler(async (req: Request, res: Response) => {
	const { id: actorId, tenantId } = (req as any).user;
	const result = await partiesService.create(req.body, { actorId, tenantId });

	return ApiResponse.created(res, "Party created", result.data);
});

export const updateParty = asyncHandler(async (req: Request, res: Response) => {
	const id = idSchema.parse(req.params.id);
	const { id: actorId, tenantId } = (req as any).user;
	const result = await partiesService.update(id, req.body, { actorId, tenantId });

	return ApiResponse.ok(res, "Party updated", result.data);
});

export const deleteParty = asyncHandler(async (req: Request, res: Response) => {
	const id = idSchema.parse(req.params.id);
	const { id: actorId, tenantId } = (req as any).user;
	await partiesService.remove(id, { actorId, tenantId });

	return ApiResponse.noContent(res);
});
