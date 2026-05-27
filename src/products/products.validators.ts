import { z } from "zod";

import { GSTTypes, UnitTypes } from "../common/constants/erp";

export const createProductSchema = z.object({
  sku: z.string().min(2),
  name: z.string().min(2),
  unitType: z.enum(UnitTypes),
  gstType: z.enum(GSTTypes).optional()
});

export const updateProductSchema = z.object({
  name: z.string().min(2).optional(),
  unitType: z.enum(UnitTypes).optional(),
  gstType: z.enum(GSTTypes).optional()
});
