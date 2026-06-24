import { z } from "zod";

export const createGreyTPSchema = z.object({
  takaNo: z.string().min(1, "Taka No is required"),
  date: z.string().optional(),
  newMeters: z.coerce.number().min(0),
  newWeight: z.coerce.number().min(0),
  newSarees: z.coerce.number().int().min(0),
  remark: z.string().optional(),
});

export const updateGreyTPSchema = z.object({
  date: z.string().optional(),
  newMeters: z.coerce.number().min(0).optional(),
  newWeight: z.coerce.number().min(0).optional(),
  newSarees: z.coerce.number().int().min(0).optional(),
  remark: z.string().optional(),
});

export const listGreyTPQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  takaId: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});
