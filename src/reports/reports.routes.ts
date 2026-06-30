import { Router } from "express";
import { authMiddleware } from "../auth/auth.middleware";
import { validateQuery } from "../common/middleware/validateBody";
import {
  beamCardReportSchema,
  beamIssueReportSchema,
  beamRegisterReportSchema,
  yarnIssueReportSchema,
  yarnReceiveReportSchema,
  rollsIssueReportSchema,
  takaReceivedReportSchema,
  yarnSaleChallanReportSchema,
  saleOutstandingReportSchema,
  purchaseOutstandingReportSchema,
} from "./reports.validators";
import {
  getBeamCardReport,
  getBeamIssueReport,
  getBeamRegisterReport,
  getYarnIssueReport,
  getYarnReceiveReport,
  getRollsIssueReport,
  getTakaReceivedReport,
  getYarnSaleChallanReport,
  getSaleOutstandingReport,
  getPurchaseOutstandingReport,
} from "./reports.controller";

const reportsRouter = Router();

reportsRouter.use(authMiddleware);

reportsRouter.get("/beam-card", validateQuery(beamCardReportSchema), getBeamCardReport);
reportsRouter.get("/beam-issue", validateQuery(beamIssueReportSchema), getBeamIssueReport);
reportsRouter.get("/beam-register", validateQuery(beamRegisterReportSchema), getBeamRegisterReport);
reportsRouter.get("/yarn-issue", validateQuery(yarnIssueReportSchema), getYarnIssueReport);
reportsRouter.get("/yarn-receive", validateQuery(yarnReceiveReportSchema), getYarnReceiveReport);
reportsRouter.get("/rolls-issue", validateQuery(rollsIssueReportSchema), getRollsIssueReport);
reportsRouter.get("/taka-received", validateQuery(takaReceivedReportSchema), getTakaReceivedReport);
reportsRouter.get("/yarn-sale-challan", validateQuery(yarnSaleChallanReportSchema), getYarnSaleChallanReport);
reportsRouter.get("/sale-outstanding", validateQuery(saleOutstandingReportSchema), getSaleOutstandingReport);
reportsRouter.get("/purchase-outstanding", validateQuery(purchaseOutstandingReportSchema), getPurchaseOutstandingReport);

export { reportsRouter };
