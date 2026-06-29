import type { Request, Response } from "express";
import { z } from "zod";

import { asyncHandler } from "../common/middleware/asyncHandler";
import { ApiResponse } from "../common/utils/apiResponse";
import { AppError } from "../common/errors/appError";
import { parseListQuery, toOptionalString } from "../common/utils/query";
import { BankEntriesService } from "./bank-entries.service";

const service = new BankEntriesService();
const idSchema = z.string().uuid();

export const listBankEntries = asyncHandler(async (req: Request, res: Response) => {
  const { tenantId } = (req as any).user;
  const parsedQuery = parseListQuery(req.query as Record<string, unknown>);

  const result = await service.list(
    {
      ...parsedQuery,
      type: toOptionalString(req.query.type) as "SLIP" | "CHEQUE" | undefined,
      partyId: toOptionalString(req.query.partyId),
      fromDate: toOptionalString(req.query.fromDate),
      toDate: toOptionalString(req.query.toDate),
    },
    tenantId
  );

  return ApiResponse.ok(res, "Bank entries retrieved", result);
});

export const getBankEntryById = asyncHandler(async (req: Request, res: Response) => {
  const { tenantId } = (req as any).user;
  const id = idSchema.parse(req.params.id);
  const entry = await service.getById(id, tenantId);

  if (!entry) throw new AppError("Bank entry not found", 404);
  return ApiResponse.ok(res, "Bank entry retrieved", entry);
});

export const getNextBankEntryNumber = asyncHandler(async (req: Request, res: Response) => {
  const { tenantId } = (req as any).user;
  const type = (toOptionalString(req.query.type) ?? "SLIP") as "SLIP" | "CHEQUE";
  const serialNumber = await service.getNextSerialNumber(tenantId, type);
  return ApiResponse.ok(res, "Next serial number", { serialNumber });
});

export const getOutstandingInvoices = asyncHandler(async (req: Request, res: Response) => {
  const { tenantId } = (req as any).user;
  const partyId = idSchema.parse(req.query.partyId);
  const invoices = await service.getOutstandingInvoices(partyId, tenantId);
  return ApiResponse.ok(res, "Outstanding invoices retrieved", invoices);
});

export const createBankEntry = asyncHandler(async (req: Request, res: Response) => {
  const { id: actorId, tenantId } = (req as any).user;
  const result = await service.create(req.body, { actorId, tenantId });
  return ApiResponse.created(res, "Bank entry created", result.data);
});

export const updateBankEntry = asyncHandler(async (req: Request, res: Response) => {
  const id = idSchema.parse(req.params.id);
  const { id: actorId, tenantId } = (req as any).user;
  const result = await service.update(id, req.body, { actorId, tenantId });
  return ApiResponse.ok(res, "Bank entry updated", result.data);
});

export const deleteBankEntry = asyncHandler(async (req: Request, res: Response) => {
  const id = idSchema.parse(req.params.id);
  const { id: actorId, tenantId } = (req as any).user;
  await service.remove(id, { actorId, tenantId });
  return ApiResponse.noContent(res);
});
