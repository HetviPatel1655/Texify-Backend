import { z } from "zod";

export const upsertCompanyProfileSchema = z.object({
  companyName: z.string().trim().min(2),
  tagline: z.string().nullable().optional(),
  logoUrl: z.string().nullable().optional(),
  businessType: z.string().nullable().optional(),
  address1: z.string().trim().min(2),
  address2: z.string().nullable().optional(),
  city: z.string().trim().min(2),
  state: z.string().trim().min(2),
  stateCode: z.string().trim().min(1),
  postalCode: z.string().nullable().optional(),
  country: z.string().trim().min(2).optional().default("India"),
  phone: z.string().nullable().optional(),
  email: z.string().email().nullable().optional(),
  gstin: z.string().trim().min(15).max(15),
  pan: z.string().trim().min(10).max(10).nullable().optional(),
  msme: z.string().nullable().optional(),
  bankName: z.string().nullable().optional(),
  bankAccountNo: z.string().nullable().optional(),
  bankIfsc: z.string().nullable().optional(),
  bankBranch: z.string().nullable().optional(),
  defaultTerms: z.string().nullable().optional(),
  defaultNotes: z.string().nullable().optional(),
  interestRate: z.coerce.number().min(0).max(100).optional().default(0),
  jurisdiction: z.string().nullable().optional()
});
