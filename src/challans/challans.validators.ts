import { z } from "zod";

import { ChallanStatuses } from "../common/constants/erp";

const optionalPositiveInt = z.preprocess((value) => {
  if (typeof value === "string" && value.trim().length === 0) {
    return undefined;
  }

  return value;
}, z.coerce.number().int().positive().optional());

const optionalDate = z.preprocess((value) => {
  if (value === "" || value === null || value === undefined) {
    return undefined;
  }

  return value;
}, z.coerce.date().optional());

const rollEntrySchema = z.object({
  serialNumber: z.coerce.number().int().positive(),
  meters: z.coerce.number().positive()
});

const challanItemSchema = z.object({
  productId: z.string().uuid().nullable().optional(),
  description: z.string().min(1),
  quantity: z.coerce.number().positive(),
  unit: z.string().min(1),
  unitType: z.string().min(1),
  rate: z.coerce.number().min(0),
  discountAmount: z.coerce.number().min(0).optional().default(0),
  gstRate: z.coerce.number().min(0).optional().default(0),
  rollEntries: z.array(rollEntrySchema).optional()
});

export const createChallanSchema = z.object({
  partyId: z.string().uuid(),
  issueDate: optionalDate,
  agentName: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  terms: z.string().nullable().optional(),
  remark: z.string().nullable().optional(),
  transportMode: z.string().nullable().optional(),
  vehicleNumber: z.string().nullable().optional(),
  placeOfSupply: z.string().nullable().optional(),
  deliveryPartyName: z.string().nullable().optional(),
  deliveryAddress1: z.string().nullable().optional(),
  deliveryAddress2: z.string().nullable().optional(),
  deliveryCity: z.string().nullable().optional(),
  deliveryState: z.string().nullable().optional(),
  deliveryPostalCode: z.string().nullable().optional(),
  deliveryGstin: z.string().nullable().optional(),
  deliveryPhone: z.string().nullable().optional(),
  items: z.array(challanItemSchema).min(1)
});

export const updateChallanSchema = z.object({
  status: z.enum(ChallanStatuses).optional(),
  agentName: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  terms: z.string().nullable().optional(),
  remark: z.string().nullable().optional(),
  transportMode: z.string().nullable().optional(),
  vehicleNumber: z.string().nullable().optional(),
  placeOfSupply: z.string().nullable().optional(),
  deliveryPartyName: z.string().nullable().optional(),
  deliveryAddress1: z.string().nullable().optional(),
  deliveryAddress2: z.string().nullable().optional(),
  deliveryCity: z.string().nullable().optional(),
  deliveryState: z.string().nullable().optional(),
  deliveryPostalCode: z.string().nullable().optional(),
  deliveryGstin: z.string().nullable().optional(),
  deliveryPhone: z.string().nullable().optional(),
  items: z.array(challanItemSchema).min(1).optional()
});

export const listChallanQuerySchema = z.object({
  page: optionalPositiveInt,
  limit: optionalPositiveInt,
  sortBy: z.string().trim().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  search: z.string().trim().optional(),
  status: z.enum(ChallanStatuses).optional(),
  partyId: z.string().uuid().optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional()
});
