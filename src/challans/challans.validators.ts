import { z } from "zod";

import { ChallanStatuses } from "../common/constants/erp";

export const createChallanSchema = z.object({
  partyId: z.string().uuid(),
  issueDate: z.coerce.date().optional()
});

export const updateChallanSchema = z.object({
  status: z.enum(ChallanStatuses).optional()
});
