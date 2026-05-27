import type { BaseCrudService, CreateResult, UpdateResult } from "../common/services/baseCrud.service";
import type { RepositoryListOptions, RepositoryListResult } from "../common/repositories/base.repository";
import type { CreateInvoiceDto, InvoiceDto, UpdateInvoiceDto } from "./invoices.types";

export class InvoicesService implements BaseCrudService<InvoiceDto, CreateInvoiceDto, UpdateInvoiceDto, RepositoryListOptions> {
  async list(_query: RepositoryListOptions): Promise<RepositoryListResult<InvoiceDto>> {
    throw new Error("Invoices service is not implemented yet");
  }

  async getById(_id: string): Promise<InvoiceDto | null> {
    throw new Error("Invoices service is not implemented yet");
  }

  async create(_dto: CreateInvoiceDto): Promise<CreateResult<InvoiceDto>> {
    throw new Error("Invoices service is not implemented yet");
  }

  async update(_id: string, _dto: UpdateInvoiceDto): Promise<UpdateResult<InvoiceDto>> {
    throw new Error("Invoices service is not implemented yet");
  }

  async remove(_id: string): Promise<void> {
    throw new Error("Invoices service is not implemented yet");
  }
}
