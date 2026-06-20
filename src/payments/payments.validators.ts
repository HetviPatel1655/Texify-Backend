import { z } from "zod";

export const recordPaymentSchema = z.object({
  amount: z.number().positive("Amount must be greater than 0"),
  method: z.enum(["CASH", "CHEQUE", "BANK_TRANSFER", "UPI"]),
  referenceNo: z.string().max(100).optional(),
  paymentDate: z.string().optional(),
  notes: z.string().max(500).optional(),
});
