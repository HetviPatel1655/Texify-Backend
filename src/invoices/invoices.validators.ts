import { z } from "zod";

import { GSTTypes, InvoiceStatuses, PaymentStatuses } from "../common/constants/erp";

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

const optionalDateQuery = z.preprocess((value) => {
  if (typeof value !== "string" || value.trim().length === 0) {
    return undefined;
  }

  return value;
}, z.string().refine((value) => !Number.isNaN(new Date(value).getTime()), "Invalid date").optional());

const invoiceItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.coerce.number().positive(),
  unitPrice: z.coerce.number().min(0),
  pieces: z.coerce.number().min(0).nullable().optional()
});

export const createInvoiceSchema = z.object({
  partyId: z.string().uuid(),
  invoiceDate: optionalDate,
  gstType: z.enum(GSTTypes),
  discount: z.coerce.number().min(0).optional().default(0),
  dueDate: optionalDate,
  dueDays: z.coerce.number().int().min(0).nullable().optional(),
  orderNo: z.string().nullable().optional(),
  agentName: z.string().nullable().optional(),
  transporterName: z.string().nullable().optional(),
  transportMode: z.string().nullable().optional(),
  vehicleNumber: z.string().nullable().optional(),
  lrNo: z.string().nullable().optional(),
  eWayBillNo: z.string().nullable().optional(),
  placeOfSupply: z.string().nullable().optional(),
  challanId: z.string().uuid().nullable().optional(),
  notes: z.string().nullable().optional(),
  terms: z.string().nullable().optional(),
  remark: z.string().nullable().optional(),
  interestRate: z.coerce.number().min(0).max(100).nullable().optional(),
  bankName: z.string().nullable().optional(),
  bankAccountNo: z.string().nullable().optional(),
  bankIfsc: z.string().nullable().optional(),
  bankBranch: z.string().nullable().optional(),
  items: z.array(invoiceItemSchema).min(1)
});

export const updateInvoiceSchema = z.object({
  partyId: z.string().uuid().optional(),
  invoiceDate: optionalDate,
  gstType: z.enum(GSTTypes).optional(),
  discount: z.coerce.number().min(0).optional(),
  status: z.enum(InvoiceStatuses).optional(),
  paymentStatus: z.enum(PaymentStatuses).optional(),
  dueDate: optionalDate,
  dueDays: z.coerce.number().int().min(0).nullable().optional(),
  orderNo: z.string().nullable().optional(),
  agentName: z.string().nullable().optional(),
  transporterName: z.string().nullable().optional(),
  transportMode: z.string().nullable().optional(),
  vehicleNumber: z.string().nullable().optional(),
  lrNo: z.string().nullable().optional(),
  eWayBillNo: z.string().nullable().optional(),
  placeOfSupply: z.string().nullable().optional(),
  challanId: z.string().uuid().nullable().optional(),
  notes: z.string().nullable().optional(),
  terms: z.string().nullable().optional(),
  remark: z.string().nullable().optional(),
  interestRate: z.coerce.number().min(0).max(100).nullable().optional(),
  bankName: z.string().nullable().optional(),
  bankAccountNo: z.string().nullable().optional(),
  bankIfsc: z.string().nullable().optional(),
  bankBranch: z.string().nullable().optional(),
  items: z.array(invoiceItemSchema).min(1).optional()
});

export const listInvoiceQuerySchema = z.object({
  page: optionalPositiveInt,
  limit: optionalPositiveInt,
  sortBy: z.string().trim().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  search: z.string().trim().optional(),
  status: z.enum(InvoiceStatuses).optional(),
  paymentStatus: z.enum(PaymentStatuses).optional(),
  partyId: z.string().uuid().optional(),
  fromDate: optionalDateQuery,
  toDate: optionalDateQuery
});
