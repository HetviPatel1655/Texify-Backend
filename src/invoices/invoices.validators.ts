import { z } from "zod";

import { InvoiceStatuses, PaymentStatuses } from "../common/constants/erp";

export const createInvoiceSchema = z.object({
  partyId: z.string().uuid(),
  issueDate: z.coerce.date().optional()
});

export const updateInvoiceSchema = z.object({
  status: z.enum(InvoiceStatuses).optional(),
  paymentStatus: z.enum(PaymentStatuses).optional()
});
