import { z } from "zod";

const takaStatusEnum = z.enum(["IN_STOCK", "SOLD", "RETURNED", "SENT_TO_JOBWORK", "PROCESSING"]);

export const createTakaSchema = z.object({
  takaNo: z.string().optional(),
  takaPrefix: z.string().optional(),
  date: z.string().optional(),
  loomNo: z.string().optional(),
  beamId: z.string().uuid().optional(),
  firmId: z.string().uuid().optional(),
  itemName: z.string().optional(),
  grade: z.string().optional(),
  designNo: z.string().optional(),
  shadeName: z.string().optional(),
  meters: z.coerce.number().min(0).optional(),
  weight: z.coerce.number().min(0).optional(),
  sarees: z.coerce.number().int().min(0).optional(),
  pieces: z.coerce.number().int().min(0).optional(),
  cut: z.string().optional(),
  workerName: z.string().optional(),
  foldingDate: z.string().optional(),
  startingDate: z.string().optional(),
  cuttingDate: z.string().optional(),
  salaryDate: z.string().optional(),
  wtPerMtr: z.coerce.number().min(0).optional(),
  status: takaStatusEnum.optional(),
  isWithBeam: z.boolean().optional(),
  serialNoWiseTaka: z.boolean().optional(),
  remarks: z.string().optional(),
});

export const updateTakaSchema = createTakaSchema.partial();

export const createMultiTakasSchema = z.object({
  date: z.string().optional(),
  workerName: z.string().optional(),
  takaPrefix: z.string().optional(),
  serialNoWiseTaka: z.boolean().optional(),
  takas: z.array(createTakaSchema).min(1),
});

export const listTakaQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  status: z.string().optional(),
  isWithBeam: z.string().optional(),
  beamId: z.string().optional(),
  firmId: z.string().optional(),
  loomNo: z.string().optional(),
  itemName: z.string().optional(),
  grade: z.string().optional(),
  workerName: z.string().optional(),
  shadeName: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  dateType: z.string().optional(),
});
