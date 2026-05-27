import type { GSTType, UnitType } from "../common/constants/erp";
import type { ListQuery } from "../common/types/query";

export interface ProductDto {
  id: string;
  sku: string;
  name: string;
  unitType: UnitType;
  gstType: GSTType;
}

export interface CreateProductDto {
  sku: string;
  name: string;
  unitType: UnitType;
  gstType?: GSTType;
}

export interface UpdateProductDto {
  name?: string;
  unitType?: UnitType;
  gstType?: GSTType;
}

export interface ProductListQuery extends ListQuery {
  unitType?: UnitType;
  gstType?: GSTType;
}
