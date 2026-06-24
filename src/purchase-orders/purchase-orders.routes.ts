import { Router } from "express";

import { authMiddleware } from "../auth/auth.middleware.js";
import { validateBody, validateQuery } from "../common/middleware/validateBody.js";
import {
  createPurchaseOrderSchema,
  listPurchaseOrderQuerySchema,
  updatePurchaseOrderSchema,
} from "./purchase-orders.validators.js";
import {
  createPurchaseOrder,
  deletePurchaseOrder,
  getNextPurchaseOrderNumber,
  getPurchaseOrderById,
  listPurchaseOrders,
  updatePurchaseOrder,
} from "./purchase-orders.controller.js";

const router = Router();

router.use(authMiddleware);

router.get("/next-number", getNextPurchaseOrderNumber);
router.get("/", validateQuery(listPurchaseOrderQuerySchema), listPurchaseOrders);
router.get("/:id", getPurchaseOrderById);
router.post("/", validateBody(createPurchaseOrderSchema), createPurchaseOrder);
router.patch("/:id", validateBody(updatePurchaseOrderSchema), updatePurchaseOrder);
router.delete("/:id", deletePurchaseOrder);

export { router as purchaseOrdersRouter };
