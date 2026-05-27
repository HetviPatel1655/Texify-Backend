import type { BaseCrudService, CreateResult, UpdateResult } from "../common/services/baseCrud.service";
import type { RepositoryListOptions, RepositoryListResult } from "../common/repositories/base.repository";
import type { CreatePartyDto, PartyDto, UpdatePartyDto } from "./parties.types";

export class PartiesService implements BaseCrudService<PartyDto, CreatePartyDto, UpdatePartyDto, RepositoryListOptions> {
  async list(_query: RepositoryListOptions): Promise<RepositoryListResult<PartyDto>> {
    throw new Error("Parties service is not implemented yet");
  }

  async getById(_id: string): Promise<PartyDto | null> {
    throw new Error("Parties service is not implemented yet");
  }

  async create(_dto: CreatePartyDto): Promise<CreateResult<PartyDto>> {
    throw new Error("Parties service is not implemented yet");
  }

  async update(_id: string, _dto: UpdatePartyDto): Promise<UpdateResult<PartyDto>> {
    throw new Error("Parties service is not implemented yet");
  }

  async remove(_id: string): Promise<void> {
    throw new Error("Parties service is not implemented yet");
  }
}
