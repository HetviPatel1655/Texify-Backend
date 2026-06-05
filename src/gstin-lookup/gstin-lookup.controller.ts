import type { Request, Response } from "express";
import { lookupGstin } from "./gstin-lookup.service.js";

export async function getGstinDetails(req: Request, res: Response) {
  const gstin = req.params.gstin as string;
  const result = await lookupGstin(gstin);
  res.json({ success: true, data: result });
}
