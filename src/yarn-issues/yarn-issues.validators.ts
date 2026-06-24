import { z } from "zod";

const optionalPositiveInt = z.preprocess((value) => {
  if (typeof value === "string" && value.trim().length === 0) return undefined;
  return value;
}, z.coerce.number().int().positive().optional());

export const createYarnIssueSchema = z.object({
  issueDate: z.string().trim().optional(),
  cartonNo: z.string().trim().min(1),
  yarnName: z.string().trim().nullable().optional(),
  lotNo: z.string().trim().nullable().optional(),
  twistDirection: z.string().trim().nullable().optional(),
  cheese: z.coerce.number().min(0).default(0),
  netWt: z.coerce.number().min(0).default(0),
  amount: z.coerce.number().min(0).default(0),
  shadeName: z.string().trim().nullable().optional(),
  deptName: z.string().trim().optional(),
  remarks: z.string().trim().nullable().optional(),
});

export const updateYarnIssueSchema = z.object({
  issueDate: z.string().trim().optional(),
  cartonNo: z.string().trim().min(1).optional(),
  yarnName: z.string().trim().nullable().optional(),
  lotNo: z.string().trim().nullable().optional(),
  twistDirection: z.string().trim().nullable().optional(),
  cheese: z.coerce.number().min(0).optional(),
  netWt: z.coerce.number().min(0).optional(),
  amount: z.coerce.number().min(0).optional(),
  shadeName: z.string().trim().nullable().optional(),
  deptName: z.string().trim().optional(),
  remarks: z.string().trim().nullable().optional(),
});

export const listYarnIssueQuerySchema = z.object({
  page: optionalPositiveInt,
  limit: optionalPositiveInt,
  sortBy: z.string().trim().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  search: z.string().trim().optional(),
  cartonNo: z.string().trim().optional(),
  deptName: z.string().trim().optional(),
});
