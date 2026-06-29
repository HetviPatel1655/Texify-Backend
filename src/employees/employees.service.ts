import { AppError } from "../common/errors/appError";
import type { CrudContext, CreateResult, UpdateResult } from "../common/services/baseCrud.service";
import type { RepositoryListResult } from "../common/repositories/base.repository";
import { EmployeesRepository } from "./employees.repository";
import type { CreateEmployeeDto, EmployeeDto, EmployeeListQuery, UpdateEmployeeDto } from "./employees.types";

export class EmployeesService {
  constructor(private readonly repository = new EmployeesRepository()) {}

  async list(query: EmployeeListQuery, tenantId: string): Promise<RepositoryListResult<EmployeeDto>> {
    return this.repository.list(query, tenantId);
  }

  async getById(id: string, tenantId: string): Promise<EmployeeDto | null> {
    return this.repository.findById(id, tenantId);
  }

  async create(dto: CreateEmployeeDto, context: CrudContext): Promise<CreateResult<EmployeeDto>> {
    const employee = await this.repository.create({
      tenant: { connect: { id: context.tenantId } },
      name: dto.name,
      employeeType: dto.employeeType as any,
      dailyRate: dto.dailyRate,
      isActive: dto.isActive ?? true,
      createdBy: context.actorId ? { connect: { id: context.actorId } } : undefined,
      updatedBy: context.actorId ? { connect: { id: context.actorId } } : undefined,
    });
    return { data: employee };
  }

  async update(id: string, dto: UpdateEmployeeDto, context: CrudContext): Promise<UpdateResult<EmployeeDto>> {
    const existing = await this.repository.findById(id, context.tenantId);
    if (!existing) throw new AppError("Employee not found", 404);

    const updateData: any = {
      updatedBy: context.actorId ? { connect: { id: context.actorId } } : undefined,
    };

    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.employeeType !== undefined) updateData.employeeType = dto.employeeType;
    if (dto.dailyRate !== undefined) updateData.dailyRate = dto.dailyRate;
    if (dto.isActive !== undefined) updateData.isActive = dto.isActive;

    const employee = await this.repository.update(id, updateData);
    return { data: employee };
  }

  async remove(id: string, context: CrudContext): Promise<void> {
    const existing = await this.repository.findById(id, context.tenantId);
    if (!existing) throw new AppError("Employee not found", 404);
    await this.repository.softDelete(id, context.tenantId);
  }
}
