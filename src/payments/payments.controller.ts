import type { Request, Response } from "express";
import { z } from "zod";

import { asyncHandler } from "../common/middleware/asyncHandler.js";
import { ApiResponse } from "../common/utils/apiResponse.js";
import { PaymentsService } from "./payments.service.js";

const paymentsService = new PaymentsService();
const idSchema = z.string().uuid();

export const recordPayment = asyncHandler(async (req: Request, res: Response) => {
  const { id: actorId, tenantId } = (req as any).user;
  const invoiceId = idSchema.parse(req.params.invoiceId);

  const payment = await paymentsService.recordPayment(invoiceId, req.body, { actorId, tenantId });

  return ApiResponse.created(res, "Payment recorded", payment);
});

export const listPayments = asyncHandler(async (req: Request, res: Response) => {
  const { tenantId } = (req as any).user;
  const invoiceId = idSchema.parse(req.params.invoiceId);

  const payments = await paymentsService.listPayments(invoiceId, tenantId);

  return ApiResponse.ok(res, "Payments retrieved", payments);
});

export const deletePayment = asyncHandler(async (req: Request, res: Response) => {
  const { id: actorId, tenantId } = (req as any).user;
  const invoiceId = idSchema.parse(req.params.invoiceId);
  const paymentId = idSchema.parse(req.params.paymentId);

  await paymentsService.deletePayment(paymentId, invoiceId, { actorId, tenantId });

  return ApiResponse.noContent(res);
});
