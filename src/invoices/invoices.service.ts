import { Prisma } from "@prisma/client";

import { AppError } from "../common/errors/appError";
import type { GSTType } from "../common/constants/erp";
import type { RepositoryListResult } from "../common/repositories/base.repository";
import { fiscalYearFromDate } from "../common/utils/fiscal";
import { prisma } from "../lib/prisma";
import { invoiceDetailSelect, InvoicesRepository } from "./invoices.repository";
import type { CreateInvoiceDto, InvoiceDto, InvoiceListQuery, UpdateInvoiceDto } from "./invoices.types";
import type { BaseCrudService, CreateResult, CrudContext, UpdateResult } from "../common/services/baseCrud.service";

function buildInvoiceNumber(seriesCode: string, sequenceNumber: number, fiscalYear: string): string {
  return `${seriesCode}-${fiscalYear}-${String(sequenceNumber).padStart(4, "0")}`;
}

function roundMoney(value: Prisma.Decimal): Prisma.Decimal {
  return value.toDecimalPlaces(2);
}

function isTaxableGstType(gstType: GSTType): boolean {
  return gstType === "TAXABLE" || gstType === "RCM";
}

interface InvoiceLineProduct {
  id: string;
  name: string;
  hsnCode: string | null;
  unitType: string;
  gstRate: Prisma.Decimal;
}

interface InvoiceLineSource {
  quantity: Prisma.Decimal;
  pieces: Prisma.Decimal | null;
  rate: Prisma.Decimal;
  product: InvoiceLineProduct;
  sortOrder: number;
}

interface CalculatedInvoiceLine {
  createInput: Prisma.InvoiceItemCreateWithoutInvoiceInput;
  subtotal: Prisma.Decimal;
  discountAmount: Prisma.Decimal;
  taxableAmount: Prisma.Decimal;
  gstAmount: Prisma.Decimal;
  grandTotal: Prisma.Decimal;
}

type ExistingInvoiceRow = Prisma.InvoiceGetPayload<{ select: typeof invoiceDetailSelect }>;
type ExistingInvoiceItem = NonNullable<ExistingInvoiceRow["items"]>[number];

function buildProductMap(products: Array<{ id: string; name: string; hsnCode: string | null; unitType: string; gstRate: Prisma.Decimal }>) {
  return new Map<string, InvoiceLineProduct>(
    products.map((product) => [
      product.id,
      {
        id: product.id,
        name: product.name,
        hsnCode: product.hsnCode,
        unitType: product.unitType,
        gstRate: new Prisma.Decimal(product.gstRate)
      }
    ])
  );
}

function buildSourcesFromCreateItems(items: CreateInvoiceDto["items"], productMap: Map<string, InvoiceLineProduct>): InvoiceLineSource[] {
  return items.map((item, index) => {
    const product = productMap.get(item.productId);

    if (!product) {
      throw new AppError("One or more invoice items reference an invalid product", 400);
    }

    return {
      quantity: new Prisma.Decimal(item.quantity),
      pieces: item.pieces != null ? new Prisma.Decimal(item.pieces) : null,
      rate: new Prisma.Decimal(item.unitPrice),
      product,
      sortOrder: index
    };
  });
}

function buildSourcesFromExistingItems(items: ExistingInvoiceItem[]): InvoiceLineSource[] {
  return items.map((item, index) => {
    if (!item.product) {
      throw new AppError("One or more existing invoice items are missing product data", 409);
    }

    return {
      quantity: new Prisma.Decimal(item.quantity),
      pieces: item.pieces ? new Prisma.Decimal(item.pieces) : null,
      rate: new Prisma.Decimal(item.rate),
      product: {
        id: item.product.id,
        name: item.product.name,
        hsnCode: item.product.hsnCode,
        unitType: item.product.unitType,
        gstRate: new Prisma.Decimal(item.product.gstRate)
      },
      sortOrder: index
    };
  });
}

interface GstSplit {
  isInterState: boolean;
  halfRate: Prisma.Decimal;
  sgstRate: Prisma.Decimal;
  cgstRate: Prisma.Decimal;
  igstRate: Prisma.Decimal;
}

