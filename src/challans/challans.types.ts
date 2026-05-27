import type { ChallanStatus, UnitType } from "../common/constants/erp";
import type { ListQuery } from "../common/types/query";

export interface ChallanDto {
  id: string;
  challanNumber: string;
  status: ChallanStatus;
}

export interface CreateChallanDto {
  partyId: string;
  issueDate?: Date;
}

export interface UpdateChallanDto {
  status?: ChallanStatus;
}

export interface ChallanListQuery extends ListQuery {
  status?: ChallanStatus;
  unitType?: UnitType;
}
