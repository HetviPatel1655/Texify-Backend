import type { RepositoryListOptions, RepositoryListResult } from "../common/repositories/base.repository";

export class ProductsRepository {
  async list(_query: RepositoryListOptions): Promise<RepositoryListResult<never>> {
    throw new Error("Products repository is not implemented yet");
  }
}
