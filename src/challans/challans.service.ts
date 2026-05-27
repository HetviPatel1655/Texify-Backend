import type { BaseCrudService, CreateResult, UpdateResult } from "../common/services/baseCrud.service";
import type { RepositoryListOptions, RepositoryListResult } from "../common/repositories/base.repository";
import type { ChallanDto, CreateChallanDto, UpdateChallanDto } from "./challans.types";

export class ChallansService implements BaseCrudService<ChallanDto, CreateChallanDto, UpdateChallanDto, RepositoryListOptions> {
  async list(_query: RepositoryListOptions): Promise<RepositoryListResult<ChallanDto>> {
    throw new Error("Challans service is not implemented yet");
  }

  async getById(_id: string): Promise<ChallanDto | null> {
    throw new Error("Challans service is not implemented yet");
  }

  async create(_dto: CreateChallanDto): Promise<CreateResult<ChallanDto>> {
    throw new Error("Challans service is not implemented yet");
  }

  async update(_id: string, _dto: UpdateChallanDto): Promise<UpdateResult<ChallanDto>> {
    throw new Error("Challans service is not implemented yet");
  }

  async remove(_id: string): Promise<void> {
    throw new Error("Challans service is not implemented yet");
  }
}
