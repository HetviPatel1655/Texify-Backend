import type { ListQuery } from "../common/types/query";

export interface SaleOrderItemDto {
  id: string;
  productId: string | null;
  productName: string | null;
  description: string;
  designNo: string | null;
  shadeName: string | null;
  pieces: number;
  cut: number;
  quantity: number;
  rate: number;
  amount: number;
  remarks: string | null;
  sortOrder: number;
}

export interface SaleOrderDto {
  id: string;
  orderNumber: string;
  orderDate: string;
  partyId: string;
  partyName: string;
  agentName: string | null;
  partyMobileNo: string | null;
  status: string;
  orderDueDays: number | null;
  orderDueDate: string | null;
  billDueDays: number | null;
  remarks: string | null;
  totalPieces: number;
  totalQuantity: number;
  totalAmount: number;
  items: SaleOrderItemDto[];
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  createdById: string | null;
  updatedById: string | null;
  createdByName: string | null;
  updatedByName: string | null;
}

export interface CreateSaleOrderItemDto {
  productId?: string | null;
  description: string;
  designNo?: string | null;
  shadeName?: string | null;
  pieces?: number;
  cut?: number;
  quantity?: number;
  rate?: number;
  remarks?: string | null;
}

export interface CreateSaleOrderDto {
  orderDate?: string;
  partyId: string;
  agentName?: string | null;
  partyMobileNo?: string | null;
  orderDueDays?: number | null;
  orderDueDate?: string | null;
  billDueDays?: number | null;
  remarks?: string | null;
  items: CreateSaleOrderItemDto[];
}

export interface UpdateSaleOrderDto {
  orderDate?: string;
  partyId?: string;
  agentName?: string | null;
  partyMobileNo?: string | null;
  status?: string;
  orderDueDays?: number | null;
  orderDueDate?: string | null;
  billDueDays?: number | null;
  remarks?: string | null;
  items?: CreateSaleOrderItemDto[];
}

export interface SaleOrderListQuery extends ListQuery {
  status?: string;
  partyId?: string;
}
