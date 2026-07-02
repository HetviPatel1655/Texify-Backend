import { Prisma } from "@prisma/client";

import { prisma } from "../lib/prisma";
import { createListQuery, type RepositoryListResult } from "../common/repositories/base.repository";
import { buildSearchWhere } from "../common/utils/query";
import { formatDecimalValue } from "../common/utils/decimal";
import type { SaleOrderDto, SaleOrderItemDto, SaleOrderListQuery } from "./sale-orders.types";
import { saleOrderSearchableFields } from "./sale-orders.constants";

const saleOrderSelect = {
  id: true,
  orderNumber: true,
  orderDate: true,
  partyId: true,
  party: { select: { name: true } },
  agentName: true,
  partyMobileNo: true,
  status: true,
  orderDueDays: true,
  orderDueDate: true,
  billDueDays: true,
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
      designNo: true,
      shadeName: true,
      pieces: true,
      cut: true,
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

type SaleOrderRow = Prisma.SaleOrderGetPayload<{ select: typeof saleOrderSelect }>;

function toItemDto(item: SaleOrderRow["items"][number]): SaleOrderItemDto {
  return {
    id: item.id,
    productId: item.productId,
    productName: item.product?.name ?? null,
    description: item.description,
    designNo: item.designNo,
    shadeName: item.shadeName,
    pieces: formatDecimalValue(item.pieces),
    cut: formatDecimalValue(item.cut),
    quantity: formatDecimalValue(item.quantity),
    rate: formatDecimalValue(item.rate),
    amount: formatDecimalValue(item.amount),
    remarks: item.remarks,
    sortOrder: item.sortOrder,
  };
}

function toDto(row: SaleOrderRow): SaleOrderDto {
  return {
    id: row.id,
    orderNumber: row.orderNumber,
    orderDate: row.orderDate.toISOString(),
    partyId: row.partyId,
    partyName: row.party.name,
    agentName: row.agentName,
    partyMobileNo: row.partyMobileNo,
    status: row.status,
    orderDueDays: row.orderDueDays,
    orderDueDate: row.orderDueDate ? row.orderDueDate.toISOString() : null,
    billDueDays: row.billDueDays,
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

export class SaleOrdersRepository {
  async list(query: SaleOrderListQuery, tenantId: string): Promise<RepositoryListResult<SaleOrderDto>> {
    const listQuery = createListQuery(query, [...saleOrderSearchableFields]);
    const searchWhere = buildSearchWhere([...saleOrderSearchableFields], query.search);

    const where: Prisma.SaleOrderWhereInput = {
      tenantId,
      deletedAt: null,
      ...(query.status ? { status: query.status as any } : {}),
      ...(query.partyId ? { partyId: query.partyId } : {}),
      ...searchWhere,
    };

    const [rows, total] = await prisma.$transaction([
      prisma.saleOrder.findMany({
        where,
        skip: listQuery.pagination.skip,
        take: listQuery.pagination.take,
        orderBy: listQuery.orderBy ?? { createdAt: "desc" },
        select: saleOrderSelect,
      }),
      prisma.saleOrder.count({ where }),
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

  async findById(id: string, tenantId: string): Promise<SaleOrderDto | null> {
    const row = await prisma.saleOrder.findFirst({
      where: { id, tenantId, deletedAt: null },
      select: saleOrderSelect,
    });
    return row ? toDto(row) : null;
  }

  async create(data: Prisma.SaleOrderCreateInput): Promise<SaleOrderDto> {
    const row = await prisma.saleOrder.create({
      data,
      select: saleOrderSelect,
    });
    return toDto(row);
  }

  async update(id: string, tenantId: string, data: Prisma.SaleOrderUpdateInput): Promise<SaleOrderDto> {
    const existing = await prisma.saleOrder.findFirst({ where: { id, tenantId, deletedAt: null } });
    if (!existing) throw new Error('Sale order not found');
    const row = await prisma.saleOrder.update({
      where: { id },
      data,
      select: saleOrderSelect,
    });
    return toDto(row);
  }

  async softDelete(id: string, tenantId: string): Promise<void> {
    const existing = await prisma.saleOrder.findFirst({ where: { id, tenantId } });
    if (!existing) return;
    await prisma.saleOrder.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async getNextOrderNumber(tenantId: string): Promise<string> {
    const fiscalYear = this.getCurrentFiscalYear();
    const activeOrders = await prisma.saleOrder.findMany({
      where: {
        tenantId,
        deletedAt: null,
        orderNumber: { startsWith: `SO-${fiscalYear}` },
      },
      select: { orderNumber: true },
    });

    const usedNumbers = new Set(activeOrders.map((o: { orderNumber: string }) => {
      const parts = o.orderNumber.split("-");
      return parseInt(parts[parts.length - 1], 10);
    }));

    let nextSeq = 1;
    while (usedNumbers.has(nextSeq)) nextSeq++;

    return `SO-${fiscalYear}-${String(nextSeq).padStart(4, "0")}`;
  }

  private getCurrentFiscalYear(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const startYear = month >= 4 ? year : year - 1;
    return `${startYear}-${startYear + 1}`;
  }
}
