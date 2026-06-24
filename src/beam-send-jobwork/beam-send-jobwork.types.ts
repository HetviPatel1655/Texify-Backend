import type { ListQuery } from "../common/types/query.js";

export interface BeamSendItemDto {
  id: string;
  beamId: string | null;
  beamNo: string;
  yarnName: string | null;
  lotNo: string | null;
  ends: number;
  takas: number;
  meters: number;
  grossWt: number;
  tareWt: number;
  netWt: number;
  pootha: number;
  remarks: string | null;
  sortOrder: number;
}

export interface BeamSendDto {
  id: string;
  serialNumber: string;
  challanDate: string;
  challanNo: string | null;
  firmId: string | null;
  firmName: string | null;
  partyId: string | null;
  partyName: string | null;
  totalBeamPipes: number;
  totalTakas: number;
  totalMeters: number;
  totalGrossWt: number;
  totalTareWt: number;
  totalNetWt: number;
  totalPootha: number;
  goodsRate: number;
  goodsAmount: number;
  remarks: string | null;
  items: BeamSendItemDto[];
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  createdById: string | null;
  updatedById: string | null;
  createdByName: string | null;
  updatedByName: string | null;
}

export interface CreateBeamSendItemDto {
  beamId?: string | null;
  beamNo: string;
  yarnName?: string | null;
  lotNo?: string | null;
  ends?: number;
  takas?: number;
  meters?: number;
  grossWt?: number;
  tareWt?: number;
  netWt?: number;
  pootha?: number;
  remarks?: string | null;
}

export interface CreateBeamSendDto {
  challanDate?: string;
  challanNo?: string | null;
  firmId?: string | null;
  partyId?: string | null;
  goodsRate?: number;
  goodsAmount?: number;
  remarks?: string | null;
  items: CreateBeamSendItemDto[];
}

export interface UpdateBeamSendDto {
  challanDate?: string;
  challanNo?: string | null;
  firmId?: string | null;
  partyId?: string | null;
  goodsRate?: number;
  goodsAmount?: number;
  remarks?: string | null;
  items?: CreateBeamSendItemDto[];
}

export interface BeamSendListQuery extends ListQuery {
  firmId?: string;
  partyId?: string;
  dateFrom?: string;
  dateTo?: string;
}
