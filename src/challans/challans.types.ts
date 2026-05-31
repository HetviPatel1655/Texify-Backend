import type { ChallanStatus, DocumentType } from "../common/constants/erp";
import type { ListQuery } from "../common/types/query";

export interface ChallanItemDto {
  id: string;
  productId: string | null;
  description: string;
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
  notes: string | null;
  terms: string | null;
  transportMode: string | null;
  vehicleNumber: string | null;
  placeOfSupply: string | null;
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
  items: ChallanItemDto[];
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
}

export interface CreateChallanDto {
  partyId: string;
  issueDate?: Date;
  notes?: string | null;
  terms?: string | null;
  transportMode?: string | null;
  vehicleNumber?: string | null;
  placeOfSupply?: string | null;
  items: CreateChallanItemDto[];
}

export interface UpdateChallanDto {
  status?: ChallanStatus;
  notes?: string | null;
  terms?: string | null;
  transportMode?: string | null;
  vehicleNumber?: string | null;
  placeOfSupply?: string | null;
}

export interface ChallanListQuery extends ListQuery {
  status?: ChallanStatus;
  partyId?: string;
  fromDate?: string;
  toDate?: string;
}