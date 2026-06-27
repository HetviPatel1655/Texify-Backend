import { Router } from "express";

import { authMiddleware } from "../auth/auth.middleware";
import { validateBody, validateQuery } from "../common/middleware/validateBody";
import {
  createPurchaseOrderSchema,
  listPurchaseOrderQuerySchema,
  updatePurchaseOrderSchema,
} from "./purchase-orders.validators";
import {
  createPurchaseOrder,
  deletePurchaseOrder,
  getNextPurchaseOrderNumber,
  getPurchaseOrderById,
  listPurchaseOrders,
  updatePurchaseOrder,
} from "./purchase-orders.controller";

const router = Router();

router.use(authMiddleware);

router.get("/next-number", getNextPurchaseOrderNumber);
router.get("/", validateQuery(listPurchaseOrderQuerySchema), listPurchaseOrders);
router.get("/:id", getPurchaseOrderById);
router.post("/", validateBody(createPurchaseOrderSchema), createPurchaseOrder);
router.patch("/:id", validateBody(updatePurchaseOrderSchema), updatePurchaseOrder);
router.delete("/:id", deletePurchaseOrder);

export { router as purchaseOrdersRouter };
