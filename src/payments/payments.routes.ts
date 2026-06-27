import { Router } from "express";

import { validateBody } from "../common/middleware/validateBody";
import { recordPaymentSchema } from "./payments.validators";
import { recordPayment, listPayments, deletePayment } from "./payments.controller";

const router = Router({ mergeParams: true });

router.get("/", listPayments);
router.post("/", validateBody(recordPaymentSchema), recordPayment);
router.delete("/:paymentId", deletePayment);

export { router as paymentsRouter };
