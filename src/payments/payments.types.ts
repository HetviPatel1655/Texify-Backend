import type { PaymentMethod } from "@prisma/client";

export interface RecordPaymentDto {
  invoiceId: string;
  amount: number;
  method: PaymentMethod;
  referenceNo?: string;
  paymentDate?: string;
  notes?: string;
}

export interface PaymentDto {
  id: string;
  invoiceId: string;
  amount: string;
  method: PaymentMethod;
  referenceNo: string | null;
  paymentDate: string;
  notes: string | null;
  createdAt: string;
  createdById: string | null;
}
