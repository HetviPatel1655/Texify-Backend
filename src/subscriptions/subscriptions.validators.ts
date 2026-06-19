import { z } from "zod";

export const createSubscriptionSchema = z.object({
  planId: z.string().min(1, "Plan ID is required"),
});

export const verifySubscriptionSchema = z.object({
  razorpayPaymentId: z.string().min(1),
  razorpaySubscriptionId: z.string().min(1),
  razorpaySignature: z.string().min(1),
});

export const cancelSubscriptionSchema = z.object({
  cancelAtCycleEnd: z.boolean().optional().default(true),
});
