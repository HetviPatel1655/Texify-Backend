import type { Request, Response } from "express";
import { z } from "zod";

import { asyncHandler } from "../common/middleware/asyncHandler.js";
import { ApiResponse } from "../common/utils/apiResponse.js";
import { AppError } from "../common/errors/appError.js";
import { parseListQuery, toOptionalString } from "../common/utils/query.js";
import { YarnPurchasesService } from "./yarn-purchases.service.js";
import { getYarnStock } from "./yarn-stock.service.js";
import type { YarnStockQuery } from "./yarn-stock.types.js";
import { prisma } from "../lib/prisma.js";
import { formatDecimalValue } from "../common/utils/decimal.js";

const service = new YarnPurchasesService();
const idSchema = z.string().uuid();

export const listYarnPurchases = asyncHandler(async (req: Request, res: Response) => {
  const { tenantId } = (req as any).user;
  const parsedQuery = parseListQuery(req.query as Record<string, unknown>);

  const result = await service.list(
    {
      ...parsedQuery,
      partyId: toOptionalString(req.query.partyId),
    },
    tenantId
  );

  return ApiResponse.ok(res, "Yarn purchases retrieved", result);
});

export const getYarnPurchaseById = asyncHandler(async (req: Request, res: Response) => {
  const { tenantId } = (req as any).user;
  const id = idSchema.parse(req.params.id);
  const purchase = await service.getById(id, tenantId);

  if (!purchase) throw new AppError("Yarn purchase not found", 404);
  return ApiResponse.ok(res, "Yarn purchase retrieved", purchase);
});

export const getNextYarnPurchaseNumber = asyncHandler(async (req: Request, res: Response) => {
  const { tenantId } = (req as any).user;
  const serialNumber = await service.getNextSerialNumber(tenantId);
  return ApiResponse.ok(res, "Next serial number", { serialNumber });
});

export const createYarnPurchase = asyncHandler(async (req: Request, res: Response) => {
  const { id: actorId, tenantId } = (req as any).user;
  const result = await service.create(req.body, { actorId, tenantId });
  return ApiResponse.created(res, "Yarn purchase created", result.data);
});

export const updateYarnPurchase = asyncHandler(async (req: Request, res: Response) => {
  const id = idSchema.parse(req.params.id);
  const { id: actorId, tenantId } = (req as any).user;
  const result = await service.update(id, req.body, { actorId, tenantId });
  return ApiResponse.ok(res, "Yarn purchase updated", result.data);
});

export const deleteYarnPurchase = asyncHandler(async (req: Request, res: Response) => {
  const id = idSchema.parse(req.params.id);
  const { id: actorId, tenantId } = (req as any).user;
  await service.remove(id, { actorId, tenantId });
  return ApiResponse.noContent(res);
});

export const lookupCarton = asyncHandler(async (req: Request, res: Response) => {
  const { tenantId } = (req as any).user;
  const cartonNo = req.params.cartonNo;

  const item = await prisma.yarnPurchaseItem.findFirst({
    where: {
      cartonNo,
      yarnPurchase: { tenantId, deletedAt: null },
    },
    select: {
      cartonNo: true,
      itemName: true,
      shadeName: true,
      lotNo: true,
      denier: true,
      twist: true,
      twistDirection: true,
      cheese: true,
      netWt: true,
      rate: true,
      amount: true,
    },
    orderBy: { createdAt: "desc" },
  });

  if (!item) throw new AppError("Carton not found", 404);

  return ApiResponse.ok(res, "Carton found", {
    cartonNo: item.cartonNo,
    yarnName: item.itemName,
    shadeName: item.shadeName,
    lotNo: item.lotNo,
    denier: item.denier,
    twist: item.twist,
    twistDirection: item.twistDirection,
    cheese: formatDecimalValue(item.cheese),
    netWt: formatDecimalValue(item.netWt),
    rate: formatDecimalValue(item.rate),
    amount: formatDecimalValue(item.amount),
  });
});

export const getDistinctYarnItems = asyncHandler(async (req: Request, res: Response) => {
  const { tenantId } = (req as any).user;

  const items = await prisma.yarnPurchaseItem.findMany({
    where: { yarnPurchase: { tenantId, deletedAt: null } },
    select: { itemName: true },
    distinct: ["itemName"],
    orderBy: { itemName: "asc" },
  });

  return ApiResponse.ok(res, "Distinct yarn items", items.map((i) => i.itemName));
});

export const getYarnStockReport = asyncHandler(async (req: Request, res: Response) => {
  const { tenantId } = (req as any).user;
  const query: YarnStockQuery = {
    asOnDate: toOptionalString(req.query.asOnDate),
    groupBy: (toOptionalString(req.query.groupBy) as YarnStockQuery["groupBy"]) ?? "item",
    reportType: (toOptionalString(req.query.reportType) as YarnStockQuery["reportType"]) ?? "summary",
    itemName: toOptionalString(req.query.itemName),
  };
  const result = await getYarnStock(tenantId, query);
  return ApiResponse.ok(res, "Yarn stock report", result);
});
