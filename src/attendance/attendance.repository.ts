import { Prisma } from "@prisma/client";

import { prisma } from "../lib/prisma";
import { formatDecimalValue } from "../common/utils/decimal";
import type {
  MonthlyAttendanceGrid,
  MonthlyEmployeeRow,
  AttendanceEntry,
  AttendanceSalaryReportQuery,
  SalaryReportRow,
  SalaryReportDetailRow,
  WorkerSalaryReportQuery,
  WorkerSalaryReportRow,
  PatiaReportQuery,
  PatiaReportRow,
} from "./attendance.types";

function getDayValue(status: string): number {
  if (status === "PRESENT") return 1;
  if (status === "HALF_DAY") return 0.5;
  return 0;
}

export class AttendanceRepository {
  async getMonthlyGrid(
    tenantId: string,
    month: number,
    year: number,
    employeeType?: string
  ): Promise<MonthlyAttendanceGrid> {
    const daysInMonth = new Date(year, month, 0).getDate();
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month - 1, daysInMonth);

    const employeeWhere: Prisma.EmployeeWhereInput = {
      tenantId,
      deletedAt: null,
      isActive: true,
      ...(employeeType ? { employeeType: employeeType as any } : {}),
    };

    const employees = await prisma.employee.findMany({
      where: employeeWhere,
      select: { id: true, name: true, employeeType: true, dailyRate: true },
      orderBy: { name: "asc" },
    });

    const attendances = await prisma.attendance.findMany({
      where: {
        tenantId,
        date: { gte: startDate, lte: endDate },
        ...(employeeType ? { employee: { employeeType: employeeType as any } } : {}),
      },
      select: { employeeId: true, date: true, status: true },
    });

    const attendanceMap = new Map<string, string>();
    for (const a of attendances) {
      const day = a.date.getDate();
      attendanceMap.set(`${a.employeeId}-${day}`, a.status);
    }

    let totalDaysSum = 0;
    let totalAmountSum = 0;

    type EmpRow = { id: string; name: string; employeeType: string; dailyRate: any };
    const rows: MonthlyEmployeeRow[] = employees.map((emp: EmpRow) => {
      const days: Record<number, "PRESENT" | "ABSENT" | "HALF_DAY"> = {};
      let totalDays = 0;

      for (let d = 1; d <= daysInMonth; d++) {
        const status = attendanceMap.get(`${emp.id}-${d}`);
        if (status) {
          days[d] = status as "PRESENT" | "ABSENT" | "HALF_DAY";
          totalDays += getDayValue(status);
        }
      }

      const dailyRate = formatDecimalValue(emp.dailyRate);
      const amount = totalDays * dailyRate;
      totalDaysSum += totalDays;
      totalAmountSum += amount;

      return {
        employeeId: emp.id,
        employeeName: emp.name,
        employeeType: emp.employeeType,
        dailyRate,
        totalDays,
        amount,
        days,
      };
    });

