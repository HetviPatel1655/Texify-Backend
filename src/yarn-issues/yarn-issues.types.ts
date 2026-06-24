import type { ListQuery } from "../common/types/query.js";

export interface YarnIssueDto {
  id: string;
  issueDate: string;
  slipNo: string;
  cartonNo: string;
  yarnName: string | null;
  lotNo: string | null;
  twistDirection: string | null;
  cheese: number;
  netWt: number;
  amount: number;
  shadeName: string | null;
  deptName: string;
  remarks: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  createdById: string | null;
  updatedById: string | null;
  createdByName: string | null;
  updatedByName: string | null;
}

export interface CreateYarnIssueDto {
  issueDate?: string;
  cartonNo: string;
  yarnName?: string | null;
  lotNo?: string | null;
  twistDirection?: string | null;
  cheese?: number;
  netWt?: number;
  amount?: number;
  shadeName?: string | null;
  deptName?: string;
  remarks?: string | null;
}

export interface UpdateYarnIssueDto {
  issueDate?: string;
  cartonNo?: string;
  yarnName?: string | null;
  lotNo?: string | null;
  twistDirection?: string | null;
  cheese?: number;
  netWt?: number;
  amount?: number;
  shadeName?: string | null;
  deptName?: string;
  remarks?: string | null;
}

export interface YarnIssueListQuery extends ListQuery {
  cartonNo?: string;
  deptName?: string;
}
