import { Router } from "express";
import { asyncHandler } from "../common/middleware/asyncHandler.js";
import { authMiddleware } from "../auth/auth.middleware.js";
import { getGstinDetails } from "./gstin-lookup.controller.js";

const gstinLookupRouter = Router();

gstinLookupRouter.get("/:gstin", authMiddleware, asyncHandler(getGstinDetails));

export { gstinLookupRouter };
