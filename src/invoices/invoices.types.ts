import type { GSTType, InvoiceStatus, PaymentStatus, PartyType, UnitType } from "../common/constants/erp";
import type { ListQuery } from "../common/types/query";

export interface InvoicePartyDto {
  id: string;
  code: string;
  name: string;
  partyType: PartyType;
}

export interface InvoiceProductDto {
  id: string;
  sku: string;
  name: string;
  unitType: UnitType;
  gstType: GSTType;
  gstRate: string;
}

export interface InvoiceItemDto {
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
  product: InvoiceProductDto | null;
}

export interface InvoiceDto {
  id: string;
  gstType: GSTType;
  invoiceNumber: string;
  seriesCode: string;
  sequenceNumber: number;
  fiscalYear: string;
  partyId: string;
  status: InvoiceStatus;
  paymentStatus: PaymentStatus;
  issueDate: string;
  dueDate: string | null;
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
  paidAmount: string;
  balanceAmount: string;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  createdById: string | null;
  updatedById: string | null;
  party?: InvoicePartyDto | null;
  items?: InvoiceItemDto[];
}

export interface CreateInvoiceItemDto {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface CreateInvoiceDto {
  partyId: string;
  invoiceDate?: Date;
  gstType: GSTType;
  discount?: number;
  dueDate?: Date | null;
  notes?: string | null;
  terms?: string | null;
  transportMode?: string | null;
  vehicleNumber?: string | null;
  placeOfSupply?: string | null;
  items: CreateInvoiceItemDto[];
}

export interface UpdateInvoiceDto {
  partyId?: string;
  invoiceDate?: Date;
  gstType?: GSTType;
  discount?: number;
  status?: InvoiceStatus;
  paymentStatus?: PaymentStatus;
  notes?: string | null;
  terms?: string | null;
  transportMode?: string | null;
  vehicleNumber?: string | null;
  placeOfSupply?: string | null;
  dueDate?: Date | null;
  items?: CreateInvoiceItemDto[];
}

export interface InvoiceListQuery extends ListQuery {
  status?: InvoiceStatus;
  paymentStatus?: PaymentStatus;
  partyId?: string;
  fromDate?: string;
  toDate?: string;
}