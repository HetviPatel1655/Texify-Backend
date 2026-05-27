import type { InvoiceStatus, PaymentStatus, UnitType } from "../common/constants/erp";
import type { ListQuery } from "../common/types/query";

export interface InvoiceDto {
  id: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  paymentStatus: PaymentStatus;
}

export interface CreateInvoiceDto {
  partyId: string;
  issueDate?: Date;
}

export interface UpdateInvoiceDto {
  status?: InvoiceStatus;
  paymentStatus?: PaymentStatus;
}

export interface InvoiceListQuery extends ListQuery {
  status?: InvoiceStatus;
  paymentStatus?: PaymentStatus;
  unitType?: UnitType;
}
