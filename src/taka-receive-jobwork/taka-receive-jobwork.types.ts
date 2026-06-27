import type { ListQuery } from "../common/types/query";

export interface TakaReceiveItemDto {
  id: string;
  takaNo: string;
  loomNo: string | null;
  meters: number;
  weight: number;
  itemName: string | null;
  avgWeight: number;
  shouldBeWeight: number;
  weightDiff: number;
  grade: string | null;
  designNo: string | null;
  shadeName: string | null;
  beamTakaNo: string | null;
  cut: string | null;
  sarees: number;
  remarks: string | null;
  sortOrder: number;
}

export interface TakaReceiveDto {
  id: string;
  serialNumber: string;
  challanDate: string;
  challanNo: string | null;
  partyId: string | null;
  partyName: string | null;
  firmId: string | null;
  firmName: string | null;
  qualityName: string | null;
  takaPrefix: string | null;
  lotNo: string | null;
  withBeam: boolean;
  totalTakas: number;
  totalMeters: number;
  totalWeight: number;
  totalSarees: number;
  originalChallanNo: string | null;
  originalChallanDate: string | null;
  goodsRate: number;
  goodsAmount: number;
  remarks: string | null;
  items: TakaReceiveItemDto[];
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  createdById: string | null;
  updatedById: string | null;
  createdByName: string | null;
  updatedByName: string | null;
}

export interface CreateTakaReceiveItemDto {
  takaNo: string;
  loomNo?: string | null;
  meters?: number;
  weight?: number;
  itemName?: string | null;
  avgWeight?: number;
  shouldBeWeight?: number;
  weightDiff?: number;
  grade?: string | null;
  designNo?: string | null;
  shadeName?: string | null;
  beamTakaNo?: string | null;
  cut?: string | null;
  sarees?: number;
  remarks?: string | null;
}

export interface CreateTakaReceiveDto {
  challanDate?: string;
  challanNo?: string | null;
  partyId?: string | null;
  firmId?: string | null;
  qualityName?: string | null;
  takaPrefix?: string | null;
  lotNo?: string | null;
  withBeam?: boolean;
  originalChallanNo?: string | null;
  originalChallanDate?: string | null;
  goodsRate?: number;
  goodsAmount?: number;
  remarks?: string | null;
  items: CreateTakaReceiveItemDto[];
}

export interface UpdateTakaReceiveDto {
  challanDate?: string;
  challanNo?: string | null;
  partyId?: string | null;
  firmId?: string | null;
  qualityName?: string | null;
  takaPrefix?: string | null;
  lotNo?: string | null;
  withBeam?: boolean;
  originalChallanNo?: string | null;
  originalChallanDate?: string | null;
  goodsRate?: number;
  goodsAmount?: number;
  remarks?: string | null;
  items?: CreateTakaReceiveItemDto[];
}

export interface TakaReceiveListQuery extends ListQuery {
  firmId?: string;
  partyId?: string;
  dateFrom?: string;
  dateTo?: string;
}
