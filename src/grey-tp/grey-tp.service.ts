import { prisma } from "../lib/prisma.js";
import { AppError } from "../common/errors/appError.js";
import type { CrudContext } from "../common/services/baseCrud.service.js";
import type { RepositoryListResult } from "../common/repositories/base.repository.js";
import { GreyTPRepository } from "./grey-tp.repository.js";
import type { CreateGreyTPDto, GreyTPDto, GreyTPListQuery, UpdateGreyTPDto } from "./grey-tp.types.js";

export class GreyTPService {
  constructor(private readonly repository = new GreyTPRepository()) {}

  async list(query: GreyTPListQuery, tenantId: string): Promise<RepositoryListResult<GreyTPDto>> {
    return this.repository.list(query, tenantId);
  }

  async getById(id: string, tenantId: string): Promise<GreyTPDto | null> {
    return this.repository.findById(id, tenantId);
  }

  async create(dto: CreateGreyTPDto, context: CrudContext): Promise<{ data: GreyTPDto }> {
    const taka = await prisma.taka.findFirst({
      where: { takaNo: dto.takaNo, tenantId: context.tenantId, deletedAt: null },
    });
    if (!taka) throw new AppError("Taka not found", 404);

    const greyTP = await this.repository.create({
      tenant: { connect: { id: context.tenantId } },
      taka: { connect: { id: taka.id } },
      date: dto.date ? new Date(dto.date) : new Date(),
      newMeters: dto.newMeters,
      originalMeters: Number(taka.meters),
      newWeight: dto.newWeight,
      originalWeight: Number(taka.weight),
      newSarees: dto.newSarees,
      originalSarees: taka.sarees,
      remark: dto.remark ?? null,
      createdBy: context.actorId ? { connect: { id: context.actorId } } : undefined,
      updatedBy: context.actorId ? { connect: { id: context.actorId } } : undefined,
    });

    await prisma.taka.update({
      where: { id: taka.id },
      data: {
        meters: dto.newMeters,
        weight: dto.newWeight,
        sarees: dto.newSarees,
      },
    });

    return { data: greyTP };
  }

  async update(id: string, dto: UpdateGreyTPDto, context: CrudContext): Promise<{ data: GreyTPDto }> {
    const existing = await this.repository.findById(id, context.tenantId);
    if (!existing) throw new AppError("Grey T.P. entry not found", 404);

    const updateData: any = {
      updatedBy: context.actorId ? { connect: { id: context.actorId } } : undefined,
    };

    if (dto.date) updateData.date = new Date(dto.date);
    if (dto.newMeters !== undefined) updateData.newMeters = dto.newMeters;
    if (dto.newWeight !== undefined) updateData.newWeight = dto.newWeight;
    if (dto.newSarees !== undefined) updateData.newSarees = dto.newSarees;
    if (dto.remark !== undefined) updateData.remark = dto.remark;

    const greyTP = await this.repository.update(id, updateData);

    await prisma.taka.update({
      where: { id: existing.takaId },
      data: {
        meters: dto.newMeters ?? existing.newMeters,
        weight: dto.newWeight ?? existing.newWeight,
        sarees: dto.newSarees ?? existing.newSarees,
      },
    });

    return { data: greyTP };
  }

  async remove(id: string, context: CrudContext): Promise<void> {
    const existing = await this.repository.findById(id, context.tenantId);
    if (!existing) throw new AppError("Grey T.P. entry not found", 404);

    await prisma.taka.update({
      where: { id: existing.takaId },
      data: {
        meters: existing.originalMeters,
        weight: existing.originalWeight,
        sarees: existing.originalSarees,
      },
    });

    await this.repository.softDelete(id, context.tenantId);
  }
}
