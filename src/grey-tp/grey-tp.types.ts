import type { ListQuery } from "../common/types/query";

export interface GreyTPDto {
  id: string;
  takaId: string;
  takaNo: string;
  itemName: string | null;
  date: string;
  newMeters: number;
  originalMeters: number;
  newWeight: number;
  originalWeight: number;
  newSarees: number;
  originalSarees: number;
  remark: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  createdById: string | null;
  updatedById: string | null;
  createdByName: string | null;
  updatedByName: string | null;
}

export interface CreateGreyTPDto {
  takaNo: string;
  date?: string;
  newMeters: number;
  newWeight: number;
  newSarees: number;
  remark?: string;
}

export interface UpdateGreyTPDto {
  date?: string;
  newMeters?: number;
  newWeight?: number;
  newSarees?: number;
  remark?: string;
}

export interface GreyTPListQuery extends ListQuery {
  takaId?: string;
  dateFrom?: string;
  dateTo?: string;
}
