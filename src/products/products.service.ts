import { Prisma } from "@prisma/client";

import { AppError } from "../common/errors/appError";
import type { BaseCrudService, CreateResult, CrudContext, UpdateResult } from "../common/services/baseCrud.service";
import type { RepositoryListResult } from "../common/repositories/base.repository";
import { ProductsRepository } from "./products.repository";
import type { CreateProductDto, ProductDto, ProductListQuery, UpdateProductDto } from "./products.types";

export class ProductsService implements BaseCrudService<ProductDto, CreateProductDto, UpdateProductDto, ProductListQuery> {
  constructor(private readonly productsRepository = new ProductsRepository()) {}

  async list(query: ProductListQuery): Promise<RepositoryListResult<ProductDto>> {
    return this.productsRepository.list(query);
  }

  async getById(id: string): Promise<ProductDto | null> {
    return this.productsRepository.findById(id);
  }

  async create(dto: CreateProductDto, context?: CrudContext): Promise<CreateResult<ProductDto>> {
    const product = await this.productsRepository.create({
      sku: dto.sku ?? null,
      name: dto.name,
      description: dto.description ?? null,
      hsnCode: dto.hsnCode,
      unitType: dto.unitType,
      gstType: dto.gstType ?? "TAXABLE",
      gstRate: dto.gstRate ?? 0,
      purchaseRate: dto.purchaseRate ?? 0,
      sellingRate: dto.sellingRate ?? 0,
      trackInventory: dto.trackInventory ?? false,
      openingStock: dto.openingStock ?? 0,
      reorderLevel: dto.reorderLevel ?? 0,
      isActive: dto.isActive ?? true,
      createdBy: context?.actorId ? { connect: { id: context.actorId } } : undefined,
      updatedBy: context?.actorId ? { connect: { id: context.actorId } } : undefined
    });

    return { data: product };
  }

  async update(id: string, dto: UpdateProductDto, context?: CrudContext): Promise<UpdateResult<ProductDto>> {
    const existing = await this.productsRepository.findById(id);

    if (!existing) {
      throw new AppError("Product not found", 404);
    }

    const product = await this.productsRepository.update(id, {
      name: dto.name,
      description: dto.description ?? undefined,
      hsnCode: dto.hsnCode,
      unitType: dto.unitType,
      gstType: dto.gstType,
      gstRate: dto.gstRate,
      purchaseRate: dto.purchaseRate,
      sellingRate: dto.sellingRate,
      trackInventory: dto.trackInventory,
      openingStock: dto.openingStock,
      reorderLevel: dto.reorderLevel,
      isActive: dto.isActive,
      updatedBy: context?.actorId ? { connect: { id: context.actorId } } : undefined
    } as Prisma.ProductUpdateInput);

    return { data: product };
  }

  async remove(id: string): Promise<void> {
    const existing = await this.productsRepository.findById(id);

    if (!existing) {
      throw new AppError("Product not found", 404);
    }

    await this.productsRepository.softDelete(id);
  }
}
