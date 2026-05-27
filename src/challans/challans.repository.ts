import type { RepositoryListOptions, RepositoryListResult } from "../common/repositories/base.repository";

export class ChallansRepository {
  async list(_query: RepositoryListOptions): Promise<RepositoryListResult<never>> {
    throw new Error("Challans repository is not implemented yet");
  }
}
