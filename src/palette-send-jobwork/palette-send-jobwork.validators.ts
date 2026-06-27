import { z } from "zod";

const optionalPositiveInt = z.preprocess((value) => {
  if (typeof value === "string" && value.trim().length === 0) return undefined;
  return value;
}, z.coerce.number().int().positive().optional());

export const createPaletteSendSchema = z.object({
  challanDate: z.string().trim().optional(),
  challanNo: z.string().trim().nullable().optional(),
  partyId: z.string().uuid().nullable().optional(),
  paletteNo: z.string().trim().nullable().optional(),
  denier: z.string().trim().nullable().optional(),
  yarnName: z.string().trim().nullable().optional(),
  cheese: z.coerce.number().min(0).default(0),
  lotNo: z.string().trim().nullable().optional(),
  netWt: z.coerce.number().min(0).default(0),
  amount: z.coerce.number().min(0).default(0),
  pendingCheese: z.coerce.number().min(0).default(0),
  issueCheese: z.coerce.number().min(0).default(0),
  pendingNetWt: z.coerce.number().min(0).default(0),
  issueNetWt: z.coerce.number().min(0).default(0),
  remarks: z.string().trim().nullable().optional(),
});

export const updatePaletteSendSchema = z.object({
  challanDate: z.string().trim().optional(),
  challanNo: z.string().trim().nullable().optional(),
  partyId: z.string().uuid().nullable().optional(),
  paletteNo: z.string().trim().nullable().optional(),
  denier: z.string().trim().nullable().optional(),
  yarnName: z.string().trim().nullable().optional(),
  cheese: z.coerce.number().min(0).optional(),
  lotNo: z.string().trim().nullable().optional(),
  netWt: z.coerce.number().min(0).optional(),
  amount: z.coerce.number().min(0).optional(),
  pendingCheese: z.coerce.number().min(0).optional(),
  issueCheese: z.coerce.number().min(0).optional(),
  pendingNetWt: z.coerce.number().min(0).optional(),
  issueNetWt: z.coerce.number().min(0).optional(),
  remarks: z.string().trim().nullable().optional(),
});

export const listPaletteSendQuerySchema = z.object({
  page: optionalPositiveInt,
  limit: optionalPositiveInt,
  sortBy: z.string().trim().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  search: z.string().trim().optional(),
  partyId: z.string().uuid().optional(),
  dateFrom: z.string().trim().optional(),
  dateTo: z.string().trim().optional(),
});
