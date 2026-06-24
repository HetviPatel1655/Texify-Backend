import { prisma } from "../lib/prisma.js";
import { formatDecimalValue } from "../common/utils/decimal.js";
import type { YarnStockQuery, YarnStockLineDto, YarnStockSummaryDto } from "./yarn-stock.types.js";

export async function getYarnStock(
  tenantId: string,
  query: YarnStockQuery
): Promise<YarnStockSummaryDto> {
  const asOnDate = query.asOnDate ? new Date(query.asOnDate) : undefined;
  const groupBy = query.groupBy ?? "item";
  const reportType = query.reportType ?? "summary";

  const purchaseDateFilter = asOnDate ? { lte: asOnDate } : undefined;
  const issueDateFilter = asOnDate ? { lte: asOnDate } : undefined;

  const itemNameFilter = query.itemName || undefined;

  const [purchaseItems, issues] = await Promise.all([
    prisma.yarnPurchaseItem.findMany({
      where: {
        yarnPurchase: {
          tenantId,
          deletedAt: null,
          ...(purchaseDateFilter ? { purchaseDate: purchaseDateFilter } : {}),
        },
        ...(itemNameFilter ? { itemName: itemNameFilter } : {}),
      },
      select: {
        cartonNo: true,
        itemName: true,
        shadeName: true,
        lotNo: true,
        denier: true,
        cheese: true,
        netWt: true,
        amount: true,
      },
    }),
    prisma.yarnIssue.findMany({
      where: {
        tenantId,
        deletedAt: null,
        ...(issueDateFilter ? { issueDate: issueDateFilter } : {}),
        ...(itemNameFilter ? { yarnName: itemNameFilter } : {}),
      },
      select: {
        cartonNo: true,
        yarnName: true,
        shadeName: true,
        lotNo: true,
        cheese: true,
        netWt: true,
        amount: true,
      },
    }),
  ]);

  const purchaseMap = new Map<string, YarnStockLineDto>();

  for (const item of purchaseItems) {
    const key = buildKey(groupBy, reportType, item.itemName, item.shadeName, item.cartonNo, item.lotNo);
    const line = getOrCreate(purchaseMap, key, item.itemName, item.shadeName, item.cartonNo, item.lotNo, groupBy, reportType);
    line.purchasedCheese += formatDecimalValue(item.cheese);
    line.purchasedNetWt += formatDecimalValue(item.netWt);
    line.purchasedAmount += formatDecimalValue(item.amount);
  }

  for (const issue of issues) {
    const itemName = issue.yarnName ?? "";
    const key = buildKey(groupBy, reportType, itemName, issue.shadeName, issue.cartonNo, issue.lotNo);
    const line = getOrCreate(purchaseMap, key, itemName, issue.shadeName, issue.cartonNo, issue.lotNo, groupBy, reportType);
    line.issuedCheese += formatDecimalValue(issue.cheese);
    line.issuedNetWt += formatDecimalValue(issue.netWt);
    line.issuedAmount += formatDecimalValue(issue.amount);
  }

  const lines: YarnStockLineDto[] = [];
  let totalPurchasedCheese = 0, totalPurchasedNetWt = 0, totalPurchasedAmount = 0;
  let totalIssuedCheese = 0, totalIssuedNetWt = 0, totalIssuedAmount = 0;

  for (const line of purchaseMap.values()) {
    line.balanceCheese = round2(line.purchasedCheese - line.issuedCheese);
    line.balanceNetWt = round2(line.purchasedNetWt - line.issuedNetWt);
    line.balanceAmount = round2(line.purchasedAmount - line.issuedAmount);
    line.purchasedCheese = round2(line.purchasedCheese);
    line.purchasedNetWt = round2(line.purchasedNetWt);
    line.purchasedAmount = round2(line.purchasedAmount);
    line.issuedCheese = round2(line.issuedCheese);
    line.issuedNetWt = round2(line.issuedNetWt);
    line.issuedAmount = round2(line.issuedAmount);

    totalPurchasedCheese += line.purchasedCheese;
    totalPurchasedNetWt += line.purchasedNetWt;
    totalPurchasedAmount += line.purchasedAmount;
    totalIssuedCheese += line.issuedCheese;
    totalIssuedNetWt += line.issuedNetWt;
    totalIssuedAmount += line.issuedAmount;

    lines.push(line);
  }

  lines.sort((a, b) => a.itemName.localeCompare(b.itemName) || (a.shadeName ?? "").localeCompare(b.shadeName ?? "") || (a.cartonNo ?? "").localeCompare(b.cartonNo ?? ""));

  return {
    totalPurchasedCheese: round2(totalPurchasedCheese),
    totalPurchasedNetWt: round2(totalPurchasedNetWt),
    totalPurchasedAmount: round2(totalPurchasedAmount),
    totalIssuedCheese: round2(totalIssuedCheese),
    totalIssuedNetWt: round2(totalIssuedNetWt),
    totalIssuedAmount: round2(totalIssuedAmount),
    totalBalanceCheese: round2(totalPurchasedCheese - totalIssuedCheese),
    totalBalanceNetWt: round2(totalPurchasedNetWt - totalIssuedNetWt),
    totalBalanceAmount: round2(totalPurchasedAmount - totalIssuedAmount),
    lines,
  };
}

function buildKey(
  groupBy: string,
  reportType: string,
  itemName: string,
  shadeName: string | null,
  cartonNo: string | null,
  lotNo: string | null
): string {
  if (reportType === "summary") {
    if (groupBy === "shade") return `${itemName}||${shadeName ?? ""}`;
    if (groupBy === "carton") return `${itemName}||${cartonNo ?? ""}`;
    return itemName;
  }
  return `${itemName}||${shadeName ?? ""}||${cartonNo ?? ""}||${lotNo ?? ""}`;
}

function getOrCreate(
  map: Map<string, YarnStockLineDto>,
  key: string,
  itemName: string,
  shadeName: string | null,
  cartonNo: string | null,
  lotNo: string | null,
  groupBy: string,
  reportType: string
): YarnStockLineDto {
  let line = map.get(key);
  if (!line) {
    line = {
      itemName,
      shadeName: (groupBy === "shade" || reportType === "detailed") ? shadeName : null,
      cartonNo: (groupBy === "carton" || reportType === "detailed") ? cartonNo : null,
      lotNo: reportType === "detailed" ? lotNo : null,
      denier: null,
      purchasedCheese: 0, purchasedNetWt: 0, purchasedAmount: 0,
      issuedCheese: 0, issuedNetWt: 0, issuedAmount: 0,
      balanceCheese: 0, balanceNetWt: 0, balanceAmount: 0,
    };
    map.set(key, line);
  }
  return line;
}

function round2(v: number): number {
  return Math.round(v * 100) / 100;
}
