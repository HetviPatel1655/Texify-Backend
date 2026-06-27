import type { ListQuery } from "../common/types/query";

export interface TakaDto {
  id: string;
  takaNo: string;
  takaPrefix: string | null;
  date: string;
  loomNo: string | null;
  beamId: string | null;
  beamNo: string | null;
  firmId: string | null;
  firmName: string | null;
  itemName: string | null;
  grade: string | null;
  designNo: string | null;
  shadeName: string | null;
  meters: number;
  weight: number;
  avgWeightPerMeter: number;
  shouldBeWeight: number;
  weightDiff: number;
  sarees: number;
  pieces: number;
  cut: string | null;
  workerName: string | null;
  foldingDate: string | null;
  startingDate: string | null;
  cuttingDate: string | null;
  salaryDate: string | null;
  wtPerMtr: number;
  status: string;
  isWithBeam: boolean;
  serialNoWiseTaka: boolean;
  remarks: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  createdById: string | null;
  updatedById: string | null;
  createdByName: string | null;
  updatedByName: string | null;
}

export interface CreateTakaDto {
  takaNo?: string;
  takaPrefix?: string;
  date?: string;
  loomNo?: string;
  beamId?: string;
  firmId?: string;
  itemName?: string;
  grade?: string;
  designNo?: string;
  shadeName?: string;
  meters?: number;
  weight?: number;
  sarees?: number;
  pieces?: number;
  cut?: string;
  workerName?: string;
  foldingDate?: string;
  startingDate?: string;
  cuttingDate?: string;
  salaryDate?: string;
  wtPerMtr?: number;
  status?: string;
  isWithBeam?: boolean;
  serialNoWiseTaka?: boolean;
  remarks?: string;
}

export interface UpdateTakaDto extends Partial<CreateTakaDto> {}

export interface TakaListQuery extends ListQuery {
  status?: string;
  isWithBeam?: string;
  beamId?: string;
  firmId?: string;
  loomNo?: string;
  itemName?: string;
  grade?: string;
  workerName?: string;
  shadeName?: string;
  dateFrom?: string;
  dateTo?: string;
  dateType?: string;
}
