import { Prisma } from "@prisma/client";

import { prisma } from "../lib/prisma";
import { createListQuery, type RepositoryListResult } from "../common/repositories/base.repository";
import { buildSearchWhere } from "../common/utils/query";
import { formatDecimalValue } from "../common/utils/decimal";
import type { YarnPurchaseDto, YarnPurchaseItemDto, YarnPurchaseListQuery } from "./yarn-purchases.types";
import { yarnPurchaseSearchableFields } from "./yarn-purchases.constants";

const yarnPurchaseSelect = {
  id: true,
  serialNumber: true,
  purchaseDate: true,
  billNo: true,
  billDate: true,
  partyId: true,
  party: { select: { name: true } },
  billType: true,
  totalCartons: true,
  totalCheese: true,
  totalGrossWt: true,
  totalTareWt: true,
  totalNetWt: true,
  totalAmount: true,
  igstRate: true,
  igstAmount: true,
  cgstRate: true,
  cgstAmount: true,
  sgstRate: true,
  sgstAmount: true,
  billAmount: true,
  adjustedAmount: true,
  gstReceived: true,
  billRemarks: true,
  items: {
    select: {
      id: true,
      cartonNo: true,
      itemName: true,
      shadeName: true,
      lotNo: true,
      denier: true,
      twist: true,
      twistDirection: true,
      cheese: true,
      grossWt: true,
      tareWt: true,
      netWt: true,
      rate: true,
      amount: true,
      sortOrder: true,
    },
    orderBy: { sortOrder: "asc" as const },
  },
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
  createdById: true,
  updatedById: true,
  createdBy: { select: { name: true } },
  updatedBy: { select: { name: true } },
} as const;

type YarnPurchaseRow = Prisma.YarnPurchaseGetPayload<{ select: typeof yarnPurchaseSelect }>;

function toItemDto(item: YarnPurchaseRow["items"][number]): YarnPurchaseItemDto {
  return {
    id: item.id,
    cartonNo: item.cartonNo,
    itemName: item.itemName,
    shadeName: item.shadeName,
    lotNo: item.lotNo,
    denier: item.denier,
    twist: item.twist,
    twistDirection: item.twistDirection,
    cheese: formatDecimalValue(item.cheese),
    grossWt: formatDecimalValue(item.grossWt),
    tareWt: formatDecimalValue(item.tareWt),
    netWt: formatDecimalValue(item.netWt),
    rate: formatDecimalValue(item.rate),
    amount: formatDecimalValue(item.amount),
    sortOrder: item.sortOrder,
  };
}

function toDto(row: YarnPurchaseRow): YarnPurchaseDto {
  return {
    id: row.id,
    serialNumber: row.serialNumber,
    purchaseDate: row.purchaseDate.toISOString(),
    billNo: row.billNo,
    billDate: row.billDate ? row.billDate.toISOString() : null,
    partyId: row.partyId,
    partyName: row.party.name,
    billType: row.billType,
    totalCartons: row.totalCartons,
    totalCheese: formatDecimalValue(row.totalCheese),
    totalGrossWt: formatDecimalValue(row.totalGrossWt),
    totalTareWt: formatDecimalValue(row.totalTareWt),
    totalNetWt: formatDecimalValue(row.totalNetWt),
    totalAmount: formatDecimalValue(row.totalAmount),
    igstRate: formatDecimalValue(row.igstRate),
    igstAmount: formatDecimalValue(row.igstAmount),
    cgstRate: formatDecimalValue(row.cgstRate),
    cgstAmount: formatDecimalValue(row.cgstAmount),
    sgstRate: formatDecimalValue(row.sgstRate),
    sgstAmount: formatDecimalValue(row.sgstAmount),
    billAmount: formatDecimalValue(row.billAmount),
    adjustedAmount: formatDecimalValue(row.adjustedAmount),
    gstReceived: row.gstReceived,
    billRemarks: row.billRemarks,
    items: row.items.map(toItemDto),
    deletedAt: row.deletedAt ? row.deletedAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    createdById: row.createdById,
    updatedById: row.updatedById,
    createdByName: row.createdBy?.name ?? null,
    updatedByName: row.updatedBy?.name ?? null,
  };
}

export class YarnPurchasesRepository {
  async list(query: YarnPurchaseListQuery, tenantId: string): Promise<RepositoryListResult<YarnPurchaseDto>> {
    const listQuery = createListQuery(query, [...yarnPurchaseSearchableFields]);
    const searchWhere = buildSearchWhere([...yarnPurchaseSearchableFields], query.search);

    const where: Prisma.YarnPurchaseWhereInput = {
      tenantId,
      deletedAt: null,
      ...(query.partyId ? { partyId: query.partyId } : {}),
      ...searchWhere,
    };

    const [rows, total] = await prisma.$transaction([
      prisma.yarnPurchase.findMany({
        where,
        skip: listQuery.pagination.skip,
        take: listQuery.pagination.take,
        orderBy: listQuery.orderBy ?? { createdAt: "desc" },
        select: yarnPurchaseSelect,
      }),
      prisma.yarnPurchase.count({ where }),
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

  async findById(id: string, tenantId: string): Promise<YarnPurchaseDto | null> {
    const row = await prisma.yarnPurchase.findFirst({
      where: { id, tenantId, deletedAt: null },
      select: yarnPurchaseSelect,
    });
    return row ? toDto(row) : null;
  }

  async create(data: Prisma.YarnPurchaseCreateInput): Promise<YarnPurchaseDto> {
    const row = await prisma.yarnPurchase.create({
      data,
      select: yarnPurchaseSelect,
    });
    return toDto(row);
  }

  async update(id: string, data: Prisma.YarnPurchaseUpdateInput): Promise<YarnPurchaseDto> {
    const row = await prisma.yarnPurchase.update({
      where: { id },
      data,
      select: yarnPurchaseSelect,
    });
    return toDto(row);
  }

  async softDelete(id: string, tenantId: string): Promise<void> {
    const existing = await prisma.yarnPurchase.findFirst({ where: { id, tenantId } });
    if (!existing) return;
    await prisma.yarnPurchase.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async getNextSerialNumber(tenantId: string): Promise<string> {
    const fiscalYear = this.getCurrentFiscalYear();
    const prefix = `YP-${fiscalYear}`;
    const last = await prisma.yarnPurchase.findFirst({
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

  private getCurrentFiscalYear(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const startYear = month >= 4 ? year : year - 1;
    return `${startYear}-${startYear + 1}`;
  }
}
