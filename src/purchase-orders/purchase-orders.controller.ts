import type { Request, Response } from "express";
import { z } from "zod";

import { asyncHandler } from "../common/middleware/asyncHandler.js";
import { ApiResponse } from "../common/utils/apiResponse.js";
import { AppError } from "../common/errors/appError.js";
import { parseListQuery, toOptionalString } from "../common/utils/query.js";
import { PurchaseOrdersService } from "./purchase-orders.service.js";

const service = new PurchaseOrdersService();
const idSchema = z.string().uuid();

export const listPurchaseOrders = asyncHandler(async (req: Request, res: Response) => {
  const { tenantId } = (req as any).user;
  const parsedQuery = parseListQuery(req.query as Record<string, unknown>);

  const result = await service.list(
    {
      ...parsedQuery,
      status: toOptionalString(req.query.status),
      partyId: toOptionalString(req.query.partyId),
    },
    tenantId
  );

  return ApiResponse.ok(res, "Purchase orders retrieved", result);
});

export const getPurchaseOrderById = asyncHandler(async (req: Request, res: Response) => {
  const { tenantId } = (req as any).user;
  const id = idSchema.parse(req.params.id);
  const order = await service.getById(id, tenantId);

  if (!order) throw new AppError("Purchase order not found", 404);
  return ApiResponse.ok(res, "Purchase order retrieved", order);
});

export const getNextPurchaseOrderNumber = asyncHandler(async (req: Request, res: Response) => {
  const { tenantId } = (req as any).user;
  const orderNumber = await service.getNextOrderNumber(tenantId);
  return ApiResponse.ok(res, "Next order number", { orderNumber });
});

export const createPurchaseOrder = asyncHandler(async (req: Request, res: Response) => {
  const { id: actorId, tenantId } = (req as any).user;
  const result = await service.create(req.body, { actorId, tenantId });
  return ApiResponse.created(res, "Purchase order created", result.data);
});

export const updatePurchaseOrder = asyncHandler(async (req: Request, res: Response) => {
  const id = idSchema.parse(req.params.id);
  const { id: actorId, tenantId } = (req as any).user;
  const result = await service.update(id, req.body, { actorId, tenantId });
  return ApiResponse.ok(res, "Purchase order updated", result.data);
});

export const deletePurchaseOrder = asyncHandler(async (req: Request, res: Response) => {
  const id = idSchema.parse(req.params.id);
  const { id: actorId, tenantId } = (req as any).user;
  await service.remove(id, { actorId, tenantId });
  return ApiResponse.noContent(res);
});
