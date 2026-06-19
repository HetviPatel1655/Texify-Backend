import { Router } from "express";
import { asyncHandler } from "../common/middleware/asyncHandler.js";
import { authMiddleware } from "../auth/auth.middleware.js";
import { featureGate } from "../feature-gate/feature-gate.middleware.js";
import { downloadInvoicePdf, downloadChallanPdf } from "./pdf.controller.js";

const pdfRouter = Router();

pdfRouter.get("/invoices/:id", authMiddleware, featureGate("pdf:download"), asyncHandler(downloadInvoicePdf));
pdfRouter.get("/challans/:id", authMiddleware, featureGate("pdf:download"), asyncHandler(downloadChallanPdf));

export { pdfRouter };
