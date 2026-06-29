import { z } from "zod";

const optionalPositiveInt = z.preprocess((value) => {
  if (typeof value === "string" && value.trim().length === 0) return undefined;
  return value;
}, z.coerce.number().int().positive().optional());

const adjustmentSchema = z.object({
  invoiceId: z.string().uuid(),
  amount: z.coerce.number().positive("Adjustment amount must be positive"),
});

export const createBankEntrySchema = z.object({
  type: z.enum(["SLIP", "CHEQUE"]),
  entryDate: z.string().trim().optional(),
  slipRecNo: z.string().trim().nullable().optional(),
  bankName: z.string().trim().min(1, "Bank name is required"),
  partyId: z.string().uuid(),
  chequeNo: z.string().trim().nullable().optional(),
  chequeDate: z.string().trim().nullable().optional(),
  amount: z.coerce.number().positive("Amount must be positive"),
  remarks: z.string().trim().nullable().optional(),
  billWisePayment: z.boolean().optional(),
  adjustments: z.array(adjustmentSchema).optional(),
});

export const updateBankEntrySchema = z.object({
  type: z.enum(["SLIP", "CHEQUE"]).optional(),
  entryDate: z.string().trim().optional(),
  slipRecNo: z.string().trim().nullable().optional(),
  bankName: z.string().trim().min(1).optional(),
  partyId: z.string().uuid().optional(),
  chequeNo: z.string().trim().nullable().optional(),
  chequeDate: z.string().trim().nullable().optional(),
  amount: z.coerce.number().positive().optional(),
  remarks: z.string().trim().nullable().optional(),
  billWisePayment: z.boolean().optional(),
  adjustments: z.array(adjustmentSchema).optional(),
});

export const listBankEntryQuerySchema = z.object({
  page: optionalPositiveInt,
  limit: optionalPositiveInt,
  sortBy: z.string().trim().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  search: z.string().trim().optional(),
  type: z.enum(["SLIP", "CHEQUE"]).optional(),
  partyId: z.string().uuid().optional(),
  fromDate: z.string().trim().optional(),
  toDate: z.string().trim().optional(),
});
