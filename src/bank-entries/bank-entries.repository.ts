import { Prisma } from "@prisma/client";

import { prisma } from "../lib/prisma";
import { createListQuery, type RepositoryListResult } from "../common/repositories/base.repository";
import { buildSearchWhere } from "../common/utils/query";
import { formatDecimalValue } from "../common/utils/decimal";
import type { BankEntryDto, BankEntryAdjustmentDto, BankEntryListQuery, OutstandingInvoiceDto } from "./bank-entries.types";
import { bankEntrySearchableFields } from "./bank-entries.constants";

const bankEntrySelect = {
  id: true,
  serialNumber: true,
  type: true,
  entryDate: true,
  slipRecNo: true,
  bankName: true,
  partyId: true,
  party: { select: { name: true } },
  chequeNo: true,
  chequeDate: true,
  amount: true,
  remarks: true,
  billWisePayment: true,
  unadjustedAmount: true,
  adjustments: {
    select: {
      id: true,
      invoiceId: true,
      amount: true,
      invoice: {
        select: {
          invoiceNumber: true,
          issueDate: true,
          grandTotal: true,
        },
      },
    },
  },
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
  createdById: true,
  updatedById: true,
  createdBy: { select: { name: true } },
  updatedBy: { select: { name: true } },
} as const;

type BankEntryRow = Prisma.BankEntryGetPayload<{ select: typeof bankEntrySelect }>;

function toAdjustmentDto(adj: BankEntryRow["adjustments"][number]): BankEntryAdjustmentDto {
  return {
    id: adj.id,
    invoiceId: adj.invoiceId,
    invoiceNumber: adj.invoice.invoiceNumber,
    invoiceDate: adj.invoice.issueDate.toISOString(),
    invoiceTotal: formatDecimalValue(adj.invoice.grandTotal),
    amount: formatDecimalValue(adj.amount),
  };
}

function toDto(row: BankEntryRow): BankEntryDto {
  return {
    id: row.id,
    serialNumber: row.serialNumber,
    type: row.type,
    entryDate: row.entryDate.toISOString(),
    slipRecNo: row.slipRecNo,
    bankName: row.bankName,
    partyId: row.partyId,
    partyName: row.party.name,
    chequeNo: row.chequeNo,
    chequeDate: row.chequeDate ? row.chequeDate.toISOString() : null,
    amount: formatDecimalValue(row.amount),
    remarks: row.remarks,
    billWisePayment: row.billWisePayment,
    unadjustedAmount: formatDecimalValue(row.unadjustedAmount),
    adjustments: row.adjustments.map(toAdjustmentDto),
    deletedAt: row.deletedAt ? row.deletedAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    createdById: row.createdById,
    updatedById: row.updatedById,
    createdByName: row.createdBy?.name ?? null,
    updatedByName: row.updatedBy?.name ?? null,
  };
}

export class BankEntriesRepository {
  async list(query: BankEntryListQuery, tenantId: string): Promise<RepositoryListResult<BankEntryDto>> {
    const listQuery = createListQuery(query, [...bankEntrySearchableFields]);
    const searchWhere = buildSearchWhere([...bankEntrySearchableFields], query.search);

    const where: Prisma.BankEntryWhereInput = {
      tenantId,
      deletedAt: null,
      ...(query.type ? { type: query.type } : {}),
      ...(query.partyId ? { partyId: query.partyId } : {}),
      ...(query.fromDate || query.toDate
        ? {
            entryDate: {
              ...(query.fromDate ? { gte: new Date(query.fromDate) } : {}),
              ...(query.toDate ? { lte: new Date(query.toDate) } : {}),
            },
          }
        : {}),
      ...searchWhere,
    };

    const [rows, total] = await prisma.$transaction([
      prisma.bankEntry.findMany({
        where,
        skip: listQuery.pagination.skip,
        take: listQuery.pagination.take,
        orderBy: listQuery.orderBy ?? { createdAt: "desc" },
        select: bankEntrySelect,
      }),
      prisma.bankEntry.count({ where }),
    ]);

    return {
      data: rows.map(toDto),
      meta: {
        page: listQuery.pagination.page,
        limit: listQuery.pagination.limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / listQuery.pagination.limit)),
      },
    };
  }

  async findById(id: string, tenantId: string): Promise<BankEntryDto | null> {
    const row = await prisma.bankEntry.findFirst({
      where: { id, tenantId, deletedAt: null },
      select: bankEntrySelect,
    });
    return row ? toDto(row) : null;
  }

  async create(data: Prisma.BankEntryCreateInput): Promise<BankEntryDto> {
    const row = await prisma.bankEntry.create({
      data,
      select: bankEntrySelect,
    });
    return toDto(row);
  }

  async update(id: string, tenantId: string, data: Prisma.BankEntryUpdateInput): Promise<BankEntryDto> {
    const existing = await prisma.bankEntry.findFirst({ where: { id, tenantId, deletedAt: null } });
    if (!existing) throw new Error('Bank entry not found');
    const row = await prisma.bankEntry.update({
      where: { id },
      data,
      select: bankEntrySelect,
    });
    return toDto(row);
  }

  async softDelete(id: string, tenantId: string): Promise<void> {
    const existing = await prisma.bankEntry.findFirst({ where: { id, tenantId } });
    if (!existing) return;
    await prisma.bankEntry.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async getNextSerialNumber(tenantId: string, type: "SLIP" | "CHEQUE"): Promise<string> {
    const fiscalYear = this.getCurrentFiscalYear();
    const prefix = type === "SLIP" ? `BS-${fiscalYear}` : `BC-${fiscalYear}`;
    const last = await prisma.bankEntry.findFirst({
      where: { tenantId, serialNumber: { startsWith: prefix } },
      orderBy: { serialNumber: "desc" },
      select: { serialNumber: true },
    });

    let nextSeq = 1;
    if (last) {
      const parts = last.serialNumber.split("-");
      const lastSeq = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(lastSeq)) nextSeq = lastSeq + 1;
    }

    return `${prefix}-${String(nextSeq).padStart(4, "0")}`;
  }

  async getOutstandingInvoices(partyId: string, tenantId: string): Promise<OutstandingInvoiceDto[]> {
    const invoices = await prisma.invoice.findMany({
      where: {
        tenantId,
        partyId,
        deletedAt: null,
        paymentStatus: { in: ["UNPAID", "PARTIAL"] },
      },
      select: {
        id: true,
        invoiceNumber: true,
        issueDate: true,
        grandTotal: true,
        paidAmount: true,
        bankEntryAdjustments: {
          select: { amount: true },
        },
      },
      orderBy: { issueDate: "asc" },
    });

    return invoices.map((inv: typeof invoices[number]) => {
      const grandTotal = formatDecimalValue(inv.grandTotal);
      const paidAmount = formatDecimalValue(inv.paidAmount);
      const adjustedAmount = inv.bankEntryAdjustments.reduce(
        (sum: number, adj: typeof inv.bankEntryAdjustments[number]) => sum + formatDecimalValue(adj.amount),
        0
      );
      const balance = grandTotal - paidAmount - adjustedAmount;
      return {
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        issueDate: inv.issueDate.toISOString(),
        grandTotal,
        paidAmount,
        adjustedAmount,
        balance: Math.max(0, balance),
      };
    });
  }

  private getCurrentFiscalYear(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const startYear = month >= 4 ? year : year - 1;
    return `${startYear}-${startYear + 1}`;
  }
}
