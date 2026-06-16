import { Router } from "express";
import { asyncHandler } from "../common/middleware/asyncHandler.js";
import { authMiddleware } from "../auth/auth.middleware.js";
import { downloadInvoicePdf, downloadChallanPdf } from "./pdf.controller.js";

const pdfRouter = Router();

pdfRouter.get("/invoices/:id", authMiddleware, asyncHandler(downloadInvoicePdf));
pdfRouter.get("/challans/:id", authMiddleware, asyncHandler(downloadChallanPdf));

export { pdfRouter };
