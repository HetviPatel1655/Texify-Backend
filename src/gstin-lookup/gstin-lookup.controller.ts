import type { Request, Response } from "express";
import { lookupGstin } from "./gstin-lookup.service.js";
import { setApiKey, getKeyStatus } from "./gstin-key-manager.js";

export async function getGstinDetails(req: Request, res: Response) {
  const gstin = req.params.gstin as string;
  const result = await lookupGstin(gstin);
  res.json({ success: true, data: result });
}

export async function updateGstinApiKey(req: Request, res: Response) {
  const { apiKey } = req.body as { apiKey?: string };
  if (!apiKey || typeof apiKey !== "string" || apiKey.length < 8) {
    res.status(400).json({ success: false, message: "Provide a valid apiKey (min 8 chars)" });
    return;
  }
  await setApiKey(apiKey);
  res.json({ success: true, message: "API key updated, call counter reset" });
}

export async function getGstinKeyStatus(req: Request, res: Response) {
  const status = await getKeyStatus();
  res.json({ success: true, data: status });
}
