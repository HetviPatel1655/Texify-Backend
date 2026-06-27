import { Router } from "express";
import { authMiddleware } from "../auth/auth.middleware";
import { getUsage } from "./feature-gate.controller";

const featureGateRouter = Router();

featureGateRouter.use(authMiddleware);
featureGateRouter.get("/usage", getUsage);

export { featureGateRouter };
