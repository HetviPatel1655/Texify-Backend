import { prisma } from "../lib/prisma";
import { AppError } from "../common/errors/appError";
import type { CrudContext } from "../common/services/baseCrud.service";
import type { RepositoryListResult } from "../common/repositories/base.repository";
import { ReturnTakasRepository } from "./return-takas.repository";
import type { CreateReturnTakaDto, ReturnTakaDto, ReturnTakaListQuery, UpdateReturnTakaDto } from "./return-takas.types";

export class ReturnTakasService {
  constructor(private readonly repository = new ReturnTakasRepository()) {}

  async list(query: ReturnTakaListQuery, tenantId: string): Promise<RepositoryListResult<ReturnTakaDto>> {
    return this.repository.list(query, tenantId);
  }

  async getById(id: string, tenantId: string): Promise<ReturnTakaDto | null> {
    return this.repository.findById(id, tenantId);
  }

  async create(dto: CreateReturnTakaDto, context: CrudContext): Promise<{ data: ReturnTakaDto }> {
    const taka = await prisma.taka.findFirst({
      where: { takaNo: dto.takaNo, tenantId: context.tenantId, deletedAt: null },
    });
    if (!taka) throw new AppError("Taka not found", 404);

    const returnTaka = await this.repository.create({
      tenant: { connect: { id: context.tenantId } },
      taka: { connect: { id: taka.id } },
      returnDate: dto.returnDate ? new Date(dto.returnDate) : new Date(),
      party: dto.partyId ? { connect: { id: dto.partyId } } : undefined,
      challanNo: dto.challanNo ?? null,
      rate: dto.rate ?? 0,
      remarks: dto.remarks ?? null,
      createdBy: context.actorId ? { connect: { id: context.actorId } } : undefined,
      updatedBy: context.actorId ? { connect: { id: context.actorId } } : undefined,
    });

    await prisma.taka.update({
      where: { id: taka.id },
      data: { status: "RETURNED" },
    });

    return { data: returnTaka };
  }

  async update(id: string, dto: UpdateReturnTakaDto, context: CrudContext): Promise<{ data: ReturnTakaDto }> {
    const existing = await this.repository.findById(id, context.tenantId);
    if (!existing) throw new AppError("Return taka entry not found", 404);

    const updateData: any = {
      updatedBy: context.actorId ? { connect: { id: context.actorId } } : undefined,
    };

    if (dto.returnDate) updateData.returnDate = new Date(dto.returnDate);
    if (dto.challanNo !== undefined) updateData.challanNo = dto.challanNo;
    if (dto.rate !== undefined) updateData.rate = dto.rate;
    if (dto.remarks !== undefined) updateData.remarks = dto.remarks;

    if (dto.partyId !== undefined) {
      updateData.party = dto.partyId ? { connect: { id: dto.partyId } } : { disconnect: true };
    }

    const returnTaka = await this.repository.update(id, context.tenantId, updateData);
    return { data: returnTaka };
  }

  async remove(id: string, context: CrudContext): Promise<void> {
    const existing = await this.repository.findById(id, context.tenantId);
    if (!existing) throw new AppError("Return taka entry not found", 404);

    await prisma.taka.update({
      where: { id: existing.takaId },
      data: { status: "IN_STOCK" },
    });

    await this.repository.softDelete(id, context.tenantId);
  }
}
