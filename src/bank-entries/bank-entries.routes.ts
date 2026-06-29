import { Router } from "express";

import { authMiddleware } from "../auth/auth.middleware";
import { validateBody, validateQuery } from "../common/middleware/validateBody";
import {
  createBankEntrySchema,
  listBankEntryQuerySchema,
  updateBankEntrySchema,
} from "./bank-entries.validators";
import {
  createBankEntry,
  deleteBankEntry,
  getBankEntryById,
  getNextBankEntryNumber,
  getOutstandingInvoices,
  listBankEntries,
  updateBankEntry,
} from "./bank-entries.controller";

const router = Router();

router.use(authMiddleware);

router.get("/next-number", getNextBankEntryNumber);
router.get("/outstanding-invoices", getOutstandingInvoices);
router.get("/", validateQuery(listBankEntryQuerySchema), listBankEntries);
router.get("/:id", getBankEntryById);
router.post("/", validateBody(createBankEntrySchema), createBankEntry);
router.patch("/:id", validateBody(updateBankEntrySchema), updateBankEntry);
router.delete("/:id", deleteBankEntry);

export { router as bankEntriesRouter };
