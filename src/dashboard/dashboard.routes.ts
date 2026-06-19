import { Router } from "express";
import { authMiddleware } from "../auth/auth.middleware.js";
import { getDashboardStats } from "./dashboard.controller.js";

const dashboardRouter = Router();

dashboardRouter.use(authMiddleware);
dashboardRouter.get("/stats", getDashboardStats);

export { dashboardRouter };
