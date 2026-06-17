import type { Request, Response } from "express";
import { AppError } from "../common/errors/appError.js";
import { InvoicesService } from "../invoices/invoices.service.js";
import { ChallansService } from "../challans/challans.service.js";
import { CompanyProfileService } from "../company-profile/company-profile.service.js";
import { htmlToPdf } from "./pdf.service.js";
import { buildInvoiceHtml } from "./invoice-template.js";
import { buildChallanHtml } from "./challan-template.js";

const invoicesService = new InvoicesService();
const challansService = new ChallansService();
const companyService = new CompanyProfileService();

export async function downloadInvoicePdf(req: Request, res: Response) {
  const { tenantId } = (req as any).user;
  const id = req.params.id as string;
  const [invoice, company] = await Promise.all([
    invoicesService.getById(id, tenantId),
    companyService.get(tenantId),
  ]);

  if (!invoice) throw new AppError("Invoice not found", 404);

  let challan = null;
  if (invoice.challanId) {
    challan = await challansService.getById(invoice.challanId, tenantId);
  }

  const html = buildInvoiceHtml({
    invoice: {
      ...invoice,
      items: invoice.items ?? [],
      party: invoice.party ?? null,
    },
    challan: challan ? { challanNumber: challan.challanNumber, issueDate: challan.issueDate } : null,
    company,
  });

  const pdf = await htmlToPdf(html);

  const filename = `Invoice-${invoice.invoiceNumber}.pdf`;
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.setHeader("Content-Length", pdf.length);
  res.end(pdf);
}

export async function downloadChallanPdf(req: Request, res: Response) {
  const { tenantId } = (req as any).user;
  const id = req.params.id as string;
  const rowsPerColumn = parseInt(String(req.query.rowsPerColumn ?? "12"), 10) || 12;
  const duplicate = String(req.query.duplicate ?? "true") !== "false";

  const [challan, company] = await Promise.all([
    challansService.getById(id, tenantId),
    companyService.get(tenantId),
  ]);

  if (!challan) throw new AppError("Challan not found", 404);

  const html = buildChallanHtml({
    challan: {
      ...challan,
      party: challan.party ?? null,
    },
    company,
    rowsPerColumn,
    duplicate,
  });

  const pdf = await htmlToPdf(html);

  const filename = `Challan-${challan.challanNumber}.pdf`;
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.setHeader("Content-Length", pdf.length);
  res.end(pdf);
}