function resolveGstSplit(gstType: GSTType, placeOfSupply: string | null | undefined): GstSplit {
  if (!isTaxableGstType(gstType)) {
    return { isInterState: false, halfRate: new Prisma.Decimal(0), sgstRate: new Prisma.Decimal(0), cgstRate: new Prisma.Decimal(0), igstRate: new Prisma.Decimal(0) };
  }

  // Inter-state if placeOfSupply is set and does not start with "24" (Gujarat)
  // This is a simplified check; real implementation should compare against company stateCode
  const isInterState = placeOfSupply ? !placeOfSupply.startsWith("24") : false;

  return { isInterState, halfRate: new Prisma.Decimal(0), sgstRate: new Prisma.Decimal(0), cgstRate: new Prisma.Decimal(0), igstRate: new Prisma.Decimal(0) };
}

function calculateInvoiceLines(items: InvoiceLineSource[], gstType: GSTType, discountAmount: Prisma.Decimal, placeOfSupply: string | null | undefined) {
  const gstSplit = resolveGstSplit(gstType, placeOfSupply);

  const lineAmounts = items.map((item) => ({
    product: item.product,
    quantity: item.quantity,
    pieces: item.pieces,
    rate: item.rate,
    sortOrder: item.sortOrder,
    subtotal: roundMoney(item.quantity.mul(item.rate))
  }));

  const subtotalTotal = lineAmounts.reduce((acc, item) => acc.add(item.subtotal), new Prisma.Decimal(0));
  const invoiceDiscount = roundMoney(Prisma.Decimal.min(discountAmount, subtotalTotal));

  let remainingDiscount = invoiceDiscount;

  const calculatedLines: CalculatedInvoiceLine[] = lineAmounts.map((line, index) => {
    const isLastLine = index === lineAmounts.length - 1;
    const discountShare = subtotalTotal.isZero()
      ? new Prisma.Decimal(0)
      : isLastLine
        ? remainingDiscount
        : roundMoney(line.subtotal.mul(invoiceDiscount).div(subtotalTotal));

    remainingDiscount = remainingDiscount.minus(discountShare);

    const taxableAmount = roundMoney(line.subtotal.minus(discountShare));
    const gstRate = isTaxableGstType(gstType) ? line.product.gstRate : new Prisma.Decimal(0);
    const gstAmount = roundMoney(taxableAmount.mul(gstRate).div(100));
    const grandTotal = roundMoney(taxableAmount.add(gstAmount));

    return {
      createInput: {
        product: { connect: { id: line.product.id } },
        description: line.product.name,
        hsnCode: line.product.hsnCode,
        quantity: line.quantity,
        pieces: line.pieces,
        unit: line.product.unitType,
        unitType: line.product.unitType as never,
        rate: line.rate,
        discountAmount: discountShare,
        gstRate,
        taxableAmount,
        gstAmount,
        subtotal: line.subtotal,
        grandTotal,
        sortOrder: line.sortOrder
      },
      subtotal: line.subtotal,
      discountAmount: discountShare,
      taxableAmount,
      gstAmount,
      grandTotal
    };
  });

  const taxableAmountTotal = calculatedLines.reduce((acc, line) => acc.add(line.taxableAmount), new Prisma.Decimal(0));
  const gstAmountTotal = calculatedLines.reduce((acc, line) => acc.add(line.gstAmount), new Prisma.Decimal(0));
  const grandTotal = calculatedLines.reduce((acc, line) => acc.add(line.grandTotal), new Prisma.Decimal(0));

  // Determine the effective GST rate from items (use first item's rate as the invoice-level display rate)
  const effectiveGstRate = calculatedLines.length > 0 && isTaxableGstType(gstType)
    ? items[0].product.gstRate
    : new Prisma.Decimal(0);

  let sgstRate = new Prisma.Decimal(0);
  let sgstAmount = new Prisma.Decimal(0);
  let cgstRate = new Prisma.Decimal(0);
  let cgstAmount = new Prisma.Decimal(0);
  let igstRate = new Prisma.Decimal(0);
  let igstAmount = new Prisma.Decimal(0);

  if (isTaxableGstType(gstType) && !gstAmountTotal.isZero()) {
    if (gstSplit.isInterState) {
      igstRate = effectiveGstRate;
      igstAmount = roundMoney(gstAmountTotal);
    } else {
      // Intra-state: split 50/50 into SGST + CGST
      const halfRate = roundMoney(effectiveGstRate.div(2));
      sgstRate = halfRate;
      cgstRate = halfRate;
      sgstAmount = roundMoney(gstAmountTotal.div(2));
      cgstAmount = roundMoney(gstAmountTotal.minus(sgstAmount));
    }
  }

  const rawTotal = roundMoney(taxableAmountTotal.add(gstAmountTotal));
  const roundedTotal = rawTotal.toDecimalPlaces(0, Prisma.Decimal.ROUND_HALF_UP);
  const roundOff = roundedTotal.minus(rawTotal);

  return {
    invoiceDiscount,
    subtotal: roundMoney(subtotalTotal),
    taxableAmount: roundMoney(taxableAmountTotal),
    gstAmount: roundMoney(gstAmountTotal),
    sgstRate,
    sgstAmount,
    cgstRate,
    cgstAmount,
    igstRate,
    igstAmount,
    roundOff,
    grandTotal: roundedTotal,
    lines: calculatedLines
  };
}

