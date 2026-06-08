import type { GSTType, UnitType } from "../common/constants/erp";
import type { ListQuery } from "../common/types/query";

export interface ProductDto {
  id: string;
  sku: string | null;
  name: string;
  description: string | null;
  hsnCode: string;
  unitType: UnitType;
  gstType: GSTType;
  gstRate: string;
  purchaseRate: string;
  sellingRate: string;
  trackInventory: boolean;
  openingStock: string;
  reorderLevel: string;
  isActive: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  createdById: string | null;
  updatedById: string | null;
}

export interface CreateProductDto {
  sku?: string | null;
  name: string;
  description?: string | null;
  hsnCode: string;
  unitType: UnitType;
  gstType?: GSTType;
  gstRate?: number;
  purchaseRate?: number;
  sellingRate?: number;
  trackInventory?: boolean;
  openingStock?: number;
  reorderLevel?: number;
  isActive?: boolean;
}

export interface UpdateProductDto {
  name?: string;
  description?: string | null;
  hsnCode?: string;
  unitType?: UnitType;
  gstType?: GSTType;
  gstRate?: number;
  purchaseRate?: number;
  sellingRate?: number;
  trackInventory?: boolean;
  openingStock?: number;
  reorderLevel?: number;
  isActive?: boolean;
}

export interface ProductListQuery extends ListQuery {
  unitType?: UnitType;
  gstType?: GSTType;
  isActive?: boolean;
}
