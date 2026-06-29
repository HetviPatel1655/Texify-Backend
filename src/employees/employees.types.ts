import type { RepositoryListOptions } from "../common/repositories/base.repository";

export interface EmployeeDto {
  id: string;
  name: string;
  employeeType: string;
  dailyRate: number;
  isActive: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  createdById: string | null;
  updatedById: string | null;
  createdByName: string | null;
  updatedByName: string | null;
}

export interface CreateEmployeeDto {
  name: string;
  employeeType: string;
  dailyRate: number;
  isActive?: boolean;
}

export interface UpdateEmployeeDto {
  name?: string;
  employeeType?: string;
  dailyRate?: number;
  isActive?: boolean;
}

export interface EmployeeListQuery extends RepositoryListOptions {
  employeeType?: string;
  isActive?: string;
}
