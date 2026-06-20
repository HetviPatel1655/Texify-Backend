import type { GSTType, InvoiceStatus, PaymentStatus, PartyType, UnitType } from "../common/constants/erp";
import type { ListQuery } from "../common/types/query";

export interface InvoicePartyDto {
  id: string;
  code: string;
  name: string;
  partyType: PartyType;
  gstin: string | null;
  panNo: string | null;
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
  phone: string | null;
}

export interface InvoiceProductDto {
  id: string;
  sku: string | null;
  name: string;
  hsnCode: string | null;
  unitType: UnitType;
  gstType: GSTType;
  gstRate: string;
}

export interface InvoiceItemDto {
  id: string;
  productId: string | null;
  description: string;
  hsnCode: string | null;
  quantity: string;
  pieces: string | null;
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
  dueDays: number | null;
  orderNo: string | null;
  agentName: string | null;
  transporterName: string | null;
  transportMode: string | null;
  vehicleNumber: string | null;
  lrNo: string | null;
  eWayBillNo: string | null;
  placeOfSupply: string | null;
  challanId: string | null;
  notes: string | null;
  terms: string | null;
  remark: string | null;
  interestRate: string | null;
  subtotal: string;
  discountAmount: string;
  taxableAmount: string;
  gstAmount: string;
  sgstRate: string;
  sgstAmount: string;
  cgstRate: string;
  cgstAmount: string;
  igstRate: string;
  igstAmount: string;
  freightCharges: string;
  roundOff: string;
  grandTotal: string;
  paidAmount: string;
  balanceAmount: string;
  bankName: string | null;
  bankAccountNo: string | null;
  bankIfsc: string | null;
  bankBranch: string | null;
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
  pieces?: number | null;
}

export interface CreateInvoiceDto {
  partyId: string;
  sequenceNumber?: number;
  invoiceDate?: Date;
  gstType: GSTType;
  discount?: number;
  freightCharges?: number;
  dueDate?: Date | null;
  dueDays?: number | null;
  orderNo?: string | null;
  agentName?: string | null;
  transporterName?: string | null;
  transportMode?: string | null;
  vehicleNumber?: string | null;
  lrNo?: string | null;
  eWayBillNo?: string | null;
  placeOfSupply?: string | null;
  challanId?: string | null;
  notes?: string | null;
  terms?: string | null;
  remark?: string | null;
  interestRate?: number | null;
  bankName?: string | null;
  bankAccountNo?: string | null;
  bankIfsc?: string | null;
  bankBranch?: string | null;
  items: CreateInvoiceItemDto[];
}

export interface UpdateInvoiceDto {
  partyId?: string;
  invoiceDate?: Date;
  gstType?: GSTType;
  discount?: number;
  freightCharges?: number;
  status?: InvoiceStatus;
  paymentStatus?: PaymentStatus;
  dueDate?: Date | null;
  dueDays?: number | null;
  orderNo?: string | null;
  agentName?: string | null;
  transporterName?: string | null;
  transportMode?: string | null;
  vehicleNumber?: string | null;
  lrNo?: string | null;
  eWayBillNo?: string | null;
  placeOfSupply?: string | null;
  challanId?: string | null;
  notes?: string | null;
  terms?: string | null;
  remark?: string | null;
  interestRate?: number | null;
  bankName?: string | null;
  bankAccountNo?: string | null;
  bankIfsc?: string | null;
  bankBranch?: string | null;
  items?: CreateInvoiceItemDto[];
}

export interface InvoiceListQuery extends ListQuery {
  status?: InvoiceStatus;
  paymentStatus?: PaymentStatus;
  partyId?: string;
  fromDate?: string;
  toDate?: string;
}
