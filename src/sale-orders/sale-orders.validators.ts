import { z } from "zod";

const optionalPositiveInt = z.preprocess((value) => {
  if (typeof value === "string" && value.trim().length === 0) return undefined;
  return value;
}, z.coerce.number().int().positive().optional());

const saleOrderItemSchema = z.object({
  productId: z.string().uuid().nullable().optional(),
  description: z.string().trim().min(1),
  designNo: z.string().trim().nullable().optional(),
  shadeName: z.string().trim().nullable().optional(),
  pieces: z.coerce.number().min(0).default(0),
  cut: z.coerce.number().min(0).default(0),
  quantity: z.coerce.number().min(0).default(0),
  rate: z.coerce.number().min(0).default(0),
  remarks: z.string().trim().nullable().optional(),
});

export const createSaleOrderSchema = z.object({
  orderDate: z.string().trim().optional(),
  partyId: z.string().uuid(),
  agentName: z.string().trim().nullable().optional(),
  partyMobileNo: z.string().trim().nullable().optional(),
  orderDueDays: z.coerce.number().int().min(0).nullable().optional(),
  orderDueDate: z.string().trim().nullable().optional(),
  billDueDays: z.coerce.number().int().min(0).nullable().optional(),
  remarks: z.string().trim().nullable().optional(),
  items: z.array(saleOrderItemSchema).min(1, "At least one item is required"),
});

export const updateSaleOrderSchema = z.object({
  orderDate: z.string().trim().optional(),
  partyId: z.string().uuid().optional(),
  agentName: z.string().trim().nullable().optional(),
  partyMobileNo: z.string().trim().nullable().optional(),
  status: z.enum(["OPEN", "COMPLETED", "CANCELLED"]).optional(),
  orderDueDays: z.coerce.number().int().min(0).nullable().optional(),
  orderDueDate: z.string().trim().nullable().optional(),
  billDueDays: z.coerce.number().int().min(0).nullable().optional(),
  remarks: z.string().trim().nullable().optional(),
  items: z.array(saleOrderItemSchema).min(1).optional(),
});

export const listSaleOrderQuerySchema = z.object({
  page: optionalPositiveInt,
  limit: optionalPositiveInt,
  sortBy: z.string().trim().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  search: z.string().trim().optional(),
  status: z.enum(["OPEN", "COMPLETED", "CANCELLED"]).optional(),
  partyId: z.string().uuid().optional(),
});
