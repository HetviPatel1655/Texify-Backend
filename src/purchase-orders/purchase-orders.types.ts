import type { ListQuery } from "../common/types/query.js";

export interface PurchaseOrderItemDto {
  id: string;
  productId: string | null;
  productName: string | null;
  description: string;
  pieces: number;
  quantity: number;
  rate: number;
  amount: number;
  remarks: string | null;
  sortOrder: number;
}

export interface PurchaseOrderDto {
  id: string;
  orderNumber: string;
  orderDate: string;
  partyId: string;
  partyName: string;
  status: string;
  remarks: string | null;
  totalPieces: number;
  totalQuantity: number;
  totalAmount: number;
  items: PurchaseOrderItemDto[];
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  createdById: string | null;
  updatedById: string | null;
  createdByName: string | null;
  updatedByName: string | null;
}

export interface CreatePurchaseOrderItemDto {
  productId?: string | null;
  description: string;
  pieces?: number;
  quantity?: number;
  rate?: number;
  remarks?: string | null;
}

export interface CreatePurchaseOrderDto {
  orderDate?: string;
  partyId: string;
  remarks?: string | null;
  items: CreatePurchaseOrderItemDto[];
}

export interface UpdatePurchaseOrderDto {
  orderDate?: string;
  partyId?: string;
  status?: string;
  remarks?: string | null;
  items?: CreatePurchaseOrderItemDto[];
}

export interface PurchaseOrderListQuery extends ListQuery {
  status?: string;
  partyId?: string;
}
