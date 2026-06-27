import type { ListQuery } from "../common/types/query";

export interface YarnPurchaseItemDto {
  id: string;
  cartonNo: string;
  itemName: string;
  shadeName: string | null;
  lotNo: string | null;
  denier: string | null;
  twist: string | null;
  twistDirection: string | null;
  cheese: number;
  grossWt: number;
  tareWt: number;
  netWt: number;
  rate: number;
  amount: number;
  sortOrder: number;
}

export interface YarnPurchaseDto {
  id: string;
  serialNumber: string;
  purchaseDate: string;
  billNo: string | null;
  billDate: string | null;
  partyId: string;
  partyName: string;
  billType: string;
  totalCartons: number;
  totalCheese: number;
  totalGrossWt: number;
  totalTareWt: number;
  totalNetWt: number;
  totalAmount: number;
  igstRate: number;
  igstAmount: number;
  cgstRate: number;
  cgstAmount: number;
  sgstRate: number;
  sgstAmount: number;
  billAmount: number;
  adjustedAmount: number;
  gstReceived: boolean;
  billRemarks: string | null;
  items: YarnPurchaseItemDto[];
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  createdById: string | null;
  updatedById: string | null;
  createdByName: string | null;
  updatedByName: string | null;
}

export interface CreateYarnPurchaseItemDto {
  cartonNo: string;
  itemName: string;
  shadeName?: string | null;
  lotNo?: string | null;
  denier?: string | null;
  twist?: string | null;
  twistDirection?: string | null;
  cheese?: number;
  grossWt?: number;
  tareWt?: number;
  rate?: number;
}

export interface CreateYarnPurchaseDto {
  purchaseDate?: string;
  billNo?: string | null;
  billDate?: string | null;
  partyId: string;
  billType?: string;
  igstRate?: number;
  cgstRate?: number;
  sgstRate?: number;
  billAmount?: number;
  adjustedAmount?: number;
  gstReceived?: boolean;
  billRemarks?: string | null;
  items: CreateYarnPurchaseItemDto[];
}

export interface UpdateYarnPurchaseDto {
  purchaseDate?: string;
  billNo?: string | null;
  billDate?: string | null;
  partyId?: string;
  billType?: string;
  igstRate?: number;
  cgstRate?: number;
  sgstRate?: number;
  billAmount?: number;
  adjustedAmount?: number;
  gstReceived?: boolean;
  billRemarks?: string | null;
  items?: CreateYarnPurchaseItemDto[];
}

export interface YarnPurchaseListQuery extends ListQuery {
  partyId?: string;
}
