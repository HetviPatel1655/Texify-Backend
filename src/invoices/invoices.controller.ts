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
  const result = await invoicesService.list(req.query as unknown as InvoiceListQuery);

  return ApiResponse.ok(res, "Invoices retrieved", result);
});

export const getInvoiceById = asyncHandler(async (req: Request, res: Response) => {
  const id = idSchema.parse(req.params.id);
  const invoice = await invoicesService.getById(id);

  if (!invoice) throw new AppError("Invoice not found", 404);

  return ApiResponse.ok(res, "Invoice retrieved", invoice);
});

export const createInvoice = asyncHandler(async (req: Request, res: Response) => {
  const actorId = (req as any).user?.id;
  const result = await invoicesService.create(req.body, { actorId });

  return ApiResponse.created(res, "Invoice created", result.data);
});

export const updateInvoice = asyncHandler(async (req: Request, res: Response) => {
  const id = idSchema.parse(req.params.id);
  const actorId = (req as any).user?.id;
  const result = await invoicesService.update(id, req.body, { actorId });

  return ApiResponse.ok(res, "Invoice updated", result.data);
});

export const deleteInvoice = asyncHandler(async (req: Request, res: Response) => {
  const id = idSchema.parse(req.params.id);
  await invoicesService.remove(id);

  return ApiResponse.noContent(res);
});
