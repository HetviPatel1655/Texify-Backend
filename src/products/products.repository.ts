import { Prisma } from "@prisma/client";

import { prisma } from "../lib/prisma";
import { createListQuery, type RepositoryListResult } from "../common/repositories/base.repository";
import { buildSearchWhere } from "../common/utils/query";
import { formatDecimalValue } from "../common/utils/decimal";
import type { ProductDto, ProductListQuery } from "./products.types";
import { productSearchableFields } from "./products.constants";

const productSelect = {
  id: true,
  sku: true,
  name: true,
  description: true,
  hsnCode: true,
  unitType: true,
  gstType: true,
  gstRate: true,
  purchaseRate: true,
  sellingRate: true,
  trackInventory: true,
  openingStock: true,
  reorderLevel: true,
  isActive: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
  createdById: true,
  updatedById: true
} as const;

type ProductRow = Prisma.ProductGetPayload<{ select: typeof productSelect }>;

function toProductDto(row: ProductRow): ProductDto {
  return {
    id: row.id,
    sku: row.sku,
    name: row.name,
    description: row.description,
    hsnCode: row.hsnCode,
    unitType: row.unitType,
    gstType: row.gstType,
    gstRate: formatDecimalValue(row.gstRate),
    purchaseRate: formatDecimalValue(row.purchaseRate),
    sellingRate: formatDecimalValue(row.sellingRate),
    trackInventory: row.trackInventory,
    openingStock: formatDecimalValue(row.openingStock),
    reorderLevel: formatDecimalValue(row.reorderLevel),
    isActive: row.isActive,
    deletedAt: row.deletedAt ? row.deletedAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    createdById: row.createdById,
    updatedById: row.updatedById
  };
}

export class ProductsRepository {
  async list(query: ProductListQuery, tenantId: string): Promise<RepositoryListResult<ProductDto>> {
    const listQuery = createListQuery(query, [...productSearchableFields]);
    const searchWhere = buildSearchWhere([...productSearchableFields], query.search);

    const where: Prisma.ProductWhereInput = {
      tenantId,
      deletedAt: null,
      ...(query.unitType ? { unitType: query.unitType } : {}),
      ...(query.gstType ? { gstType: query.gstType } : {}),
      ...(typeof query.isActive === "boolean" ? { isActive: query.isActive } : {}),
      ...searchWhere
    };

    const [rows, total] = await prisma.$transaction([
      prisma.product.findMany({
        where,
        skip: listQuery.pagination.skip,
        take: listQuery.pagination.take,
        orderBy: listQuery.orderBy ?? { createdAt: "desc" },
        select: productSelect
      }),
      prisma.product.count({ where })
    ]);

    return {
      data: rows.map(toProductDto),
      meta: {
        page: listQuery.pagination.page,
        limit: listQuery.pagination.limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / listQuery.pagination.limit))
      }
    };
  }

  async findById(id: string, tenantId: string): Promise<ProductDto | null> {
    const row = await prisma.product.findFirst({
      where: { id, tenantId, deletedAt: null },
      select: productSelect
    });

    return row ? toProductDto(row) : null;
  }

  async create(data: Prisma.ProductCreateInput): Promise<ProductDto> {
    const row = await prisma.product.create({
      data,
      select: productSelect
    });

    return toProductDto(row);
  }

  async update(id: string, data: Prisma.ProductUpdateInput): Promise<ProductDto> {
    const row = await prisma.product.update({
      where: { id },
      data,
      select: productSelect
    });

    return toProductDto(row);
  }

  async softDelete(id: string, tenantId: string): Promise<void> {
    const existing = await prisma.product.findFirst({ where: { id, tenantId } });
    if (!existing) return;
    await prisma.product.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false }
    });
  }
}
