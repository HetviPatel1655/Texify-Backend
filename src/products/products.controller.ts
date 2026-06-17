import type { Request, Response } from "express";
import { z } from "zod";

import { UnitTypes, GSTTypes } from "../common/constants/erp";
import { asyncHandler } from "../common/middleware/asyncHandler";
import { ApiResponse } from "../common/utils/apiResponse";
import { AppError } from "../common/errors/appError";
import { parseListQuery, toOptionalBoolean, toOptionalString } from "../common/utils/query";
import { ProductsService } from "./products.service";

const productsService = new ProductsService();
const idSchema = z.string().uuid();

export const listProducts = asyncHandler(async (req: Request, res: Response) => {
	const { tenantId } = (req as any).user;
	const parsedQuery = parseListQuery(req.query as Record<string, unknown>);
	const unitType = toOptionalString(req.query.unitType);
	const gstType = toOptionalString(req.query.gstType);

	const result = await productsService.list({
		...parsedQuery,
		unitType: unitType && UnitTypes.includes(unitType as never) ? (unitType as never) : undefined,
		gstType: gstType && GSTTypes.includes(gstType as never) ? (gstType as never) : undefined,
		isActive: toOptionalBoolean(req.query.isActive)
	}, tenantId);

	return ApiResponse.ok(res, "Products retrieved", result);
});

export const getProductById = asyncHandler(async (req: Request, res: Response) => {
	const { tenantId } = (req as any).user;
	const id = idSchema.parse(req.params.id);
	const product = await productsService.getById(id, tenantId);

	if (!product) throw new AppError("Product not found", 404);

	return ApiResponse.ok(res, "Product retrieved", product);
});

export const createProduct = asyncHandler(async (req: Request, res: Response) => {
	const { id: actorId, tenantId } = (req as any).user;
	const result = await productsService.create(req.body, { actorId, tenantId });

	return ApiResponse.created(res, "Product created", result.data);
});

export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
	const id = idSchema.parse(req.params.id);
	const { id: actorId, tenantId } = (req as any).user;
	const result = await productsService.update(id, req.body, { actorId, tenantId });

	return ApiResponse.ok(res, "Product updated", result.data);
});

export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
	const id = idSchema.parse(req.params.id);
	const { id: actorId, tenantId } = (req as any).user;
	await productsService.remove(id, { actorId, tenantId });

	return ApiResponse.noContent(res);
});
