import { z } from "zod";

const optionalPositiveInt = z.preprocess((value) => {
  if (typeof value === "string" && value.trim().length === 0) return undefined;
  return value;
}, z.coerce.number().int().positive().optional());

const takaReceiveItemSchema = z.object({
  takaNo: z.string().trim().min(1),
  loomNo: z.string().trim().nullable().optional(),
  meters: z.coerce.number().min(0).default(0),
  weight: z.coerce.number().min(0).default(0),
  itemName: z.string().trim().nullable().optional(),
  avgWeight: z.coerce.number().min(0).default(0),
  shouldBeWeight: z.coerce.number().min(0).default(0),
  weightDiff: z.coerce.number().default(0),
  grade: z.string().trim().nullable().optional(),
  designNo: z.string().trim().nullable().optional(),
  shadeName: z.string().trim().nullable().optional(),
  beamTakaNo: z.string().trim().nullable().optional(),
  cut: z.string().trim().nullable().optional(),
  sarees: z.coerce.number().int().min(0).default(0),
  remarks: z.string().trim().nullable().optional(),
});

export const createTakaReceiveSchema = z.object({
  challanDate: z.string().trim().optional(),
  challanNo: z.string().trim().nullable().optional(),
  partyId: z.string().uuid().nullable().optional(),
  firmId: z.string().uuid().nullable().optional(),
  qualityName: z.string().trim().nullable().optional(),
  takaPrefix: z.string().trim().nullable().optional(),
  lotNo: z.string().trim().nullable().optional(),
  withBeam: z.boolean().default(false),
  originalChallanNo: z.string().trim().nullable().optional(),
  originalChallanDate: z.string().trim().nullable().optional(),
  goodsRate: z.coerce.number().min(0).default(0),
  goodsAmount: z.coerce.number().min(0).default(0),
  remarks: z.string().trim().nullable().optional(),
  items: z.array(takaReceiveItemSchema).min(1),
});

export const updateTakaReceiveSchema = z.object({
  challanDate: z.string().trim().optional(),
  challanNo: z.string().trim().nullable().optional(),
  partyId: z.string().uuid().nullable().optional(),
  firmId: z.string().uuid().nullable().optional(),
  qualityName: z.string().trim().nullable().optional(),
  takaPrefix: z.string().trim().nullable().optional(),
  lotNo: z.string().trim().nullable().optional(),
  withBeam: z.boolean().optional(),
  originalChallanNo: z.string().trim().nullable().optional(),
  originalChallanDate: z.string().trim().nullable().optional(),
  goodsRate: z.coerce.number().min(0).optional(),
  goodsAmount: z.coerce.number().min(0).optional(),
  remarks: z.string().trim().nullable().optional(),
  items: z.array(takaReceiveItemSchema).min(1).optional(),
});

export const listTakaReceiveQuerySchema = z.object({
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
