import type { RepositoryListOptions, RepositoryListResult } from "../common/repositories/base.repository";

export class InvoicesRepository {
  async list(_query: RepositoryListOptions): Promise<RepositoryListResult<never>> {
    throw new Error("Invoices repository is not implemented yet");
  }
}
