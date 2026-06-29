import { z } from "zod";

const optionalPositiveInt = z.preprocess((value) => {
  if (typeof value === "string" && value.trim().length === 0) return undefined;
  return value;
}, z.coerce.number().int().positive().optional());

export const createEmployeeSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  employeeType: z.enum(["WEAVER", "HELPER", "SUPERVISOR", "WINDER", "WARPER", "OTHER"]),
  dailyRate: z.coerce.number().min(0, "Daily rate cannot be negative"),
  isActive: z.boolean().optional(),
});

export const updateEmployeeSchema = z.object({
  name: z.string().trim().min(2).optional(),
  employeeType: z.enum(["WEAVER", "HELPER", "SUPERVISOR", "WINDER", "WARPER", "OTHER"]).optional(),
  dailyRate: z.coerce.number().min(0).optional(),
  isActive: z.boolean().optional(),
});

export const listEmployeeQuerySchema = z.object({
  page: optionalPositiveInt,
  limit: optionalPositiveInt,
  sortBy: z.string().trim().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  search: z.string().trim().optional(),
  employeeType: z.enum(["WEAVER", "HELPER", "SUPERVISOR", "WINDER", "WARPER", "OTHER"]).optional(),
  isActive: z.string().trim().optional(),
});
