import { Router } from "express";

import { validateBody } from "../common/middleware/validateBody.js";
import { recordPaymentSchema } from "./payments.validators.js";
import { recordPayment, listPayments, deletePayment } from "./payments.controller.js";

const router = Router({ mergeParams: true });

router.get("/", listPayments);
router.post("/", validateBody(recordPaymentSchema), recordPayment);
router.delete("/:paymentId", deletePayment);

export { router as paymentsRouter };
