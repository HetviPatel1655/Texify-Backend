import { z } from "zod";

const attendanceEntrySchema = z.object({
  employeeId: z.string().uuid(),
  date: z.string().trim().min(1, "Date is required"),
  status: z.enum(["PRESENT", "ABSENT", "HALF_DAY"]),
});

export const bulkUpsertAttendanceSchema = z.object({
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2020).max(2100),
  entries: z.array(attendanceEntrySchema).min(1, "At least one entry is required"),
});

export const monthlyGridQuerySchema = z.object({
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2020).max(2100),
  employeeType: z.enum(["WEAVER", "HELPER", "SUPERVISOR", "WINDER", "WARPER", "OTHER"]).optional(),
});

export const salaryReportQuerySchema = z.object({
  fromDate: z.string().trim().min(1, "From date is required"),
  toDate: z.string().trim().min(1, "To date is required"),
  employeeType: z.enum(["WEAVER", "HELPER", "SUPERVISOR", "WINDER", "WARPER", "OTHER"]).optional(),
  employeeId: z.string().uuid().optional(),
  reportType: z.enum(["detailed", "summary"]).optional(),
});

export const workerSalaryReportQuerySchema = z.object({
  fromDate: z.string().trim().min(1, "From date is required"),
  toDate: z.string().trim().min(1, "To date is required"),
  dateType: z.enum(["foldingDate", "startingDate", "salaryDate"]).optional(),
  groupBy: z.enum(["worker", "firm"]).optional(),
  reportType: z.enum(["detailed", "summary"]).optional(),
  sortOn: z.enum(["firmWise", "workerWise", "greyWise"]).optional(),
  particular: z.string().trim().optional(),
});

export const patiaReportQuerySchema = z.object({
  fromDate: z.string().trim().min(1, "From date is required"),
  toDate: z.string().trim().min(1, "To date is required"),
  firmId: z.string().uuid().optional(),
  machineType: z.enum(["selected", "all"]).optional(),
  reportType: z.enum(["takaWise", "dateWise", "summary"]).optional(),
  machines: z.preprocess((val) => {
    if (typeof val === "string") return val.split(",").filter(Boolean);
    return val;
  }, z.array(z.string()).optional()),
});
