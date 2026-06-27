import type { ListQuery } from "../common/types/query";

export interface YarnSendItemDto {
  id: string;
  cartonNo: string;
  itemName: string | null;
  shadeName: string | null;
  lotNo: string | null;
  denier: string | null;
  twist: string | null;
  twistDirection: string | null;
  cheese: number;
  grossWt: number;
  tareWt: number;
  netWt: number;
  remarks: string | null;
  sortOrder: number;
}

export interface YarnSendDto {
  id: string;
  serialNumber: string;
  challanDate: string;
  challanNo: string | null;
  firmId: string | null;
  firmName: string | null;
  partyId: string | null;
  partyName: string | null;
  totalCartons: number;
  totalCheese: number;
  totalGrossWt: number;
  totalTareWt: number;
  totalNetWt: number;
  goodsRate: number;
  goodsAmount: number;
  remarks: string | null;
  items: YarnSendItemDto[];
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  createdById: string | null;
  updatedById: string | null;
  createdByName: string | null;
  updatedByName: string | null;
}

export interface CreateYarnSendItemDto {
  cartonNo: string;
  itemName?: string | null;
  shadeName?: string | null;
  lotNo?: string | null;
  denier?: string | null;
  twist?: string | null;
  twistDirection?: string | null;
  cheese?: number;
  grossWt?: number;
  tareWt?: number;
  netWt?: number;
  remarks?: string | null;
}

export interface CreateYarnSendDto {
  challanDate?: string;
  challanNo?: string | null;
  firmId?: string | null;
  partyId?: string | null;
  goodsRate?: number;
  goodsAmount?: number;
  remarks?: string | null;
  items: CreateYarnSendItemDto[];
}

export interface UpdateYarnSendDto {
  challanDate?: string;
  challanNo?: string | null;
  firmId?: string | null;
  partyId?: string | null;
  goodsRate?: number;
  goodsAmount?: number;
  remarks?: string | null;
  items?: CreateYarnSendItemDto[];
}

export interface YarnSendListQuery extends ListQuery {
  firmId?: string;
  partyId?: string;
  dateFrom?: string;
  dateTo?: string;
}
