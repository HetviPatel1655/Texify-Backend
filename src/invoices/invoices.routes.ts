import { Router } from "express";

import { authMiddleware } from "../auth/auth.middleware";
import { validateBody } from "../common/middleware/validateBody";
import { validateQuery } from "../common/middleware/validateQuery";
import { createInvoiceSchema, listInvoiceQuerySchema, updateInvoiceSchema } from "./invoices.validators";
import { createInvoice, deleteInvoice, getInvoiceById, listInvoices, updateInvoice } from "./invoices.controller";

const router = Router();

router.use(authMiddleware);

router.get("/", validateQuery(listInvoiceQuerySchema), listInvoices);
router.get("/:id", getInvoiceById);
router.post("/", validateBody(createInvoiceSchema), createInvoice);
router.patch("/:id", validateBody(updateInvoiceSchema), updateInvoice);
router.delete("/:id", deleteInvoice);

export { router as invoicesRouter };
