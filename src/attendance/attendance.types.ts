export interface AttendanceEntry {
  employeeId: string;
  date: string;
  status: "PRESENT" | "ABSENT" | "HALF_DAY";
}

export interface BulkUpsertAttendanceDto {
  month: number;
  year: number;
  entries: AttendanceEntry[];
}

export interface MonthlyEmployeeRow {
  employeeId: string;
  employeeName: string;
  employeeType: string;
  dailyRate: number;
  totalDays: number;
  amount: number;
  days: Record<number, "PRESENT" | "ABSENT" | "HALF_DAY">;
}

export interface MonthlyAttendanceGrid {
  month: number;
  year: number;
  daysInMonth: number;
  employees: MonthlyEmployeeRow[];
  totals: { totalDays: number; totalAmount: number };
}

export interface AttendanceSalaryReportQuery {
  fromDate: string;
  toDate: string;
  employeeType?: string;
  employeeId?: string;
  reportType?: "detailed" | "summary";
}

export interface SalaryReportRow {
  employeeId: string;
  employeeName: string;
  employeeType: string;
  dailyRate: number;
  totalDays: number;
  amount: number;
}

export interface SalaryReportDetailRow extends SalaryReportRow {
  entries: { date: string; status: string; dayValue: number }[];
}

export interface WorkerSalaryReportQuery {
  fromDate: string;
  toDate: string;
  dateType?: "foldingDate" | "startingDate" | "salaryDate";
  groupBy?: "worker" | "firm";
  reportType?: "detailed" | "summary";
  sortOn?: "firmWise" | "workerWise" | "greyWise";
  particular?: string;
}

export interface WorkerSalaryReportRow {
  workerName: string;
  firmName: string | null;
  takaCount: number;
  totalMeters: number;
  totalSarees: number;
  totalPieces: number;
}

export interface PatiaReportQuery {
  fromDate: string;
  toDate: string;
  firmId?: string;
  machineType?: "selected" | "all";
  reportType?: "takaWise" | "dateWise" | "summary";
  machines?: string[];
}

export interface PatiaReportRow {
  loomNo: string;
  workerName: string | null;
  takaCount: number;
  totalMeters: number;
  totalSarees: number;
  totalPieces: number;
}
