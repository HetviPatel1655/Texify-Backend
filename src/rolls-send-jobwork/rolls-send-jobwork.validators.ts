import { z } from "zod";

const optionalPositiveInt = z.preprocess((value) => {
  if (typeof value === "string" && value.trim().length === 0) return undefined;
  return value;
}, z.coerce.number().int().positive().optional());

export const createRollsSendSchema = z.object({
  challanDate: z.string().trim().optional(),
  challanNo: z.string().trim().nullable().optional(),
  partyId: z.string().uuid().nullable().optional(),
  yarnName: z.string().trim().nullable().optional(),
  lotNo: z.string().trim().nullable().optional(),
  cages: z.coerce.number().int().min(0).default(0),
  rolls: z.coerce.number().int().min(0).default(0),
  grossWt: z.coerce.number().min(0).default(0),
  tareWt: z.coerce.number().min(0).default(0),
  netWt: z.coerce.number().min(0).default(0),
  emptyRollWt: z.coerce.number().min(0).default(0),
  remarks: z.string().trim().nullable().optional(),
});

export const updateRollsSendSchema = z.object({
  challanDate: z.string().trim().optional(),
  challanNo: z.string().trim().nullable().optional(),
  partyId: z.string().uuid().nullable().optional(),
  yarnName: z.string().trim().nullable().optional(),
  lotNo: z.string().trim().nullable().optional(),
  cages: z.coerce.number().int().min(0).optional(),
  rolls: z.coerce.number().int().min(0).optional(),
  grossWt: z.coerce.number().min(0).optional(),
  tareWt: z.coerce.number().min(0).optional(),
  netWt: z.coerce.number().min(0).optional(),
  emptyRollWt: z.coerce.number().min(0).optional(),
  remarks: z.string().trim().nullable().optional(),
});

export const listRollsSendQuerySchema = z.object({
  page: optionalPositiveInt,
  limit: optionalPositiveInt,
  sortBy: z.string().trim().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  search: z.string().trim().optional(),
  partyId: z.string().uuid().optional(),
  dateFrom: z.string().trim().optional(),
  dateTo: z.string().trim().optional(),
});
