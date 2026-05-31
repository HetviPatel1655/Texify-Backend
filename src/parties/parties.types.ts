import type { PartyType } from "../common/constants/erp";
import type { ListQuery } from "../common/types/query";

export interface PartyDto {
  id: string;
  code: string;
  name: string;
  partyType: PartyType;
  email: string | null;
  phone: string | null;
  gstin: string | null;
  billingAddress1: string | null;
  billingAddress2: string | null;
  billingCity: string | null;
  billingState: string | null;
  billingPostalCode: string | null;
  billingCountry: string | null;
  shippingAddress1: string | null;
  shippingAddress2: string | null;
  shippingCity: string | null;
  shippingState: string | null;
  shippingPostalCode: string | null;
  shippingCountry: string | null;
  isActive: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  createdById: string | null;
  updatedById: string | null;
  createdByName: string | null;
  updatedByName: string | null;
}

export interface CreatePartyDto {
  code?: string;
  name: string;
  partyType: PartyType;
  email?: string | null;
  phone?: string | null;
  gstin?: string | null;
  billingAddress1?: string | null;
  billingAddress2?: string | null;
  billingCity?: string | null;
  billingState?: string | null;
  billingPostalCode?: string | null;
  billingCountry?: string | null;
  shippingAddress1?: string | null;
  shippingAddress2?: string | null;
  shippingCity?: string | null;
  shippingState?: string | null;
  shippingPostalCode?: string | null;
  shippingCountry?: string | null;
  isActive?: boolean;
}

export interface UpdatePartyDto {
  name?: string;
  partyType?: PartyType;
  email?: string | null;
  phone?: string | null;
  gstin?: string | null;
  billingAddress1?: string | null;
  billingAddress2?: string | null;
  billingCity?: string | null;
  billingState?: string | null;
  billingPostalCode?: string | null;
  billingCountry?: string | null;
  shippingAddress1?: string | null;
  shippingAddress2?: string | null;
  shippingCity?: string | null;
  shippingState?: string | null;
  shippingPostalCode?: string | null;
  shippingCountry?: string | null;
  isActive?: boolean;
}

export interface PartyListQuery extends ListQuery {
  partyType?: PartyType;
  isActive?: boolean;
}
