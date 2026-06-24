import { z } from "zod";

const optionalPositiveInt = z.preprocess((value) => {
  if (typeof value === "string" && value.trim().length === 0) return undefined;
  return value;
}, z.coerce.number().int().positive().optional());

const beamStatusEnum = z.enum([
  "NOT_LOADED",
  "UNDER_PRODUCTION",
  "SENT_TO_JOBWORK",
  "BHIRAN_ONLY",
  "UNDER_PRI_LOADED",
  "BEAM_STOCK",
  "BEAM_COMPLETED",
]);

export const createBeamSchema = z.object({
  beamDate: z.string().trim().optional(),
  beamPipeNo: z.string().trim().nullable().optional(),
  itemName: z.string().trim().nullable().optional(),
  yarnName: z.string().trim().nullable().optional(),
  lotNo: z.string().trim().nullable().optional(),
  ends: z.coerce.number().int().min(0).default(0),
  takas: z.coerce.number().min(0).default(0),
  meters: z.coerce.number().min(0).default(0),
  grossWt: z.coerce.number().min(0).default(0),
  tareWt: z.coerce.number().min(0).default(0),
  pootha: z.coerce.number().min(0).default(0),
  beamPosition: z.string().trim().nullable().optional(),
  plannedMeters: z.coerce.number().min(0).default(0),
  plannedTakas: z.coerce.number().min(0).default(0),
  shortPercent: z.coerce.number().min(0).default(0),
  bhiran: z.coerce.number().min(0).default(0),
  status: beamStatusEnum.default("NOT_LOADED"),
  partyId: z.string().uuid().nullable().optional(),
  warperName: z.string().trim().nullable().optional(),
  loomNo: z.string().trim().nullable().optional(),
  remarks: z.string().trim().nullable().optional(),
});

export const updateBeamSchema = z.object({
  beamDate: z.string().trim().optional(),
  beamPipeNo: z.string().trim().nullable().optional(),
  itemName: z.string().trim().nullable().optional(),
  yarnName: z.string().trim().nullable().optional(),
  lotNo: z.string().trim().nullable().optional(),
  ends: z.coerce.number().int().min(0).optional(),
  takas: z.coerce.number().min(0).optional(),
  meters: z.coerce.number().min(0).optional(),
  grossWt: z.coerce.number().min(0).optional(),
  tareWt: z.coerce.number().min(0).optional(),
  pootha: z.coerce.number().min(0).optional(),
  beamPosition: z.string().trim().nullable().optional(),
  plannedMeters: z.coerce.number().min(0).optional(),
  plannedTakas: z.coerce.number().min(0).optional(),
  shortPercent: z.coerce.number().min(0).optional(),
  bhiran: z.coerce.number().min(0).optional(),
  status: beamStatusEnum.optional(),
  partyId: z.string().uuid().nullable().optional(),
  warperName: z.string().trim().nullable().optional(),
  loomNo: z.string().trim().nullable().optional(),
  remarks: z.string().trim().nullable().optional(),
});

export const listBeamQuerySchema = z.object({
  page: optionalPositiveInt,
  limit: optionalPositiveInt,
  sortBy: z.string().trim().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  search: z.string().trim().optional(),
  status: beamStatusEnum.optional(),
  partyId: z.string().uuid().optional(),
  itemName: z.string().trim().optional(),
  warperName: z.string().trim().optional(),
  loomNo: z.string().trim().optional(),
  beamPipeNo: z.string().trim().optional(),
  dateFrom: z.string().trim().optional(),
  dateTo: z.string().trim().optional(),
});
