import { AppError } from "../common/errors/appError";
import type { CrudContext } from "../common/services/baseCrud.service";
import type { RepositoryListResult } from "../common/repositories/base.repository";
import { YarnIssuesRepository } from "./yarn-issues.repository";
import type {
  CreateYarnIssueDto,
  YarnIssueDto,
  YarnIssueListQuery,
  UpdateYarnIssueDto,
} from "./yarn-issues.types";

export class YarnIssuesService {
  constructor(private readonly repository = new YarnIssuesRepository()) {}

  async list(query: YarnIssueListQuery, tenantId: string): Promise<RepositoryListResult<YarnIssueDto>> {
    return this.repository.list(query, tenantId);
  }

  async getById(id: string, tenantId: string): Promise<YarnIssueDto | null> {
    return this.repository.findById(id, tenantId);
  }

  async getNextSlipNo(tenantId: string): Promise<string> {
    return this.repository.getNextSlipNo(tenantId);
  }

  async create(dto: CreateYarnIssueDto, context: CrudContext): Promise<{ data: YarnIssueDto }> {
    const slipNo = await this.repository.getNextSlipNo(context.tenantId);

    const issue = await this.repository.create({
      tenant: { connect: { id: context.tenantId } },
      issueDate: dto.issueDate ? new Date(dto.issueDate) : new Date(),
      slipNo,
      cartonNo: dto.cartonNo,
      yarnName: dto.yarnName ?? null,
      lotNo: dto.lotNo ?? null,
      twistDirection: dto.twistDirection ?? null,
      cheese: dto.cheese ?? 0,
      netWt: dto.netWt ?? 0,
      amount: dto.amount ?? 0,
      shadeName: dto.shadeName ?? null,
      deptName: dto.deptName ?? "MAIN STORE",
      remarks: dto.remarks ?? null,
      createdBy: context.actorId ? { connect: { id: context.actorId } } : undefined,
      updatedBy: context.actorId ? { connect: { id: context.actorId } } : undefined,
    });

    return { data: issue };
  }

  async update(id: string, dto: UpdateYarnIssueDto, context: CrudContext): Promise<{ data: YarnIssueDto }> {
    const existing = await this.repository.findById(id, context.tenantId);
    if (!existing) throw new AppError("Yarn issue not found", 404);

    const updateData: any = {
      updatedBy: context.actorId ? { connect: { id: context.actorId } } : undefined,
    };

    if (dto.issueDate) updateData.issueDate = new Date(dto.issueDate);
    if (dto.cartonNo) updateData.cartonNo = dto.cartonNo;
    if (dto.yarnName !== undefined) updateData.yarnName = dto.yarnName;
    if (dto.lotNo !== undefined) updateData.lotNo = dto.lotNo;
    if (dto.twistDirection !== undefined) updateData.twistDirection = dto.twistDirection;
    if (dto.cheese !== undefined) updateData.cheese = dto.cheese;
    if (dto.netWt !== undefined) updateData.netWt = dto.netWt;
    if (dto.amount !== undefined) updateData.amount = dto.amount;
    if (dto.shadeName !== undefined) updateData.shadeName = dto.shadeName;
    if (dto.deptName !== undefined) updateData.deptName = dto.deptName;
    if (dto.remarks !== undefined) updateData.remarks = dto.remarks;

    const issue = await this.repository.update(id, context.tenantId, updateData);
    return { data: issue };
  }

  async remove(id: string, context: CrudContext): Promise<void> {
    const existing = await this.repository.findById(id, context.tenantId);
    if (!existing) throw new AppError("Yarn issue not found", 404);
    await this.repository.softDelete(id, context.tenantId);
  }
}
