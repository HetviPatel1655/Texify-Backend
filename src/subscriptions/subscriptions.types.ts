export interface CreateSubscriptionDto {
  planId: string;
}

export interface VerifySubscriptionDto {
  razorpayPaymentId: string;
  razorpaySubscriptionId: string;
  razorpaySignature: string;
}

export interface CancelSubscriptionDto {
  cancelAtCycleEnd?: boolean;
}

export interface SubscriptionRecord {
  id: string;
  tenantId: string;
  razorpaySubscriptionId: string | null;
  razorpayCustomerId: string | null;
  razorpayPlanId: string | null;
  planName: string;
  status: string;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtCycleEnd: boolean;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
  payments: SubscriptionPaymentRecord[];
}

export interface SubscriptionPaymentRecord {
  id: string;
  razorpayPaymentId: string;
  amount: number;
  currency: string;
  status: string;
  paidAt: string | null;
  createdAt: string;
}
