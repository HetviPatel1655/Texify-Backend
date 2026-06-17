import type { RepositoryListOptions, RepositoryListResult } from "../repositories/base.repository";

export interface CreateResult<TEntity> {
  data: TEntity;
}

export interface UpdateResult<TEntity> {
  data: TEntity;
}

export interface CrudContext {
  actorId?: string;
  tenantId: string;
}

export interface BaseCrudService<TEntity, TCreateDto, TUpdateDto, TListQuery = RepositoryListOptions> {
  list(query: TListQuery, tenantId: string): Promise<RepositoryListResult<TEntity>>;
  getById(id: string, tenantId: string): Promise<TEntity | null>;
  create(dto: TCreateDto, context: CrudContext): Promise<CreateResult<TEntity>>;
  update(id: string, dto: TUpdateDto, context: CrudContext): Promise<UpdateResult<TEntity>>;
  remove(id: string, context: CrudContext): Promise<void>;
}
