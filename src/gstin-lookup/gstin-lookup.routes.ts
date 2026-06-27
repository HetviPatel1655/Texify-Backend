import { Router } from "express";
import { asyncHandler } from "../common/middleware/asyncHandler";
import { authMiddleware } from "../auth/auth.middleware";
import { featureGate } from "../feature-gate/feature-gate.middleware";
import { getGstinDetails, updateGstinApiKey, getGstinKeyStatus } from "./gstin-lookup.controller";

const gstinLookupRouter = Router();

gstinLookupRouter.get("/key-status", authMiddleware, asyncHandler(getGstinKeyStatus));
gstinLookupRouter.post("/key", authMiddleware, asyncHandler(updateGstinApiKey));
gstinLookupRouter.get("/:gstin", authMiddleware, featureGate("gstin:lookup"), asyncHandler(getGstinDetails));

export { gstinLookupRouter };
