import type { ListQuery } from "../common/types/query";

export interface BankEntryAdjustmentDto {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  invoiceDate: string;
  invoiceTotal: number;
  amount: number;
}

export interface BankEntryDto {
  id: string;
  serialNumber: string;
  type: "SLIP" | "CHEQUE";
  entryDate: string;
  slipRecNo: string | null;
  bankName: string;
  partyId: string;
  partyName: string;
  chequeNo: string | null;
  chequeDate: string | null;
  amount: number;
  remarks: string | null;
  billWisePayment: boolean;
  unadjustedAmount: number;
  adjustments: BankEntryAdjustmentDto[];
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  createdById: string | null;
  updatedById: string | null;
  createdByName: string | null;
  updatedByName: string | null;
}

export interface CreateBankEntryAdjustmentDto {
  invoiceId: string;
  amount: number;
}

export interface CreateBankEntryDto {
  type: "SLIP" | "CHEQUE";
  entryDate?: string;
  slipRecNo?: string | null;
  bankName: string;
  partyId: string;
  chequeNo?: string | null;
  chequeDate?: string | null;
  amount: number;
  remarks?: string | null;
  billWisePayment?: boolean;
  adjustments?: CreateBankEntryAdjustmentDto[];
}

export interface UpdateBankEntryDto {
  type?: "SLIP" | "CHEQUE";
  entryDate?: string;
  slipRecNo?: string | null;
  bankName?: string;
  partyId?: string;
  chequeNo?: string | null;
  chequeDate?: string | null;
  amount?: number;
  remarks?: string | null;
  billWisePayment?: boolean;
  adjustments?: CreateBankEntryAdjustmentDto[];
}

export interface BankEntryListQuery extends ListQuery {
  type?: "SLIP" | "CHEQUE";
  partyId?: string;
  fromDate?: string;
  toDate?: string;
}

export interface OutstandingInvoiceDto {
  id: string;
  invoiceNumber: string;
  issueDate: string;
  grandTotal: number;
  paidAmount: number;
  adjustedAmount: number;
  balance: number;
}
