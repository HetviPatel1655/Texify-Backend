import { z } from "zod";

import { PartyTypes } from "../common/constants/erp";

export const createPartySchema = z.object({
  code: z.string().min(2),
  name: z.string().min(2),
  partyType: z.enum(PartyTypes)
});

export const updatePartySchema = z.object({
  name: z.string().min(2).optional(),
  partyType: z.enum(PartyTypes).optional()
});
