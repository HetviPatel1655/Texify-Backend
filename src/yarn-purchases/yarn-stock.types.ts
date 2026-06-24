export type YarnStockQuery = {
  asOnDate?: string;
  groupBy?: "item" | "shade" | "carton";
  reportType?: "detailed" | "summary";
  itemName?: string;
};

export type YarnStockLineDto = {
  itemName: string;
  shadeName: string | null;
  cartonNo: string | null;
  lotNo: string | null;
  denier: string | null;
  purchasedCheese: number;
  purchasedNetWt: number;
  purchasedAmount: number;
  issuedCheese: number;
  issuedNetWt: number;
  issuedAmount: number;
  balanceCheese: number;
  balanceNetWt: number;
  balanceAmount: number;
};

export type YarnStockSummaryDto = {
  totalPurchasedCheese: number;
  totalPurchasedNetWt: number;
  totalPurchasedAmount: number;
  totalIssuedCheese: number;
  totalIssuedNetWt: number;
  totalIssuedAmount: number;
  totalBalanceCheese: number;
  totalBalanceNetWt: number;
  totalBalanceAmount: number;
  lines: YarnStockLineDto[];
};
