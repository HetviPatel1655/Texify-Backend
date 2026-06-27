import { Router } from "express";
import { authMiddleware } from "../auth/auth.middleware";
import { getDashboardStats } from "./dashboard.controller";

const dashboardRouter = Router();

dashboardRouter.use(authMiddleware);
dashboardRouter.get("/stats", getDashboardStats);

export { dashboardRouter };
