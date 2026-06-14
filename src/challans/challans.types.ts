import type { ChallanStatus, DocumentType, PartyType } from "../common/constants/erp";
import type { ListQuery } from "../common/types/query";

export interface ChallanRollEntryDto {
  id: string;
  serialNumber: number;
  meters: string;
}

export interface ChallanItemDto {
  id: string;
  productId: string | null;
  description: string;
  hsnCode: string | null;
  quantity: string;
  unit: string;
  unitType: string;
  rate: string;
  discountAmount: string;
  gstRate: string;
  taxableAmount: string;
  gstAmount: string;
  subtotal: string;
  grandTotal: string;
  sortOrder: number;
  rollEntries: ChallanRollEntryDto[];
  product: ChallanProductDto | null;
}

export interface ChallanProductDto {
  id: string;
  sku: string | null;
  name: string;
  hsnCode: string | null;
  unitType: string;
}

export interface ChallanPartyDto {
  id: string;
  code: string;
  name: string;
  partyType: PartyType;
  gstin: string | null;
  phone: string | null;
  billingAddress1: string | null;
  billingAddress2: string | null;
  billingCity: string | null;
  billingState: string | null;
  billingStateCode: string | null;
  billingPostalCode: string | null;
  shippingAddress1: string | null;
  shippingAddress2: string | null;
  shippingCity: string | null;
  shippingState: string | null;
  shippingStateCode: string | null;
  shippingPostalCode: string | null;
}

export interface ChallanDto {
  id: string;
  documentType: DocumentType;
  challanNumber: string;
  seriesCode: string;
  sequenceNumber: number;
  fiscalYear: string;
  partyId: string;
  status: ChallanStatus;
  issueDate: string;
  agentName: string | null;
  notes: string | null;
  terms: string | null;
  remark: string | null;
  transportMode: string | null;
  vehicleNumber: string | null;
  placeOfSupply: string | null;
  deliveryPartyName: string | null;
  deliveryAddress1: string | null;
  deliveryAddress2: string | null;
  deliveryCity: string | null;
  deliveryState: string | null;
  deliveryPostalCode: string | null;
  deliveryGstin: string | null;
  deliveryPhone: string | null;
  totalTakas: number;
  totalMeters: string;
  subtotal: string;
  discountAmount: string;
  gstAmount: string;
  roundOff: string;
  grandTotal: string;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  createdById: string | null;
  updatedById: string | null;
  party: ChallanPartyDto | null;
  items: ChallanItemDto[];
}

export interface CreateRollEntryDto {
  serialNumber: number;
  meters: number;
}

export interface CreateChallanItemDto {
  productId?: string | null;
  description: string;
  quantity: number;
  unit: string;
  unitType: string;
  rate: number;
  discountAmount?: number;
  gstRate?: number;
  rollEntries?: CreateRollEntryDto[];
}

export interface CreateChallanDto {
  partyId: string;
  sequenceNumber?: number;
  issueDate?: Date;
  agentName?: string | null;
  notes?: string | null;
  terms?: string | null;
  remark?: string | null;
  transportMode?: string | null;
  vehicleNumber?: string | null;
  placeOfSupply?: string | null;
  deliveryPartyName?: string | null;
  deliveryAddress1?: string | null;
  deliveryAddress2?: string | null;
  deliveryCity?: string | null;
  deliveryState?: string | null;
  deliveryPostalCode?: string | null;
  deliveryGstin?: string | null;
  deliveryPhone?: string | null;
  items: CreateChallanItemDto[];
}

export interface UpdateChallanDto {
  status?: ChallanStatus;
  agentName?: string | null;
  notes?: string | null;
  terms?: string | null;
  remark?: string | null;
  transportMode?: string | null;
  vehicleNumber?: string | null;
  placeOfSupply?: string | null;
  deliveryPartyName?: string | null;
  deliveryAddress1?: string | null;
  deliveryAddress2?: string | null;
  deliveryCity?: string | null;
  deliveryState?: string | null;
  deliveryPostalCode?: string | null;
  deliveryGstin?: string | null;
  deliveryPhone?: string | null;
  items?: CreateChallanItemDto[];
}

export interface ChallanListQuery extends ListQuery {
  status?: ChallanStatus;
  partyId?: string;
  fromDate?: string;
  toDate?: string;
}
