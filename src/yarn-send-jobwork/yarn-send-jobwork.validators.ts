import { z } from "zod";

const optionalPositiveInt = z.preprocess((value) => {
  if (typeof value === "string" && value.trim().length === 0) return undefined;
  return value;
}, z.coerce.number().int().positive().optional());

const yarnSendItemSchema = z.object({
  cartonNo: z.string().trim().min(1),
  itemName: z.string().trim().nullable().optional(),
  shadeName: z.string().trim().nullable().optional(),
  lotNo: z.string().trim().nullable().optional(),
  denier: z.string().trim().nullable().optional(),
  twist: z.string().trim().nullable().optional(),
  twistDirection: z.string().trim().nullable().optional(),
  cheese: z.coerce.number().min(0).default(0),
  grossWt: z.coerce.number().min(0).default(0),
  tareWt: z.coerce.number().min(0).default(0),
  netWt: z.coerce.number().min(0).default(0),
  remarks: z.string().trim().nullable().optional(),
});

export const createYarnSendSchema = z.object({
  challanDate: z.string().trim().optional(),
  challanNo: z.string().trim().nullable().optional(),
  firmId: z.string().uuid().nullable().optional(),
  partyId: z.string().uuid().nullable().optional(),
  goodsRate: z.coerce.number().min(0).default(0),
  goodsAmount: z.coerce.number().min(0).default(0),
  remarks: z.string().trim().nullable().optional(),
  items: z.array(yarnSendItemSchema).min(1),
});

export const updateYarnSendSchema = z.object({
  challanDate: z.string().trim().optional(),
  challanNo: z.string().trim().nullable().optional(),
  firmId: z.string().uuid().nullable().optional(),
  partyId: z.string().uuid().nullable().optional(),
  goodsRate: z.coerce.number().min(0).optional(),
  goodsAmount: z.coerce.number().min(0).optional(),
  remarks: z.string().trim().nullable().optional(),
  items: z.array(yarnSendItemSchema).min(1).optional(),
});

export const listYarnSendQuerySchema = z.object({
  page: optionalPositiveInt,
  limit: optionalPositiveInt,
  sortBy: z.string().trim().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  search: z.string().trim().optional(),
  firmId: z.string().uuid().optional(),
  partyId: z.string().uuid().optional(),
  dateFrom: z.string().trim().optional(),
  dateTo: z.string().trim().optional(),
});
