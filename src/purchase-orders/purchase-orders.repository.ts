import { Prisma } from "@prisma/client";

import { prisma } from "../lib/prisma";
import { createListQuery, type RepositoryListResult } from "../common/repositories/base.repository";
import { buildSearchWhere } from "../common/utils/query";
import { formatDecimalValue } from "../common/utils/decimal";
import type { PurchaseOrderDto, PurchaseOrderItemDto, PurchaseOrderListQuery } from "./purchase-orders.types";
import { purchaseOrderSearchableFields } from "./purchase-orders.constants";

const purchaseOrderSelect = {
  id: true,
  orderNumber: true,
  orderDate: true,
  partyId: true,
  party: { select: { name: true } },
  status: true,
  remarks: true,
  totalPieces: true,
  totalQuantity: true,
  totalAmount: true,
  items: {
    select: {
      id: true,
      productId: true,
      product: { select: { name: true } },
      description: true,
      pieces: true,
      quantity: true,
      rate: true,
      amount: true,
      remarks: true,
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

type PurchaseOrderRow = Prisma.PurchaseOrderGetPayload<{ select: typeof purchaseOrderSelect }>;

function toItemDto(item: PurchaseOrderRow["items"][number]): PurchaseOrderItemDto {
  return {
    id: item.id,
    productId: item.productId,
    productName: item.product?.name ?? null,
    description: item.description,
    pieces: formatDecimalValue(item.pieces),
    quantity: formatDecimalValue(item.quantity),
    rate: formatDecimalValue(item.rate),
    amount: formatDecimalValue(item.amount),
    remarks: item.remarks,
    sortOrder: item.sortOrder,
  };
}

function toDto(row: PurchaseOrderRow): PurchaseOrderDto {
  return {
    id: row.id,
    orderNumber: row.orderNumber,
    orderDate: row.orderDate.toISOString(),
    partyId: row.partyId,
    partyName: row.party.name,
    status: row.status,
    remarks: row.remarks,
    totalPieces: formatDecimalValue(row.totalPieces),
    totalQuantity: formatDecimalValue(row.totalQuantity),
    totalAmount: formatDecimalValue(row.totalAmount),
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

const listSelect = {
  id: true,
  orderNumber: true,
  orderDate: true,
  partyId: true,
  party: { select: { name: true } },
  status: true,
  remarks: true,
  totalPieces: true,
  totalQuantity: true,
  totalAmount: true,
  items: { select: { id: true }, orderBy: { sortOrder: "asc" as const } },
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
  createdById: true,
  updatedById: true,
  createdBy: { select: { name: true } },
  updatedBy: { select: { name: true } },
} as const;

export class PurchaseOrdersRepository {
  async list(query: PurchaseOrderListQuery, tenantId: string): Promise<RepositoryListResult<PurchaseOrderDto>> {
    const listQuery = createListQuery(query, [...purchaseOrderSearchableFields]);
    const searchWhere = buildSearchWhere([...purchaseOrderSearchableFields], query.search);

    const where: Prisma.PurchaseOrderWhereInput = {
      tenantId,
      deletedAt: null,
      ...(query.status ? { status: query.status as any } : {}),
      ...(query.partyId ? { partyId: query.partyId } : {}),
      ...searchWhere,
    };

    const [rows, total] = await prisma.$transaction([
      prisma.purchaseOrder.findMany({
        where,
        skip: listQuery.pagination.skip,
        take: listQuery.pagination.take,
        orderBy: listQuery.orderBy ?? { createdAt: "desc" },
        select: purchaseOrderSelect,
      }),
      prisma.purchaseOrder.count({ where }),
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

  async findById(id: string, tenantId: string): Promise<PurchaseOrderDto | null> {
    const row = await prisma.purchaseOrder.findFirst({
      where: { id, tenantId, deletedAt: null },
      select: purchaseOrderSelect,
    });
    return row ? toDto(row) : null;
  }

  async create(data: Prisma.PurchaseOrderCreateInput): Promise<PurchaseOrderDto> {
    const row = await prisma.purchaseOrder.create({
      data,
      select: purchaseOrderSelect,
    });
    return toDto(row);
  }

  async update(id: string, tenantId: string, data: Prisma.PurchaseOrderUpdateInput): Promise<PurchaseOrderDto> {
    const existing = await prisma.purchaseOrder.findFirst({ where: { id, tenantId, deletedAt: null } });
    if (!existing) throw new Error('Purchase order not found');
    const row = await prisma.purchaseOrder.update({
      where: { id },
      data,
      select: purchaseOrderSelect,
    });
    return toDto(row);
  }

  async softDelete(id: string, tenantId: string): Promise<void> {
    const existing = await prisma.purchaseOrder.findFirst({ where: { id, tenantId } });
    if (!existing) return;
    await prisma.purchaseOrder.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async getNextOrderNumber(tenantId: string): Promise<string> {
    const fiscalYear = this.getCurrentFiscalYear();
    const activeOrders = await prisma.purchaseOrder.findMany({
      where: {
        tenantId,
        deletedAt: null,
        orderNumber: { startsWith: `PO-${fiscalYear}` },
      },
      select: { orderNumber: true },
    });

    const usedNumbers = new Set(activeOrders.map((o: { orderNumber: string }) => {
      const parts = o.orderNumber.split("-");
      return parseInt(parts[parts.length - 1], 10);
    }));

    let nextSeq = 1;
    while (usedNumbers.has(nextSeq)) nextSeq++;

    return `PO-${fiscalYear}-${String(nextSeq).padStart(4, "0")}`;
  }

  private getCurrentFiscalYear(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const startYear = month >= 4 ? year : year - 1;
    return `${startYear}-${startYear + 1}`;
  }
}
