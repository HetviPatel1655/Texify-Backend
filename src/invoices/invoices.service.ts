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
  unitType: string;
  gstRate: Prisma.Decimal;
}

interface InvoiceLineSource {
  quantity: Prisma.Decimal;
  rate: Prisma.Decimal;
  product: InvoiceLineProduct;
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

function buildProductMap(products: Array<{ id: string; name: string; unitType: string; gstRate: Prisma.Decimal }>) {
  return new Map<string, InvoiceLineProduct>(
    products.map((product) => [
      product.id,
      {
        id: product.id,
        name: product.name,
        unitType: product.unitType,
        gstRate: new Prisma.Decimal(product.gstRate)
      }
    ])
  );
}

function buildSourcesFromCreateItems(items: CreateInvoiceDto["items"], productMap: Map<string, InvoiceLineProduct>): InvoiceLineSource[] {
  return items.map((item) => {
    const product = productMap.get(item.productId);

    if (!product) {
      throw new AppError("One or more invoice items reference an invalid product", 400);
    }

    return {
      quantity: new Prisma.Decimal(item.quantity),
      rate: new Prisma.Decimal(item.unitPrice),
      product
    };
  });
}

function buildSourcesFromExistingItems(items: ExistingInvoiceItem[]): InvoiceLineSource[] {
  return items.map((item) => {
    if (!item.product) {
      throw new AppError("One or more existing invoice items are missing product data", 409);
    }

    return {
      quantity: new Prisma.Decimal(item.quantity),
      rate: new Prisma.Decimal(item.rate),
      product: {
        id: item.product.id,
        name: item.product.name,
        unitType: item.product.unitType,
        gstRate: new Prisma.Decimal(item.product.gstRate)
      }
    };
  });
}

function calculateInvoiceLines(items: InvoiceLineSource[], gstType: GSTType, discountAmount: Prisma.Decimal) {
  const lineAmounts = items.map((item) => ({
    product: item.product,
    quantity: item.quantity,
    rate: item.rate,
    subtotal: roundMoney(item.quantity.mul(item.rate))
  }));

  const subtotalTotal = lineAmounts.reduce((accumulator, item) => accumulator.add(item.subtotal), new Prisma.Decimal(0));
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
        quantity: line.quantity,
        unit: line.product.unitType,
        unitType: line.product.unitType as never,
        rate: line.rate,
        discountAmount: discountShare,
        gstRate,
        taxableAmount,
        gstAmount,
        subtotal: line.subtotal,
        grandTotal
      },
      subtotal: line.subtotal,
      discountAmount: discountShare,
      taxableAmount,
      gstAmount,
      grandTotal
    };
  });

  const taxableAmountTotal = calculatedLines.reduce((accumulator, line) => accumulator.add(line.taxableAmount), new Prisma.Decimal(0));
  const gstAmountTotal = calculatedLines.reduce((accumulator, line) => accumulator.add(line.gstAmount), new Prisma.Decimal(0));
  const grandTotal = calculatedLines.reduce((accumulator, line) => accumulator.add(line.grandTotal), new Prisma.Decimal(0));

  return {
    invoiceDiscount,
    subtotal: roundMoney(subtotalTotal),
    taxableAmount: roundMoney(taxableAmountTotal),
    gstAmount: roundMoney(gstAmountTotal),
    roundOff: roundMoney(grandTotal.minus(taxableAmountTotal).minus(gstAmountTotal)),
    grandTotal,
    lines: calculatedLines
  };
}

export class InvoicesService implements BaseCrudService<InvoiceDto, CreateInvoiceDto, UpdateInvoiceDto, InvoiceListQuery> {
  constructor(private readonly invoicesRepository = new InvoicesRepository()) {}

  async list(query: InvoiceListQuery): Promise<RepositoryListResult<InvoiceDto>> {
    return this.invoicesRepository.list(query);
  }

  async getById(id: string): Promise<InvoiceDto | null> {
    return this.invoicesRepository.findById(id);
  }

