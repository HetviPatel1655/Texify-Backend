import type { ListQuery } from "../common/repositories/base.repository.js";

export interface ReturnTakaDto {
  id: string;
  takaId: string;
  takaNo: string;
  itemName: string | null;
  meters: number;
  weight: number;
  loomNo: string | null;
  returnDate: string;
  partyId: string | null;
  partyName: string | null;
  challanNo: string | null;
  rate: number;
  remarks: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  createdById: string | null;
  updatedById: string | null;
  createdByName: string | null;
  updatedByName: string | null;
}

export interface CreateReturnTakaDto {
  takaNo: string;
  returnDate?: string;
  partyId?: string;
  challanNo?: string;
  rate?: number;
  remarks?: string;
}

export interface UpdateReturnTakaDto {
  returnDate?: string;
  partyId?: string;
  challanNo?: string;
  rate?: number;
  remarks?: string;
}

export interface ReturnTakaListQuery extends ListQuery {
  takaId?: string;
  partyId?: string;
  dateFrom?: string;
  dateTo?: string;
}
