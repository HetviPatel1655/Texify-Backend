import type { Request, Response } from "express";
import { z } from "zod";

import { asyncHandler } from "../common/middleware/asyncHandler";
import { ApiResponse } from "../common/utils/apiResponse";
import { AppError } from "../common/errors/appError";
import type { InvoiceListQuery } from "./invoices.types";
import { InvoicesService } from "./invoices.service";

const invoicesService = new InvoicesService();
const idSchema = z.string().uuid();

export const listInvoices = asyncHandler(async (req: Request, res: Response) => {
  const { tenantId } = (req as any).user;
  const result = await invoicesService.list(req.query as unknown as InvoiceListQuery, tenantId);

  return ApiResponse.ok(res, "Invoices retrieved", result);
});

export const getInvoiceById = asyncHandler(async (req: Request, res: Response) => {
  const { tenantId } = (req as any).user;
  const id = idSchema.parse(req.params.id);
  const invoice = await invoicesService.getById(id, tenantId);

  if (!invoice) throw new AppError("Invoice not found", 404);

  return ApiResponse.ok(res, "Invoice retrieved", invoice);
});

export const getNextInvoiceNumber = asyncHandler(async (req: Request, res: Response) => {
  const { tenantId } = (req as any).user;
  const nextNumber = await invoicesService.getNextNumber(tenantId);
  return ApiResponse.ok(res, "Next invoice number", { nextNumber });
});

export const createInvoice = asyncHandler(async (req: Request, res: Response) => {
  const { id: actorId, tenantId } = (req as any).user;
  const result = await invoicesService.create(req.body, { actorId, tenantId });

  return ApiResponse.created(res, "Invoice created", result.data);
});

export const updateInvoice = asyncHandler(async (req: Request, res: Response) => {
  const id = idSchema.parse(req.params.id);
  const { id: actorId, tenantId } = (req as any).user;
  const result = await invoicesService.update(id, req.body, { actorId, tenantId });

  return ApiResponse.ok(res, "Invoice updated", result.data);
});

export const deleteInvoice = asyncHandler(async (req: Request, res: Response) => {
  const id = idSchema.parse(req.params.id);
  const { id: actorId, tenantId } = (req as any).user;
  await invoicesService.remove(id, { actorId, tenantId });

  return ApiResponse.noContent(res);
});