export class InvoicesService implements BaseCrudService<InvoiceDto, CreateInvoiceDto, UpdateInvoiceDto, InvoiceListQuery> {
  constructor(private readonly invoicesRepository = new InvoicesRepository()) {}

  async list(query: InvoiceListQuery, tenantId: string): Promise<RepositoryListResult<InvoiceDto>> {
    return this.invoicesRepository.list(query, tenantId);
  }

  async getById(id: string, tenantId: string): Promise<InvoiceDto | null> {
    return this.invoicesRepository.findById(id, tenantId);
  }

  async getNextNumber(tenantId: string): Promise<string> {
    const fiscalYear = fiscalYearFromDate(new Date());
    const seriesCode = "INV";
    const sequenceNumber = await this.invoicesRepository.nextSequence(seriesCode, fiscalYear, tenantId);
    return buildInvoiceNumber(seriesCode, sequenceNumber, fiscalYear);
  }

  async create(dto: CreateInvoiceDto, context: CrudContext): Promise<CreateResult<InvoiceDto>> {
    const tenantId = context.tenantId;
    return prisma.$transaction(async (tx) => {
      const db = tx as any;
      const issueDate = dto.invoiceDate ?? new Date();
      const fiscalYear = fiscalYearFromDate(issueDate);
      const seriesCode = "INV";
      const discountAmount = new Prisma.Decimal(dto.discount ?? 0);

      const party = await db.party.findFirst({ where: { id: dto.partyId, tenantId, deletedAt: null, isActive: true }, select: { id: true } });
      if (!party) {
        throw new AppError("Party not found", 404);
      }

      if (dto.challanId) {
        const challan = await db.challan.findFirst({ where: { id: dto.challanId, tenantId, deletedAt: null }, select: { id: true } });
        if (!challan) {
          throw new AppError("Referenced challan not found", 404);
        }
      }

      const productIds = [...new Set(dto.items.map((item) => item.productId))];
      const products = (await db.product.findMany({
        where: { id: { in: productIds }, tenantId, deletedAt: null, isActive: true },
        select: { id: true, name: true, hsnCode: true, unitType: true, gstRate: true }
      })) as Array<{ id: string; name: string; hsnCode: string | null; unitType: string; gstRate: Prisma.Decimal }>;

      if (products.length !== productIds.length) {
        throw new AppError("One or more invoice items reference an invalid product", 400);
      }

      const calculations = calculateInvoiceLines(
        buildSourcesFromCreateItems(dto.items, buildProductMap(products)),
        dto.gstType,
        discountAmount,
        dto.placeOfSupply
      );

      let sequenceNumber: number;
      if (dto.sequenceNumber) {
        const exists = await this.invoicesRepository.numberExists(seriesCode, dto.sequenceNumber, fiscalYear, tenantId, db);
        if (exists) {
          throw new AppError(`Invoice number ${buildInvoiceNumber(seriesCode, dto.sequenceNumber, fiscalYear)} already exists`, 409);
        }
        sequenceNumber = dto.sequenceNumber;
      } else {
        sequenceNumber = await this.invoicesRepository.nextSequence(seriesCode, fiscalYear, tenantId, db);
      }
      const invoiceNumber = buildInvoiceNumber(seriesCode, sequenceNumber, fiscalYear);

      // Calculate dueDays if dueDate provided but dueDays not
      let dueDays = dto.dueDays ?? null;
      if (dueDays == null && dto.dueDate) {
        dueDays = Math.max(0, Math.round((dto.dueDate.getTime() - issueDate.getTime()) / (1000 * 60 * 60 * 24)));
      }

      const invoice = await db.invoice.create({
        data: {
          tenant: { connect: { id: tenantId } },
          invoiceNumber,
          seriesCode,
          sequenceNumber,
          fiscalYear,
          gstType: dto.gstType,
          issueDate,
          dueDate: dto.dueDate ?? null,
          dueDays,
          orderNo: dto.orderNo ?? null,
          agentName: dto.agentName ?? null,
          transporterName: dto.transporterName ?? null,
          transportMode: dto.transportMode ?? null,
          vehicleNumber: dto.vehicleNumber ?? null,
          lrNo: dto.lrNo ?? null,
          eWayBillNo: dto.eWayBillNo ?? null,
          placeOfSupply: dto.placeOfSupply ?? null,
          challan: dto.challanId ? { connect: { id: dto.challanId } } : undefined,
          notes: dto.notes ?? null,
          terms: dto.terms ?? null,
          remark: dto.remark ?? null,
          interestRate: dto.interestRate != null ? new Prisma.Decimal(dto.interestRate) : null,
          bankName: dto.bankName ?? null,
          bankAccountNo: dto.bankAccountNo ?? null,
          bankIfsc: dto.bankIfsc ?? null,
          bankBranch: dto.bankBranch ?? null,
          party: { connect: { id: dto.partyId } },
          createdBy: context?.actorId ? { connect: { id: context.actorId } } : undefined,
          updatedBy: context?.actorId ? { connect: { id: context.actorId } } : undefined,
          subtotal: calculations.subtotal,
          discountAmount: calculations.invoiceDiscount,
          taxableAmount: calculations.taxableAmount,
          gstAmount: calculations.gstAmount,
          sgstRate: calculations.sgstRate,
          sgstAmount: calculations.sgstAmount,
          cgstRate: calculations.cgstRate,
          cgstAmount: calculations.cgstAmount,
          igstRate: calculations.igstRate,
          igstAmount: calculations.igstAmount,
          roundOff: calculations.roundOff,
          grandTotal: calculations.grandTotal,
          paidAmount: new Prisma.Decimal(0),
          balanceAmount: calculations.grandTotal,
          items: { create: calculations.lines.map((line) => line.createInput) }
        },
        select: invoiceDetailSelect
      });

      return { data: invoice as InvoiceDto };
    });
  }

