import { z } from "zod";

import { GSTTypes, UnitTypes } from "../common/constants/erp";

const optionalBoolean = z.preprocess((value) => {
  if (value === "true") return true;
  if (value === "false") return false;
  return value;
}, z.boolean().optional());

const optionalPositiveInt = z.preprocess((value) => {
  if (typeof value === "string" && value.trim().length === 0) {
    return undefined;
  }

  return value;
}, z.coerce.number().int().positive().optional());

export const createProductSchema = z.object({
  sku: z.string().min(2),
  name: z.string().min(2),
  description: z.string().nullable().optional(),
  hsnCode: z.string().nullable().optional(),
  unitType: z.enum(UnitTypes),
  gstType: z.enum(GSTTypes).optional(),
  gstRate: z.coerce.number().min(0).default(0),
  purchaseRate: z.coerce.number().min(0).default(0),
  sellingRate: z.coerce.number().min(0).default(0),
  trackInventory: z.boolean().optional().default(false),
  openingStock: z.coerce.number().min(0).default(0),
  reorderLevel: z.coerce.number().min(0).default(0),
  isActive: z.boolean().optional()
});

export const updateProductSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().nullable().optional(),
  hsnCode: z.string().nullable().optional(),
  unitType: z.enum(UnitTypes).optional(),
  gstType: z.enum(GSTTypes).optional(),
  gstRate: z.coerce.number().min(0).optional(),
  purchaseRate: z.coerce.number().min(0).optional(),
  sellingRate: z.coerce.number().min(0).optional(),
  trackInventory: z.boolean().optional(),
  openingStock: z.coerce.number().min(0).optional(),
  reorderLevel: z.coerce.number().min(0).optional(),
  isActive: z.boolean().optional()
});

export const listProductQuerySchema = z.object({
  page: optionalPositiveInt,
  limit: optionalPositiveInt,
  sortBy: z.string().trim().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  search: z.string().trim().optional(),
  unitType: z.enum(UnitTypes).optional(),
  gstType: z.enum(GSTTypes).optional(),
  isActive: optionalBoolean
});
