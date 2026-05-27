import type { RepositoryListOptions, RepositoryListResult } from "../common/repositories/base.repository";

export class PartiesRepository {
  async list(_query: RepositoryListOptions): Promise<RepositoryListResult<never>> {
    throw new Error("Parties repository is not implemented yet");
  }
}