    return {
      month,
      year,
      daysInMonth,
      employees: rows,
      totals: { totalDays: totalDaysSum, totalAmount: totalAmountSum },
    };
  }

  async bulkUpsert(
    tenantId: string,
    entries: AttendanceEntry[]
  ): Promise<number> {
    const operations = entries.map((entry) => {
      const date = new Date(entry.date);
      return prisma.attendance.upsert({
        where: {
          tenantId_employeeId_date: {
            tenantId,
            employeeId: entry.employeeId,
            date,
          },
        },
        update: { status: entry.status },
        create: {
          tenant: { connect: { id: tenantId } },
          employee: { connect: { id: entry.employeeId } },
          date,
          status: entry.status,
        },
      });
    });

    await prisma.$transaction(operations);
    return entries.length;
  }

  async getSalaryReport(
    tenantId: string,
    query: AttendanceSalaryReportQuery
  ): Promise<SalaryReportRow[] | SalaryReportDetailRow[]> {
    const fromDate = new Date(query.fromDate);
    const toDate = new Date(query.toDate);

    const employeeWhere: Prisma.EmployeeWhereInput = {
      tenantId,
      deletedAt: null,
      ...(query.employeeType ? { employeeType: query.employeeType as any } : {}),
      ...(query.employeeId ? { id: query.employeeId } : {}),
    };

    const employees = await prisma.employee.findMany({
      where: employeeWhere,
      select: { id: true, name: true, employeeType: true, dailyRate: true },
      orderBy: { name: "asc" },
    });

    const employeeIds = employees.map((e: { id: string }) => e.id);

    const attendances = await prisma.attendance.findMany({
      where: {
        tenantId,
        date: { gte: fromDate, lte: toDate },
        employeeId: { in: employeeIds },
      },
      select: { employeeId: true, date: true, status: true },
      orderBy: { date: "asc" },
    });

    type AttendanceRow = { employeeId: string; date: Date; status: string };
    const attendanceByEmployee = new Map<string, AttendanceRow[]>();
    for (const a of attendances) {
      const existing = attendanceByEmployee.get(a.employeeId) ?? [];
      existing.push(a);
      attendanceByEmployee.set(a.employeeId, existing);
    }

    type EmployeeRow = { id: string; name: string; employeeType: string; dailyRate: any };

    if (query.reportType === "detailed") {
      return employees.map((emp: EmployeeRow) => {
        const empAttendances = attendanceByEmployee.get(emp.id) ?? [];
        const dailyRate = formatDecimalValue(emp.dailyRate);
        let totalDays = 0;
        const entries = empAttendances.map((a: AttendanceRow) => {
          const dayValue = getDayValue(a.status);
          totalDays += dayValue;
          return {
            date: a.date.toISOString(),
            status: a.status,
            dayValue,
          };
        });

        return {
          employeeId: emp.id,
          employeeName: emp.name,
          employeeType: emp.employeeType,
          dailyRate,
          totalDays,
          amount: totalDays * dailyRate,
          entries,
        } as SalaryReportDetailRow;
      });
    }

    return employees.map((emp: EmployeeRow) => {
      const empAttendances = attendanceByEmployee.get(emp.id) ?? [];
      const dailyRate = formatDecimalValue(emp.dailyRate);
      const totalDays = empAttendances.reduce((sum: number, a: AttendanceRow) => sum + getDayValue(a.status), 0);

      return {
        employeeId: emp.id,
        employeeName: emp.name,
        employeeType: emp.employeeType,
        dailyRate,
        totalDays,
        amount: totalDays * dailyRate,
      } as SalaryReportRow;
    });
  }

  async getWorkerSalaryReport(
    tenantId: string,
    query: WorkerSalaryReportQuery
  ): Promise<WorkerSalaryReportRow[]> {
    const fromDate = new Date(query.fromDate);
    const toDate = new Date(query.toDate);
    const dateField = query.dateType ?? "foldingDate";

    const where: Prisma.TakaWhereInput = {
      tenantId,
      deletedAt: null,
      [dateField]: { gte: fromDate, lte: toDate },
      ...(query.particular ? { workerName: { contains: query.particular, mode: "insensitive" as const } } : {}),
    };

    const takas = await prisma.taka.findMany({
      where,
      select: {
        workerName: true,
        meters: true,
        sarees: true,
        pieces: true,
        firm: { select: { name: true } },
      },
      orderBy: query.sortOn === "firmWise"
        ? { firm: { name: "asc" } }
        : { workerName: "asc" },
    });

    const groupKey = query.groupBy === "firm" ? "firmName" : "workerName";
    const grouped = new Map<string, WorkerSalaryReportRow>();

    for (const taka of takas) {
      const key = groupKey === "firmName"
        ? (taka.firm?.name ?? "Unknown")
        : (taka.workerName ?? "Unknown");

      const existing = grouped.get(key) ?? {
        workerName: taka.workerName ?? "Unknown",
        firmName: taka.firm?.name ?? null,
        takaCount: 0,
        totalMeters: 0,
        totalSarees: 0,
        totalPieces: 0,
      };

      existing.takaCount += 1;
      existing.totalMeters += formatDecimalValue(taka.meters);
      existing.totalSarees += taka.sarees;
      existing.totalPieces += taka.pieces;
      grouped.set(key, existing);
    }

    return Array.from(grouped.values());
  }

  async getPatiaReport(
    tenantId: string,
    query: PatiaReportQuery
  ): Promise<PatiaReportRow[]> {
    const fromDate = new Date(query.fromDate);
    const toDate = new Date(query.toDate);

    const where: Prisma.TakaWhereInput = {
      tenantId,
      deletedAt: null,
      date: { gte: fromDate, lte: toDate },
      ...(query.firmId ? { firmId: query.firmId } : {}),
      ...(query.machineType === "selected" && query.machines?.length
        ? { loomNo: { in: query.machines } }
        : {}),
    };

    const takas = await prisma.taka.findMany({
      where,
      select: {
        loomNo: true,
        workerName: true,
        meters: true,
        sarees: true,
        pieces: true,
        date: true,
        takaNo: true,
      },
      orderBy: [{ loomNo: "asc" }, { workerName: "asc" }],
    });

    const grouped = new Map<string, PatiaReportRow>();

    for (const taka of takas) {
      const key = `${taka.loomNo ?? "N/A"}-${taka.workerName ?? "Unknown"}`;
      const existing = grouped.get(key) ?? {
        loomNo: taka.loomNo ?? "N/A",
        workerName: taka.workerName ?? null,
        takaCount: 0,
        totalMeters: 0,
        totalSarees: 0,
        totalPieces: 0,
      };

      existing.takaCount += 1;
      existing.totalMeters += formatDecimalValue(taka.meters);
      existing.totalSarees += taka.sarees;
      existing.totalPieces += taka.pieces;
      grouped.set(key, existing);
    }

    return Array.from(grouped.values());
  }

  async getDistinctMachines(tenantId: string): Promise<string[]> {
    const result = await prisma.taka.findMany({
      where: { tenantId, deletedAt: null, loomNo: { not: null } },
      select: { loomNo: true },
      distinct: ["loomNo"],
      orderBy: { loomNo: "asc" },
    });
    return result.map((r: { loomNo: string | null }) => r.loomNo!).filter(Boolean);
  }
}
