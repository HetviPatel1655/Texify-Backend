import { z } from "zod";

import { PartyTypes } from "../common/constants/erp";

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

function normalizePartyCode(name: string): string {
  const prefix = name
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 8) || "PTY";

  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${prefix}-${suffix}`;
}

const partyPayloadSchema = z
  .object({
    code: z.string().trim().min(2).optional(),
    name: z.string().trim().min(2),
    partyType: z.enum(PartyTypes),
    email: z.string().email().nullable().optional(),
    phone: z.string().min(5).nullable().optional(),
    gstin: z.string().min(5).nullable().optional(),
    gstNumber: z.string().min(5).nullable().optional(),
    panNo: z.string().min(10).max(10).nullable().optional(),
    address: z.string().min(2).nullable().optional(),
    billingAddress1: z.string().min(2).nullable().optional(),
    billingAddress2: z.string().min(2).nullable().optional(),
    billingCity: z.string().min(2).nullable().optional(),
    billingState: z.string().min(2).nullable().optional(),
    billingStateCode: z.string().min(1).nullable().optional(),
    billingPostalCode: z.string().min(2).nullable().optional(),
    billingCountry: z.string().min(2).nullable().optional(),
    shippingAddress1: z.string().min(2).nullable().optional(),
    shippingAddress2: z.string().min(2).nullable().optional(),
    shippingCity: z.string().min(2).nullable().optional(),
    shippingState: z.string().min(2).nullable().optional(),
    shippingStateCode: z.string().min(1).nullable().optional(),
    shippingPostalCode: z.string().min(2).nullable().optional(),
    shippingCountry: z.string().min(2).nullable().optional(),
    isActive: z.boolean().optional()
  })
  .transform((data) => ({
    code: data.code ?? normalizePartyCode(data.name),
    name: data.name,
    partyType: data.partyType,
    email: data.email,
    phone: data.phone,
    gstin: data.gstin ?? data.gstNumber,
    panNo: data.panNo,
    billingAddress1: data.billingAddress1 ?? data.address,
    billingAddress2: data.billingAddress2,
    billingCity: data.billingCity,
    billingState: data.billingState,
    billingStateCode: data.billingStateCode,
    billingPostalCode: data.billingPostalCode,
    billingCountry: data.billingCountry,
    shippingAddress1: data.shippingAddress1,
    shippingAddress2: data.shippingAddress2,
    shippingCity: data.shippingCity,
    shippingState: data.shippingState,
    shippingStateCode: data.shippingStateCode,
    shippingPostalCode: data.shippingPostalCode,
    shippingCountry: data.shippingCountry,
    isActive: data.isActive
  }));

export const createPartySchema = partyPayloadSchema;

export const updatePartySchema = z.object({
  name: z.string().min(2).optional(),
  partyType: z.enum(PartyTypes).optional(),
  email: z.string().email().nullable().optional(),
  phone: z.string().min(5).nullable().optional(),
  gstin: z.string().min(5).nullable().optional(),
  panNo: z.string().min(10).max(10).nullable().optional(),
  billingAddress1: z.string().min(2).nullable().optional(),
  billingAddress2: z.string().min(2).nullable().optional(),
  billingCity: z.string().min(2).nullable().optional(),
  billingState: z.string().min(2).nullable().optional(),
  billingStateCode: z.string().min(1).nullable().optional(),
  billingPostalCode: z.string().min(2).nullable().optional(),
  billingCountry: z.string().min(2).nullable().optional(),
  shippingAddress1: z.string().min(2).nullable().optional(),
  shippingAddress2: z.string().min(2).nullable().optional(),
  shippingCity: z.string().min(2).nullable().optional(),
  shippingState: z.string().min(2).nullable().optional(),
  shippingStateCode: z.string().min(1).nullable().optional(),
  shippingPostalCode: z.string().min(2).nullable().optional(),
  shippingCountry: z.string().min(2).nullable().optional(),
  isActive: z.boolean().optional()
});

export const listPartyQuerySchema = z.object({
  page: optionalPositiveInt,
  limit: optionalPositiveInt,
  sortBy: z.string().trim().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  search: z.string().trim().optional(),
  partyType: z.enum(PartyTypes).optional(),
  isActive: optionalBoolean
});
