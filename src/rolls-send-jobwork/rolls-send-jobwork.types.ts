import type { ListQuery } from "../common/types/query";

export interface RollsSendDto {
  id: string;
  serialNumber: string;
  challanDate: string;
  challanNo: string | null;
  partyId: string | null;
  partyName: string | null;
  yarnName: string | null;
  lotNo: string | null;
  cages: number;
  rolls: number;
  grossWt: number;
  tareWt: number;
  netWt: number;
  emptyRollWt: number;
  remarks: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  createdById: string | null;
  updatedById: string | null;
  createdByName: string | null;
  updatedByName: string | null;
}

export interface CreateRollsSendDto {
  challanDate?: string;
  challanNo?: string | null;
  partyId?: string | null;
  yarnName?: string | null;
  lotNo?: string | null;
  cages?: number;
  rolls?: number;
  grossWt?: number;
  tareWt?: number;
  netWt?: number;
  emptyRollWt?: number;
  remarks?: string | null;
}

export interface UpdateRollsSendDto {
  challanDate?: string;
  challanNo?: string | null;
  partyId?: string | null;
  yarnName?: string | null;
  lotNo?: string | null;
  cages?: number;
  rolls?: number;
  grossWt?: number;
  tareWt?: number;
  netWt?: number;
  emptyRollWt?: number;
  remarks?: string | null;
}

export interface RollsSendListQuery extends ListQuery {
  partyId?: string;
  dateFrom?: string;
  dateTo?: string;
}
