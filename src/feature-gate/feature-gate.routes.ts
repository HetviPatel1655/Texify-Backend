import { Router } from "express";
import { authMiddleware } from "../auth/auth.middleware.js";
import { getUsage } from "./feature-gate.controller.js";

const featureGateRouter = Router();

featureGateRouter.use(authMiddleware);
featureGateRouter.get("/usage", getUsage);

export { featureGateRouter };
