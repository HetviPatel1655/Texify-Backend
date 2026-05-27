import type { RepositoryListOptions, RepositoryListResult } from "../repositories/base.repository";

export interface CreateResult<TEntity> {
  data: TEntity;
}

export interface UpdateResult<TEntity> {
  data: TEntity;
}

export interface BaseCrudService<TEntity, TCreateDto, TUpdateDto, TListQuery = RepositoryListOptions> {
  list(query: TListQuery): Promise<RepositoryListResult<TEntity>>;
  getById(id: string): Promise<TEntity | null>;
  create(dto: TCreateDto): Promise<CreateResult<TEntity>>;
  update(id: string, dto: TUpdateDto): Promise<UpdateResult<TEntity>>;
  remove(id: string): Promise<void>;
}
