import { z } from "zod";

const optionalPositiveInt = z.preprocess((value) => {
  if (typeof value === "string" && value.trim().length === 0) return undefined;
  return value;
}, z.coerce.number().int().positive().optional());

const yarnPurchaseItemSchema = z.object({
  cartonNo: z.string().trim().min(1),
  itemName: z.string().trim().min(1),
  shadeName: z.string().trim().nullable().optional(),
  lotNo: z.string().trim().nullable().optional(),
  denier: z.string().trim().nullable().optional(),
  twist: z.string().trim().nullable().optional(),
  twistDirection: z.string().trim().nullable().optional(),
  cheese: z.coerce.number().min(0).default(0),
  grossWt: z.coerce.number().min(0).default(0),
  tareWt: z.coerce.number().min(0).default(0),
  rate: z.coerce.number().min(0).default(0),
});

export const createYarnPurchaseSchema = z.object({
  purchaseDate: z.string().trim().optional(),
  billNo: z.string().trim().nullable().optional(),
  billDate: z.string().trim().nullable().optional(),
  partyId: z.string().uuid(),
  billType: z.string().trim().optional(),
  igstRate: z.coerce.number().min(0).optional(),
  cgstRate: z.coerce.number().min(0).optional(),
  sgstRate: z.coerce.number().min(0).optional(),
  billAmount: z.coerce.number().min(0).optional(),
  adjustedAmount: z.coerce.number().min(0).optional(),
  gstReceived: z.boolean().optional(),
  billRemarks: z.string().trim().nullable().optional(),
  items: z.array(yarnPurchaseItemSchema).min(1, "At least one item is required"),
});

export const updateYarnPurchaseSchema = z.object({
  purchaseDate: z.string().trim().optional(),
  billNo: z.string().trim().nullable().optional(),
  billDate: z.string().trim().nullable().optional(),
  partyId: z.string().uuid().optional(),
  billType: z.string().trim().optional(),
  igstRate: z.coerce.number().min(0).optional(),
  cgstRate: z.coerce.number().min(0).optional(),
  sgstRate: z.coerce.number().min(0).optional(),
  billAmount: z.coerce.number().min(0).optional(),
  adjustedAmount: z.coerce.number().min(0).optional(),
  gstReceived: z.boolean().optional(),
  billRemarks: z.string().trim().nullable().optional(),
  items: z.array(yarnPurchaseItemSchema).min(1).optional(),
});

export const listYarnPurchaseQuerySchema = z.object({
  page: optionalPositiveInt,
  limit: optionalPositiveInt,
  sortBy: z.string().trim().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  search: z.string().trim().optional(),
  partyId: z.string().uuid().optional(),
});
