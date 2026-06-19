import type { Request, Response } from "express";
import { asyncHandler } from "../common/middleware/asyncHandler.js";
import { ApiResponse } from "../common/utils/apiResponse.js";
import { SubscriptionsService } from "./subscriptions.service.js";

export const getSubscription = asyncHandler(async (req: Request, res: Response) => {
  const { tenantId } = (req as any).user;
  const subscription = await SubscriptionsService.getSubscription(tenantId);
  ApiResponse.ok(res, "Subscription retrieved", subscription);
});

export const createSubscription = asyncHandler(async (req: Request, res: Response) => {
  const { tenantId } = (req as any).user;
  const result = await SubscriptionsService.createSubscription(tenantId, req.body);
  ApiResponse.created(res, "Subscription created", result);
});

export const verifySubscription = asyncHandler(async (req: Request, res: Response) => {
  const { tenantId } = (req as any).user;
  const result = await SubscriptionsService.verifySubscription(tenantId, req.body);
  ApiResponse.ok(res, "Subscription verified", result);
});

export const cancelSubscription = asyncHandler(async (req: Request, res: Response) => {
  const { tenantId } = (req as any).user;
  const result = await SubscriptionsService.cancelSubscription(tenantId, req.body);
  ApiResponse.ok(res, "Subscription cancelled", result);
});

export const webhook = asyncHandler(async (req: Request, res: Response) => {
  const signature = req.headers["x-razorpay-signature"] as string;
  const rawBody = (req as any).rawBody as string;

  if (!signature || !rawBody) {
    return res.status(400).json({ success: false, message: "Missing signature or body" });
  }

  await SubscriptionsService.handleWebhook(rawBody, signature);
  res.status(200).json({ success: true });
});
