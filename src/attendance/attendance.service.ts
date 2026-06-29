import type { CrudContext } from "../common/services/baseCrud.service";
import { AttendanceRepository } from "./attendance.repository";
import type {
  BulkUpsertAttendanceDto,
  MonthlyAttendanceGrid,
  AttendanceSalaryReportQuery,
  SalaryReportRow,
  SalaryReportDetailRow,
  WorkerSalaryReportQuery,
  WorkerSalaryReportRow,
  PatiaReportQuery,
  PatiaReportRow,
} from "./attendance.types";

export class AttendanceService {
  constructor(private readonly repository = new AttendanceRepository()) {}

  async getMonthlyGrid(
    tenantId: string,
    month: number,
    year: number,
    employeeType?: string
  ): Promise<MonthlyAttendanceGrid> {
    return this.repository.getMonthlyGrid(tenantId, month, year, employeeType);
  }

  async bulkUpsertAttendance(
    dto: BulkUpsertAttendanceDto,
    context: CrudContext
  ): Promise<{ updated: number }> {
    const updated = await this.repository.bulkUpsert(context.tenantId, dto.entries);
    return { updated };
  }

  async getSalaryReport(
    tenantId: string,
    query: AttendanceSalaryReportQuery
  ): Promise<SalaryReportRow[] | SalaryReportDetailRow[]> {
    return this.repository.getSalaryReport(tenantId, query);
  }

  async getWorkerSalaryReport(
    tenantId: string,
    query: WorkerSalaryReportQuery
  ): Promise<WorkerSalaryReportRow[]> {
    return this.repository.getWorkerSalaryReport(tenantId, query);
  }

  async getPatiaReport(
    tenantId: string,
    query: PatiaReportQuery
  ): Promise<PatiaReportRow[]> {
    return this.repository.getPatiaReport(tenantId, query);
  }

  async getDistinctMachines(tenantId: string): Promise<string[]> {
    return this.repository.getDistinctMachines(tenantId);
  }
}
