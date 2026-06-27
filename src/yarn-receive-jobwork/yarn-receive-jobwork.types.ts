import type { ListQuery } from "../common/types/query";

export interface YarnReceiveDto {
  id: string;
  serialNumber: string;
  challanDate: string;
  challanNo: string | null;
  partyId: string | null;
  partyName: string | null;
  yarnName: string | null;
  shadeName: string | null;
  emptyRollWt: number;
  lotNo: string | null;
  denier: string | null;
  twist: string | null;
  cages: number;
  rolls: number;
  grossWt: number;
  tareWt: number;
  netWt: number;
  goodsRate: number;
  goodsAmount: number;
  deptName: string | null;
  originalChallanNo: string | null;
  originalChallanDate: string | null;
  remarks: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  createdById: string | null;
  updatedById: string | null;
  createdByName: string | null;
  updatedByName: string | null;
}

export interface CreateYarnReceiveDto {
  challanDate?: string;
  challanNo?: string | null;
  partyId?: string | null;
  yarnName?: string | null;
  shadeName?: string | null;
  emptyRollWt?: number;
  lotNo?: string | null;
  denier?: string | null;
  twist?: string | null;
  cages?: number;
  rolls?: number;
  grossWt?: number;
  tareWt?: number;
  netWt?: number;
  goodsRate?: number;
  goodsAmount?: number;
  deptName?: string | null;
  originalChallanNo?: string | null;
  originalChallanDate?: string | null;
  remarks?: string | null;
}

export interface UpdateYarnReceiveDto {
  challanDate?: string;
  challanNo?: string | null;
  partyId?: string | null;
  yarnName?: string | null;
  shadeName?: string | null;
  emptyRollWt?: number;
  lotNo?: string | null;
  denier?: string | null;
  twist?: string | null;
  cages?: number;
  rolls?: number;
  grossWt?: number;
  tareWt?: number;
  netWt?: number;
  goodsRate?: number;
  goodsAmount?: number;
  deptName?: string | null;
  originalChallanNo?: string | null;
  originalChallanDate?: string | null;
  remarks?: string | null;
}

export interface YarnReceiveListQuery extends ListQuery {
  partyId?: string;
  dateFrom?: string;
  dateTo?: string;
}
