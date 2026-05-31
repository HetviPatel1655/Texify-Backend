import { Prisma } from "@prisma/client";

import { prisma } from "../lib/prisma";
import { createListQuery, type RepositoryListResult } from "../common/repositories/base.repository";
import { buildSearchWhere } from "../common/utils/query";
import { formatDecimalValue } from "../common/utils/decimal";
import type { InvoiceDto, InvoiceItemDto, InvoiceListQuery, InvoicePartyDto, InvoiceProductDto } from "./invoices.types";
import { invoiceSearchableFields } from "./invoices.constants";

const invoicePartySelect = {
  id: true,
  code: true,
  name: true,
  partyType: true
} as const;

const invoiceProductSelect = {
  id: true,
  sku: true,
  name: true,
  unitType: true,
  gstType: true,
  gstRate: true
} as const;

export const invoiceListSelect = {
  id: true,
  gstType: true,
  invoiceNumber: true,
  seriesCode: true,
  sequenceNumber: true,
  fiscalYear: true,
  partyId: true,
  status: true,
  paymentStatus: true,
  issueDate: true,
  dueDate: true,
  notes: true,
  terms: true,
  transportMode: true,
  vehicleNumber: true,
  placeOfSupply: true,
  subtotal: true,
  discountAmount: true,
  gstAmount: true,
  roundOff: true,
  grandTotal: true,
  paidAmount: true,
  balanceAmount: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
  createdById: true,
  updatedById: true,
  party: {
    select: {
      id: true,
      code: true,
      name: true,
      partyType: true
    }
  }
} as const;

export const invoiceDetailSelect = {
  ...invoiceListSelect,
  items: {
    select: {
      id: true,
      productId: true,
      description: true,
      quantity: true,
      unit: true,
      unitType: true,
      rate: true,
      discountAmount: true,
      gstRate: true,
      taxableAmount: true,
      gstAmount: true,
      subtotal: true,
      grandTotal: true,
      product: {
        select: invoiceProductSelect
      }
    }
  }
} as const;

type InvoiceListRow = Prisma.InvoiceGetPayload<{ select: typeof invoiceListSelect }>;
type InvoiceDetailRow = Prisma.InvoiceGetPayload<{ select: typeof invoiceDetailSelect }>;

function toInvoicePartyDto(row: InvoiceListRow["party"] | InvoiceDetailRow["party"]): InvoicePartyDto | null {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    code: row.code,
    name: row.name,
    partyType: row.partyType
  };
}

function toInvoiceProductDto(row: InvoiceDetailRow["items"][number]["product"]): InvoiceProductDto | null {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    sku: row.sku,
    name: row.name,
    unitType: row.unitType,
    gstType: row.gstType,
    gstRate: formatDecimalValue(row.gstRate)
  };
}

function toInvoiceItemDto(row: InvoiceDetailRow["items"][number]): InvoiceItemDto {
  return {
    id: row.id,
    productId: row.productId,
    description: row.description,
    quantity: formatDecimalValue(row.quantity),
    unit: row.unit,
    unitType: row.unitType,
    rate: formatDecimalValue(row.rate),
    discountAmount: formatDecimalValue(row.discountAmount),
    gstRate: formatDecimalValue(row.gstRate),
    taxableAmount: formatDecimalValue(row.taxableAmount),
    gstAmount: formatDecimalValue(row.gstAmount),
    subtotal: formatDecimalValue(row.subtotal),
    grandTotal: formatDecimalValue(row.grandTotal),
    product: toInvoiceProductDto(row.product)
  };
}

function toInvoiceDto(row: InvoiceListRow | InvoiceDetailRow): InvoiceDto {
  return {
    id: row.id,
    gstType: row.gstType,
    invoiceNumber: row.invoiceNumber,
    seriesCode: row.seriesCode,
    sequenceNumber: row.sequenceNumber,
    fiscalYear: row.fiscalYear,
    partyId: row.partyId,
    status: row.status,
    paymentStatus: row.paymentStatus,
    issueDate: row.issueDate.toISOString(),
    dueDate: row.dueDate ? row.dueDate.toISOString() : null,
    notes: row.notes,
    terms: row.terms,
    transportMode: row.transportMode,
    vehicleNumber: row.vehicleNumber,
    placeOfSupply: row.placeOfSupply,
    subtotal: formatDecimalValue(row.subtotal),
    discountAmount: formatDecimalValue(row.discountAmount),
    gstAmount: formatDecimalValue(row.gstAmount),
    roundOff: formatDecimalValue(row.roundOff),
    grandTotal: formatDecimalValue(row.grandTotal),
    paidAmount: formatDecimalValue(row.paidAmount),
    balanceAmount: formatDecimalValue(row.balanceAmount),
    deletedAt: row.deletedAt ? row.deletedAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    createdById: row.createdById,
    updatedById: row.updatedById,
    party: toInvoicePartyDto(row.party),
    items: "items" in row ? row.items.map(toInvoiceItemDto) : undefined
  };
}

export class InvoicesRepository {
  async list(query: InvoiceListQuery): Promise<RepositoryListResult<InvoiceDto>> {
    const listQuery = createListQuery(query, [...invoiceSearchableFields]);
    const searchWhere = buildSearchWhere([...invoiceSearchableFields], query.search);

    const where: Prisma.InvoiceWhereInput = {
      deletedAt: null,
      ...(query.status ? { status: query.status } : {}),
      ...(query.paymentStatus ? { paymentStatus: query.paymentStatus } : {}),
      ...(query.partyId ? { partyId: query.partyId } : {}),
      ...(query.fromDate || query.toDate
        ? {
            issueDate: {
              ...(query.fromDate ? { gte: new Date(query.fromDate) } : {}),
              ...(query.toDate ? { lte: new Date(query.toDate) } : {})
            }
          }
        : {}),
      ...searchWhere
    };

    const [rows, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        skip: listQuery.pagination.skip,
        take: listQuery.pagination.take,
        orderBy: listQuery.orderBy ?? { createdAt: "desc" },
        select: invoiceListSelect
      }),
      prisma.invoice.count({ where })
    ]);

    return {
      data: rows.map(toInvoiceDto),
      meta: {
        page: listQuery.pagination.page,
        limit: listQuery.pagination.limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / listQuery.pagination.limit))
      }
    };
  }

  async findById(id: string, client: any = prisma): Promise<InvoiceDto | null> {
    const row = await client.invoice.findFirst({
      where: { id, deletedAt: null },
      select: invoiceDetailSelect
    });

    return row ? toInvoiceDto(row) : null;
  }

  async softDelete(id: string, client: any = prisma): Promise<void> {
    await client.invoice.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
  }

  async nextSequence(seriesCode: string, fiscalYear: string, client: any = prisma): Promise<number> {
    const row = await client.invoice.findFirst({
      where: { seriesCode, fiscalYear },
      orderBy: { sequenceNumber: "desc" },
      select: { sequenceNumber: true }
    });

    return (row?.sequenceNumber ?? 0) + 1;
  }
}