  async update(id: string, dto: UpdateInvoiceDto, context: CrudContext): Promise<UpdateResult<InvoiceDto>> {
    const tenantId = context.tenantId;
    return prisma.$transaction(async (tx) => {
      const db = tx as any;

      const existing = (await db.invoice.findFirst({
        where: { id, tenantId, deletedAt: null },
        select: invoiceDetailSelect
      })) as ExistingInvoiceRow | null;

      if (!existing) {
        throw new AppError("Invoice not found", 404);
      }

      const issueDate = dto.invoiceDate ?? existing.issueDate;
      const gstType = dto.gstType ?? existing.gstType;
      const partyId = dto.partyId ?? existing.partyId;
      const discountAmount = new Prisma.Decimal(dto.discount ?? existing.discountAmount);
      const placeOfSupply = dto.placeOfSupply !== undefined ? dto.placeOfSupply : existing.placeOfSupply;

      const party = await db.party.findFirst({ where: { id: partyId, tenantId, deletedAt: null, isActive: true }, select: { id: true } });
      if (!party) {
        throw new AppError("Party not found", 404);
      }

      if (dto.challanId) {
        const challan = await db.challan.findFirst({ where: { id: dto.challanId, tenantId, deletedAt: null }, select: { id: true } });
        if (!challan) {
          throw new AppError("Referenced challan not found", 404);
        }
      }

      const shouldRecalculate = dto.items !== undefined || dto.discount !== undefined || dto.gstType !== undefined || dto.placeOfSupply !== undefined;
      let calculations: ReturnType<typeof calculateInvoiceLines> | null = null;

      if (shouldRecalculate) {
        const lineSources = dto.items
          ? buildSourcesFromCreateItems(
              dto.items,
              buildProductMap(
                (await db.product.findMany({
                  where: { id: { in: [...new Set(dto.items.map((item) => item.productId))] }, tenantId, deletedAt: null, isActive: true },
                  select: { id: true, name: true, hsnCode: true, unitType: true, gstRate: true }
                })) as Array<{ id: string; name: string; hsnCode: string | null; unitType: string; gstRate: Prisma.Decimal }>
              )
            )
          : buildSourcesFromExistingItems(existing.items);

        calculations = calculateInvoiceLines(lineSources, gstType, discountAmount, placeOfSupply);

        await db.invoiceItem.deleteMany({ where: { invoiceId: id } });
      }

      // Calculate dueDays
      let dueDays = dto.dueDays !== undefined ? dto.dueDays : existing.dueDays;
      const dueDate = dto.dueDate !== undefined ? dto.dueDate : existing.dueDate;
      if (dueDays == null && dueDate) {
        const issueDateObj = issueDate instanceof Date ? issueDate : new Date(issueDate);
        const dueDateObj = dueDate instanceof Date ? dueDate : new Date(dueDate);
        dueDays = Math.max(0, Math.round((dueDateObj.getTime() - issueDateObj.getTime()) / (1000 * 60 * 60 * 24)));
      }

      const invoice = await db.invoice.update({
        where: { id },
        data: {
          party: { connect: { id: partyId } },
          gstType,
          issueDate,
          dueDate: dto.dueDate ?? undefined,
          dueDays,
          orderNo: dto.orderNo !== undefined ? dto.orderNo : undefined,
          agentName: dto.agentName !== undefined ? dto.agentName : undefined,
          transporterName: dto.transporterName !== undefined ? dto.transporterName : undefined,
          transportMode: dto.transportMode !== undefined ? dto.transportMode : undefined,
          vehicleNumber: dto.vehicleNumber !== undefined ? dto.vehicleNumber : undefined,
          lrNo: dto.lrNo !== undefined ? dto.lrNo : undefined,
          eWayBillNo: dto.eWayBillNo !== undefined ? dto.eWayBillNo : undefined,
          placeOfSupply: dto.placeOfSupply !== undefined ? dto.placeOfSupply : undefined,
          challan: dto.challanId !== undefined
            ? dto.challanId ? { connect: { id: dto.challanId } } : { disconnect: true }
            : undefined,
          notes: dto.notes !== undefined ? dto.notes : undefined,
          terms: dto.terms !== undefined ? dto.terms : undefined,
          remark: dto.remark !== undefined ? dto.remark : undefined,
          interestRate: dto.interestRate !== undefined
            ? dto.interestRate != null ? new Prisma.Decimal(dto.interestRate) : null
            : undefined,
          bankName: dto.bankName !== undefined ? dto.bankName : undefined,
          bankAccountNo: dto.bankAccountNo !== undefined ? dto.bankAccountNo : undefined,
          bankIfsc: dto.bankIfsc !== undefined ? dto.bankIfsc : undefined,
          bankBranch: dto.bankBranch !== undefined ? dto.bankBranch : undefined,
          status: dto.status,
          paymentStatus: dto.paymentStatus,
          updatedBy: context?.actorId ? { connect: { id: context.actorId } } : undefined,
          ...(calculations
            ? {
                subtotal: calculations.subtotal,
                discountAmount: calculations.invoiceDiscount,
                taxableAmount: calculations.taxableAmount,
                gstAmount: calculations.gstAmount,
                sgstRate: calculations.sgstRate,
                sgstAmount: calculations.sgstAmount,
                cgstRate: calculations.cgstRate,
                cgstAmount: calculations.cgstAmount,
                igstRate: calculations.igstRate,
                igstAmount: calculations.igstAmount,
                roundOff: calculations.roundOff,
                grandTotal: calculations.grandTotal,
                balanceAmount: roundMoney(calculations.grandTotal.minus(new Prisma.Decimal(existing.paidAmount))),
                items: { create: calculations.lines.map((line) => line.createInput) }
              }
            : {})
        },
        select: invoiceDetailSelect
      });

      return { data: invoice as InvoiceDto };
    });
  }

  async remove(id: string, context: CrudContext): Promise<void> {
    const existing = await this.invoicesRepository.findById(id, context.tenantId);

    if (!existing) {
      throw new AppError("Invoice not found", 404);
    }

    await this.invoicesRepository.softDelete(id, context.tenantId);
  }
}
