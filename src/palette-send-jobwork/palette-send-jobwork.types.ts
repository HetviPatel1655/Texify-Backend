import type { ListQuery } from "../common/types/query";

export interface PaletteSendDto {
  id: string;
  serialNumber: string;
  challanDate: string;
  challanNo: string | null;
  partyId: string | null;
  partyName: string | null;
  paletteNo: string | null;
  denier: string | null;
  yarnName: string | null;
  cheese: number;
  lotNo: string | null;
  netWt: number;
  amount: number;
  pendingCheese: number;
  issueCheese: number;
  pendingNetWt: number;
  issueNetWt: number;
  remarks: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  createdById: string | null;
  updatedById: string | null;
  createdByName: string | null;
  updatedByName: string | null;
}

export interface CreatePaletteSendDto {
  challanDate?: string;
  challanNo?: string | null;
  partyId?: string | null;
  paletteNo?: string | null;
  denier?: string | null;
  yarnName?: string | null;
  cheese?: number;
  lotNo?: string | null;
  netWt?: number;
  amount?: number;
  pendingCheese?: number;
  issueCheese?: number;
  pendingNetWt?: number;
  issueNetWt?: number;
  remarks?: string | null;
}

export interface UpdatePaletteSendDto {
  challanDate?: string;
  challanNo?: string | null;
  partyId?: string | null;
  paletteNo?: string | null;
  denier?: string | null;
  yarnName?: string | null;
  cheese?: number;
  lotNo?: string | null;
  netWt?: number;
  amount?: number;
  pendingCheese?: number;
  issueCheese?: number;
  pendingNetWt?: number;
  issueNetWt?: number;
  remarks?: string | null;
}

export interface PaletteSendListQuery extends ListQuery {
  partyId?: string;
  dateFrom?: string;
  dateTo?: string;
}
