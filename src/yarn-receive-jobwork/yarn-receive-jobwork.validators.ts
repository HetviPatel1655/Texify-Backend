import { z } from "zod";

const optionalPositiveInt = z.preprocess((value) => {
  if (typeof value === "string" && value.trim().length === 0) return undefined;
  return value;
}, z.coerce.number().int().positive().optional());

export const createYarnReceiveSchema = z.object({
  challanDate: z.string().trim().optional(),
  challanNo: z.string().trim().nullable().optional(),
  partyId: z.string().uuid().nullable().optional(),
  yarnName: z.string().trim().nullable().optional(),
  shadeName: z.string().trim().nullable().optional(),
  emptyRollWt: z.coerce.number().min(0).default(0),
  lotNo: z.string().trim().nullable().optional(),
  denier: z.string().trim().nullable().optional(),
  twist: z.string().trim().nullable().optional(),
  cages: z.coerce.number().int().min(0).default(0),
  rolls: z.coerce.number().int().min(0).default(0),
  grossWt: z.coerce.number().min(0).default(0),
  tareWt: z.coerce.number().min(0).default(0),
  netWt: z.coerce.number().min(0).default(0),
  goodsRate: z.coerce.number().min(0).default(0),
  goodsAmount: z.coerce.number().min(0).default(0),
  deptName: z.string().trim().nullable().optional(),
  originalChallanNo: z.string().trim().nullable().optional(),
  originalChallanDate: z.string().trim().nullable().optional(),
  remarks: z.string().trim().nullable().optional(),
});

export const updateYarnReceiveSchema = z.object({
  challanDate: z.string().trim().optional(),
  challanNo: z.string().trim().nullable().optional(),
  partyId: z.string().uuid().nullable().optional(),
  yarnName: z.string().trim().nullable().optional(),
  shadeName: z.string().trim().nullable().optional(),
  emptyRollWt: z.coerce.number().min(0).optional(),
  lotNo: z.string().trim().nullable().optional(),
  denier: z.string().trim().nullable().optional(),
  twist: z.string().trim().nullable().optional(),
  cages: z.coerce.number().int().min(0).optional(),
  rolls: z.coerce.number().int().min(0).optional(),
  grossWt: z.coerce.number().min(0).optional(),
  tareWt: z.coerce.number().min(0).optional(),
  netWt: z.coerce.number().min(0).optional(),
  goodsRate: z.coerce.number().min(0).optional(),
  goodsAmount: z.coerce.number().min(0).optional(),
  deptName: z.string().trim().nullable().optional(),
  originalChallanNo: z.string().trim().nullable().optional(),
  originalChallanDate: z.string().trim().nullable().optional(),
  remarks: z.string().trim().nullable().optional(),
});

export const listYarnReceiveQuerySchema = z.object({
  page: optionalPositiveInt,
  limit: optionalPositiveInt,
  sortBy: z.string().trim().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  search: z.string().trim().optional(),
  partyId: z.string().uuid().optional(),
  dateFrom: z.string().trim().optional(),
  dateTo: z.string().trim().optional(),
});
