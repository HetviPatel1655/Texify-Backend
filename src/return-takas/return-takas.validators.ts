import { z } from "zod";

export const createReturnTakaSchema = z.object({
  takaNo: z.string().min(1, "Taka No is required"),
  returnDate: z.string().optional(),
  partyId: z.string().uuid().optional(),
  challanNo: z.string().optional(),
  rate: z.coerce.number().min(0).optional(),
  remarks: z.string().optional(),
});

export const updateReturnTakaSchema = z.object({
  returnDate: z.string().optional(),
  partyId: z.string().uuid().optional(),
  challanNo: z.string().optional(),
  rate: z.coerce.number().min(0).optional(),
  remarks: z.string().optional(),
});

export const listReturnTakaQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  takaId: z.string().optional(),
  partyId: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});
