import { z } from "zod";

export const createTenantSchema = z.object({
  companyName: z.string().min(2).max(100),
});
