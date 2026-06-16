import { Router } from "express";
import { asyncHandler } from "../common/middleware/asyncHandler.js";
import { authMiddleware } from "../auth/auth.middleware.js";
import { getGstinDetails, updateGstinApiKey, getGstinKeyStatus } from "./gstin-lookup.controller.js";

const gstinLookupRouter = Router();

gstinLookupRouter.get("/key-status", authMiddleware, asyncHandler(getGstinKeyStatus));
gstinLookupRouter.post("/key", authMiddleware, asyncHandler(updateGstinApiKey));
gstinLookupRouter.get("/:gstin", authMiddleware, asyncHandler(getGstinDetails));

export { gstinLookupRouter };
