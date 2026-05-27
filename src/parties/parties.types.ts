import type { PartyType } from "../common/constants/erp";
import type { ListQuery } from "../common/types/query";

export interface PartyDto {
  id: string;
  code: string;
  name: string;
  partyType: PartyType;
}

export interface CreatePartyDto {
  code: string;
  name: string;
  partyType: PartyType;
}

export interface UpdatePartyDto {
  name?: string;
  partyType?: PartyType;
}

export interface PartyListQuery extends ListQuery {
  partyType?: PartyType;
}