  async create(dto: CreateInvoiceDto, context?: CrudContext): Promise<CreateResult<InvoiceDto>> {
    return prisma.$transaction(async (tx) => {
      const db = tx as any;
      const issueDate = dto.invoiceDate ?? new Date();
      const fiscalYear = fiscalYearFromDate(issueDate);
      const seriesCode = "INV";
      const discountAmount = new Prisma.Decimal(dto.discount ?? 0);

      const party = await db.party.findFirst({ where: { id: dto.partyId, deletedAt: null, isActive: true }, select: { id: true } });
      if (!party) {
        throw new AppError("Party not found", 404);
      }

      const productIds = [...new Set(dto.items.map((item) => item.productId))];
      const products = (await db.product.findMany({
        where: { id: { in: productIds }, deletedAt: null, isActive: true },
        select: { id: true, name: true, unitType: true, gstRate: true }
      })) as Array<{ id: string; name: string; unitType: string; gstRate: Prisma.Decimal }>;

      if (products.length !== productIds.length) {
        throw new AppError("One or more invoice items reference an invalid product", 400);
      }

      const calculations = calculateInvoiceLines(buildSourcesFromCreateItems(dto.items, buildProductMap(products)), dto.gstType, discountAmount);

      const sequenceNumber = await this.invoicesRepository.nextSequence(seriesCode, fiscalYear, db);
      const invoiceNumber = buildInvoiceNumber(seriesCode, sequenceNumber, fiscalYear);

      const invoice = await db.invoice.create({
        data: {
          invoiceNumber,
          seriesCode,
          sequenceNumber,
          fiscalYear,
          gstType: dto.gstType,
          issueDate,
          dueDate: dto.dueDate ?? null,
          notes: dto.notes ?? null,
          terms: dto.terms ?? null,
          transportMode: dto.transportMode ?? null,
          vehicleNumber: dto.vehicleNumber ?? null,
          placeOfSupply: dto.placeOfSupply ?? null,
          party: { connect: { id: dto.partyId } },
          createdBy: context?.actorId ? { connect: { id: context.actorId } } : undefined,
          updatedBy: context?.actorId ? { connect: { id: context.actorId } } : undefined,
          subtotal: calculations.subtotal,
          discountAmount: calculations.invoiceDiscount,
          gstAmount: calculations.gstAmount,
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

  async update(id: string, dto: UpdateInvoiceDto, context?: CrudContext): Promise<UpdateResult<InvoiceDto>> {
    return prisma.$transaction(async (tx) => {
      const db = tx as any;

      const existing = (await db.invoice.findFirst({
        where: { id, deletedAt: null },
        select: invoiceDetailSelect
      })) as ExistingInvoiceRow | null;

      if (!existing) {
        throw new AppError("Invoice not found", 404);
      }

      const issueDate = dto.invoiceDate ?? existing.issueDate;
      const gstType = dto.gstType ?? existing.gstType;
      const partyId = dto.partyId ?? existing.partyId;
      const discountAmount = new Prisma.Decimal(dto.discount ?? existing.discountAmount);

      const party = await db.party.findFirst({ where: { id: partyId, deletedAt: null, isActive: true }, select: { id: true } });
      if (!party) {
        throw new AppError("Party not found", 404);
      }

      const shouldRecalculate = dto.items !== undefined || dto.discount !== undefined || dto.gstType !== undefined;
      let calculations: ReturnType<typeof calculateInvoiceLines> | null = null;

      if (shouldRecalculate) {
        const lineSources = dto.items
          ? buildSourcesFromCreateItems(
              dto.items,
              buildProductMap(
                (await db.product.findMany({
                  where: { id: { in: [...new Set(dto.items.map((item) => item.productId))] }, deletedAt: null, isActive: true },
                  select: { id: true, name: true, unitType: true, gstRate: true }
                })) as Array<{ id: string; name: string; unitType: string; gstRate: Prisma.Decimal }>
              )
            )
          : buildSourcesFromExistingItems(existing.items);

        calculations = calculateInvoiceLines(lineSources, gstType, discountAmount);

        await db.invoiceItem.deleteMany({ where: { invoiceId: id } });
      }

      const invoice = await db.invoice.update({
        where: { id },
        data: {
          party: { connect: { id: partyId } },
          gstType,
          issueDate,
          dueDate: dto.dueDate ?? undefined,
          status: dto.status,
          paymentStatus: dto.paymentStatus,
          discountAmount: dto.discount !== undefined || shouldRecalculate ? discountAmount : undefined,
          notes: dto.notes ?? undefined,
          terms: dto.terms ?? undefined,
          transportMode: dto.transportMode ?? undefined,
          vehicleNumber: dto.vehicleNumber ?? undefined,
          placeOfSupply: dto.placeOfSupply ?? undefined,
          updatedBy: context?.actorId ? { connect: { id: context.actorId } } : undefined,
          ...(calculations
            ? {
                subtotal: calculations.subtotal,
                discountAmount: calculations.invoiceDiscount,
                gstAmount: calculations.gstAmount,
                roundOff: calculations.roundOff,
                grandTotal: calculations.grandTotal,
                // Preserve any amount already paid — balance = new total minus what was paid
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

  async remove(id: string): Promise<void> {
    const existing = await this.invoicesRepository.findById(id);

    if (!existing) {
      throw new AppError("Invoice not found", 404);
    }

    await this.invoicesRepository.softDelete(id);
  }
}