import { Router } from "express";

import { authMiddleware } from "../auth/auth.middleware.js";
import { validateBody, validateQuery } from "../common/middleware/validateBody.js";
import {
  createSaleOrderSchema,
  listSaleOrderQuerySchema,
  updateSaleOrderSchema,
} from "./sale-orders.validators.js";
import {
  createSaleOrder,
  deleteSaleOrder,
  getNextSaleOrderNumber,
  getSaleOrderById,
  listSaleOrders,
  updateSaleOrder,
} from "./sale-orders.controller.js";

const router = Router();

router.use(authMiddleware);

router.get("/next-number", getNextSaleOrderNumber);
router.get("/", validateQuery(listSaleOrderQuerySchema), listSaleOrders);
router.get("/:id", getSaleOrderById);
router.post("/", validateBody(createSaleOrderSchema), createSaleOrder);
router.patch("/:id", validateBody(updateSaleOrderSchema), updateSaleOrder);
router.delete("/:id", deleteSaleOrder);

export { router as saleOrdersRouter };
