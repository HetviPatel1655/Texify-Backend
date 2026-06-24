import { z } from "zod";

const optionalPositiveInt = z.preprocess((value) => {
  if (typeof value === "string" && value.trim().length === 0) return undefined;
  return value;
}, z.coerce.number().int().positive().optional());

const orderItemSchema = z.object({
  productId: z.string().uuid().nullable().optional(),
  description: z.string().trim().min(1),
  pieces: z.coerce.number().min(0).default(0),
  quantity: z.coerce.number().min(0).default(0),
  rate: z.coerce.number().min(0).default(0),
  remarks: z.string().trim().nullable().optional(),
});

export const createPurchaseOrderSchema = z.object({
  orderDate: z.string().trim().optional(),
  partyId: z.string().uuid(),
  remarks: z.string().trim().nullable().optional(),
  items: z.array(orderItemSchema).min(1, "At least one item is required"),
});

export const updatePurchaseOrderSchema = z.object({
  orderDate: z.string().trim().optional(),
  partyId: z.string().uuid().optional(),
  status: z.enum(["OPEN", "COMPLETED", "CANCELLED"]).optional(),
  remarks: z.string().trim().nullable().optional(),
  items: z.array(orderItemSchema).min(1).optional(),
});

export const listPurchaseOrderQuerySchema = z.object({
  page: optionalPositiveInt,
  limit: optionalPositiveInt,
  sortBy: z.string().trim().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  search: z.string().trim().optional(),
  status: z.enum(["OPEN", "COMPLETED", "CANCELLED"]).optional(),
  partyId: z.string().uuid().optional(),
});
