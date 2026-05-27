import type { BaseCrudService, CreateResult, UpdateResult } from "../common/services/baseCrud.service";
import type { RepositoryListOptions, RepositoryListResult } from "../common/repositories/base.repository";
import type { CreateProductDto, ProductDto, UpdateProductDto } from "./products.types";

export class ProductsService implements BaseCrudService<ProductDto, CreateProductDto, UpdateProductDto, RepositoryListOptions> {
  async list(_query: RepositoryListOptions): Promise<RepositoryListResult<ProductDto>> {
    throw new Error("Products service is not implemented yet");
  }

  async getById(_id: string): Promise<ProductDto | null> {
    throw new Error("Products service is not implemented yet");
  }

  async create(_dto: CreateProductDto): Promise<CreateResult<ProductDto>> {
    throw new Error("Products service is not implemented yet");
  }

  async update(_id: string, _dto: UpdateProductDto): Promise<UpdateResult<ProductDto>> {
    throw new Error("Products service is not implemented yet");
  }

  async remove(_id: string): Promise<void> {
    throw new Error("Products service is not implemented yet");
  }
}
