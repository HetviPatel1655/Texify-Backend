import { Router } from "express";

import { authMiddleware } from "../auth/auth.middleware";
import { validateBody, validateQuery } from "../common/middleware/validateBody";
import {
  createYarnPurchaseSchema,
  listYarnPurchaseQuerySchema,
  updateYarnPurchaseSchema,
} from "./yarn-purchases.validators";
import {
  createYarnPurchase,
  deleteYarnPurchase,
  getDistinctYarnItems,
  getNextYarnPurchaseNumber,
  getYarnPurchaseById,
  getYarnStockReport,
  listYarnPurchases,
  lookupCarton,
  updateYarnPurchase,
} from "./yarn-purchases.controller";

const router = Router();

router.use(authMiddleware);

router.get("/stock-report", getYarnStockReport);
router.get("/distinct-items", getDistinctYarnItems);
router.get("/carton/:cartonNo", lookupCarton);
router.get("/next-number", getNextYarnPurchaseNumber);
router.get("/", validateQuery(listYarnPurchaseQuerySchema), listYarnPurchases);
router.get("/:id", getYarnPurchaseById);
router.post("/", validateBody(createYarnPurchaseSchema), createYarnPurchase);
router.patch("/:id", validateBody(updateYarnPurchaseSchema), updateYarnPurchase);
router.delete("/:id", deleteYarnPurchase);

export { router as yarnPurchasesRouter };
