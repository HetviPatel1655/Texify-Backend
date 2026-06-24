import type { ListQuery } from "../common/types/query.js";

export interface BeamDto {
  id: string;
  beamNo: string;
  beamDate: string;
  beamPipeNo: string | null;
  itemName: string | null;
  yarnName: string | null;
  lotNo: string | null;
  ends: number;
  takas: number;
  meters: number;
  grossWt: number;
  tareWt: number;
  netWt: number;
  pootha: number;
  beamPosition: string | null;
  plannedMeters: number;
  plannedTakas: number;
  shortPercent: number;
  bhiran: number;
  status: string;
  partyId: string | null;
  partyName: string | null;
  warperName: string | null;
  loomNo: string | null;
  remarks: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  createdById: string | null;
  updatedById: string | null;
  createdByName: string | null;
  updatedByName: string | null;
}

export interface CreateBeamDto {
  beamDate?: string;
  beamPipeNo?: string | null;
  itemName?: string | null;
  yarnName?: string | null;
  lotNo?: string | null;
  ends?: number;
  takas?: number;
  meters?: number;
  grossWt?: number;
  tareWt?: number;
  pootha?: number;
  beamPosition?: string | null;
  plannedMeters?: number;
  plannedTakas?: number;
  shortPercent?: number;
  bhiran?: number;
  status?: string;
  partyId?: string | null;
  warperName?: string | null;
  loomNo?: string | null;
  remarks?: string | null;
}

export interface UpdateBeamDto {
  beamDate?: string;
  beamPipeNo?: string | null;
  itemName?: string | null;
  yarnName?: string | null;
  lotNo?: string | null;
  ends?: number;
  takas?: number;
  meters?: number;
  grossWt?: number;
  tareWt?: number;
  pootha?: number;
  beamPosition?: string | null;
  plannedMeters?: number;
  plannedTakas?: number;
  shortPercent?: number;
  bhiran?: number;
  status?: string;
  partyId?: string | null;
  warperName?: string | null;
  loomNo?: string | null;
  remarks?: string | null;
}

export interface BeamListQuery extends ListQuery {
  status?: string;
  partyId?: string;
  itemName?: string;
  warperName?: string;
  loomNo?: string;
  beamPipeNo?: string;
  dateFrom?: string;
  dateTo?: string;
}
