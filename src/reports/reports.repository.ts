import { prisma } from "../lib/prisma";
import { formatDecimalValue } from "../common/utils/decimal";
import type {
  BeamCardReportQuery,
  BeamCardReportRow,
  BeamIssueReportQuery,
  BeamIssueReportRow,
  BeamRegisterReportQuery,
  BeamRegisterReportRow,
  YarnIssueReportQuery,
  YarnIssueReportRow,
  YarnReceiveReportQuery,
  YarnReceiveReportRow,
  RollsIssueReportQuery,
  RollsIssueReportRow,
  TakaReceivedReportQuery,
  TakaReceivedReportRow,
  YarnSaleChallanReportQuery,
  YarnSaleChallanReportRow,
  SaleOutstandingReportQuery,
  SaleOutstandingReportRow,
  PurchaseOutstandingReportQuery,
  PurchaseOutstandingReportRow,
} from "./reports.types";

function parseDateRange(fromDate: string, toDate: string) {
  return {
    gte: new Date(fromDate),
    lte: new Date(`${toDate}T23:59:59.999Z`),
  };
}

function containsFilter(value: string) {
  return { contains: value, mode: "insensitive" as const };
}

export class ReportsRepository {
  // ─── 1. Beam Card Report ─────────────────────────────────────────────

  async getBeamCardReport(
    tenantId: string,
    query: BeamCardReportQuery,
  ): Promise<BeamCardReportRow[]> {
    const { fromDate, toDate, particular, groupBy } = query;

    const where: any = {
      tenantId,
      deletedAt: null,
      challanDate: parseDateRange(fromDate, toDate),
    };

    if (particular) {
      where.party = { name: containsFilter(particular) };
    }

    const orderBy: any = {};
    if (groupBy === "jobworker") orderBy.party = { name: "asc" };
    else if (groupBy === "beamNo") orderBy.items = undefined; // sorted post-query
    else orderBy.challanDate = "asc";

    const records = await prisma.beamSendJobwork.findMany({
      where,
      orderBy: groupBy === "jobworker" ? { party: { name: "asc" } } : { challanDate: "asc" },
      include: {
        party: { select: { name: true } },
        items: true,
      },
    });

    const rows: BeamCardReportRow[] = [];

    for (const record of records) {
      for (const item of record.items) {
        let groupKey = "";
        if (groupBy === "jobworker") groupKey = record.party?.name ?? "Unknown";
        else if (groupBy === "beamNo") groupKey = item.beamNo;
        else if (groupBy === "loomNo") groupKey = item.lotNo ?? "Unknown";
        else if (groupBy === "greyName") groupKey = item.yarnName ?? "Unknown";
        else groupKey = record.party?.name ?? "Unknown";

        rows.push({
          groupKey,
          beamNo: item.beamNo,
          yarnName: item.yarnName,
          lotNo: item.lotNo,
          ends: item.ends,
          takas: formatDecimalValue(item.takas),
          meters: formatDecimalValue(item.meters),
          grossWt: formatDecimalValue(item.grossWt),
          tareWt: formatDecimalValue(item.tareWt),
          netWt: formatDecimalValue(item.netWt),
          partyName: record.party?.name ?? null,
          challanDate: record.challanDate.toISOString(),
          challanNo: record.challanNo,
        });
      }
    }

    if (groupBy === "beamNo") {
      rows.sort((a, b) => a.beamNo.localeCompare(b.beamNo));
    }

    return rows;
  }

  // ─── 2. Beam Issue Report ────────────────────────────────────────────

  async getBeamIssueReport(
    tenantId: string,
    query: BeamIssueReportQuery,
  ): Promise<BeamIssueReportRow[]> {
    const { fromDate, toDate, particular, particularType, sortOn } = query;

    const where: any = {
      tenantId,
      deletedAt: null,
      challanDate: parseDateRange(fromDate, toDate),
    };

    if (particular && particularType) {
      switch (particularType) {
        case "challanNo":
          where.challanNo = containsFilter(particular);
          break;
        case "party":
          where.party = { name: containsFilter(particular) };
          break;
        case "beamNo":
          where.items = { some: { beamNo: containsFilter(particular) } };
          break;
        case "item":
          where.items = { some: { yarnName: containsFilter(particular) } };
          break;
      }
    }

    let orderBy: any = { challanDate: "asc" };
    if (sortOn === "partyWise") orderBy = { party: { name: "asc" } };
    else if (sortOn === "challanDateWise") orderBy = { challanDate: "asc" };

    const records = await prisma.beamSendJobwork.findMany({
      where,
      orderBy,
      include: {
        party: { select: { name: true } },
        firm: { select: { name: true } },
        items: { orderBy: { sortOrder: "asc" } },
      },
    });

    const rows: BeamIssueReportRow[] = [];

    for (const record of records) {
      for (const item of record.items) {
        rows.push({
          serialNumber: record.serialNumber,
          challanDate: record.challanDate.toISOString(),
          challanNo: record.challanNo,
          partyName: record.party?.name ?? null,
          firmName: record.firm?.name ?? null,
          beamNo: item.beamNo,
          yarnName: item.yarnName,
          lotNo: item.lotNo,
          ends: item.ends,
          takas: formatDecimalValue(item.takas),
          meters: formatDecimalValue(item.meters),
          grossWt: formatDecimalValue(item.grossWt),
          netWt: formatDecimalValue(item.netWt),
        });
      }
    }

    if (sortOn === "beamNoWise") {
      rows.sort((a, b) => a.beamNo.localeCompare(b.beamNo));
    } else if (sortOn === "itemWise") {
      rows.sort((a, b) => (a.yarnName ?? "").localeCompare(b.yarnName ?? ""));
    }

    return rows;
  }

  // ─── 3. Beam Register Report ─────────────────────────────────────────

  async getBeamRegisterReport(
    tenantId: string,
    query: BeamRegisterReportQuery,
  ): Promise<BeamRegisterReportRow[]> {
    const { fromDate, toDate, particular, sortOn, groupBy } = query;

    const where: any = {
      tenantId,
      deletedAt: null,
      challanDate: parseDateRange(fromDate, toDate),
    };

    if (particular) {
      if (groupBy === "jobworker" || sortOn === "jobworker") {
        where.party = { name: containsFilter(particular) };
      } else if (groupBy === "beamNo" || sortOn === "beamNo") {
        where.items = { some: { beamNo: containsFilter(particular) } };
      } else if (groupBy === "itemName" || sortOn === "itemName") {
        where.items = { some: { yarnName: containsFilter(particular) } };
      } else {
        where.OR = [
          { party: { name: containsFilter(particular) } },
          { challanNo: containsFilter(particular) },
          { items: { some: { beamNo: containsFilter(particular) } } },
        ];
      }
    }

    let orderBy: any = { challanDate: "asc" };
    if (sortOn === "jobworker") orderBy = { party: { name: "asc" } };
    else if (sortOn === "beamDate") orderBy = { challanDate: "asc" };

    const records = await prisma.beamSendJobwork.findMany({
      where,
      orderBy,
      include: {
        party: { select: { name: true } },
        items: { orderBy: { sortOrder: "asc" } },
      },
    });

    const rows: BeamRegisterReportRow[] = [];

    for (const record of records) {
      for (const item of record.items) {
        rows.push({
          beamNo: item.beamNo,
          yarnName: item.yarnName,
          lotNo: item.lotNo,
          ends: item.ends,
          takas: formatDecimalValue(item.takas),
          meters: formatDecimalValue(item.meters),
          grossWt: formatDecimalValue(item.grossWt),
          netWt: formatDecimalValue(item.netWt),
          partyName: record.party?.name ?? null,
          challanNo: record.challanNo,
          challanDate: record.challanDate.toISOString(),
          serialNumber: record.serialNumber,
        });
      }
    }

    if (sortOn === "beamNo") {
      rows.sort((a, b) => a.beamNo.localeCompare(b.beamNo));
    } else if (sortOn === "itemName") {
      rows.sort((a, b) => (a.yarnName ?? "").localeCompare(b.yarnName ?? ""));
    }

    return rows;
  }

  // ─── 4. Yarn Issue Report ────────────────────────────────────────────

  async getYarnIssueReport(
    tenantId: string,
    query: YarnIssueReportQuery,
  ): Promise<YarnIssueReportRow[]> {
    const { fromDate, toDate, particular, particularType, sortOn } = query;

    const where: any = {
      tenantId,
      deletedAt: null,
      challanDate: parseDateRange(fromDate, toDate),
    };

    if (particular && particularType) {
      switch (particularType) {
        case "challanNo":
          where.challanNo = containsFilter(particular);
          break;
        case "party":
          where.party = { name: containsFilter(particular) };
          break;
        case "cartonNo":
          where.items = { some: { cartonNo: containsFilter(particular) } };
          break;
        case "yarn":
          where.items = { some: { itemName: containsFilter(particular) } };
          break;
      }
    }

    let orderBy: any = { challanDate: "asc" };
    if (sortOn === "partyWise") orderBy = { party: { name: "asc" } };
    else if (sortOn === "challanWise") orderBy = { challanDate: "asc" };

    const records = await prisma.yarnSendJobwork.findMany({
      where,
      orderBy,
      include: {
        party: { select: { name: true } },
        items: { orderBy: { sortOrder: "asc" } },
      },
    });

    const rows: YarnIssueReportRow[] = [];

    for (const record of records) {
      for (const item of record.items) {
        rows.push({
          serialNumber: record.serialNumber,
          challanDate: record.challanDate.toISOString(),
          challanNo: record.challanNo,
          partyName: record.party?.name ?? null,
          cartonNo: item.cartonNo,
          itemName: item.itemName,
          shadeName: item.shadeName,
          lotNo: item.lotNo,
          cheese: formatDecimalValue(item.cheese),
          grossWt: formatDecimalValue(item.grossWt),
          tareWt: formatDecimalValue(item.tareWt),
          netWt: formatDecimalValue(item.netWt),
        });
      }
    }

    if (sortOn === "yarnWise") {
      rows.sort((a, b) => (a.itemName ?? "").localeCompare(b.itemName ?? ""));
    } else if (sortOn === "cartonNoWise") {
      rows.sort((a, b) => a.cartonNo.localeCompare(b.cartonNo));
    } else if (sortOn === "yarnShadeWise") {
      rows.sort((a, b) => (a.shadeName ?? "").localeCompare(b.shadeName ?? ""));
    }

    return rows;
  }

  // ─── 5. Yarn Receive Report ──────────────────────────────────────────

  async getYarnReceiveReport(
    tenantId: string,
    query: YarnReceiveReportQuery,
  ): Promise<YarnReceiveReportRow[]> {
    const { fromDate, toDate, particular, particularType, sortOn } = query;

    const where: any = {
      tenantId,
      deletedAt: null,
      challanDate: parseDateRange(fromDate, toDate),
    };

    if (particular && particularType) {
      switch (particularType) {
        case "yarn":
          where.yarnName = containsFilter(particular);
          break;
        case "party":
          where.party = { name: containsFilter(particular) };
          break;
        case "shadeName":
          where.shadeName = containsFilter(particular);
          break;
      }
    }

    let orderBy: any = { challanDate: "asc" };
    if (sortOn === "yarnWise") orderBy = { yarnName: "asc" };
    else if (sortOn === "partyWise") orderBy = { party: { name: "asc" } };
    else if (sortOn === "challanDateWise") orderBy = { challanDate: "asc" };

    const records = await prisma.yarnReceiveJobwork.findMany({
      where,
      orderBy,
      include: {
        party: { select: { name: true } },
      },
    });

    return records.map((record: typeof records[number]) => ({
      serialNumber: record.serialNumber,
      challanDate: record.challanDate.toISOString(),
      challanNo: record.challanNo,
      partyName: record.party?.name ?? null,
      yarnName: record.yarnName,
      shadeName: record.shadeName,
      lotNo: record.lotNo,
      rolls: record.rolls,
      grossWt: formatDecimalValue(record.grossWt),
      tareWt: formatDecimalValue(record.tareWt),
      netWt: formatDecimalValue(record.netWt),
    }));
  }

  // ─── 6. Rolls Issue Report ───────────────────────────────────────────

  async getRollsIssueReport(
    tenantId: string,
    query: RollsIssueReportQuery,
  ): Promise<RollsIssueReportRow[]> {
    const { fromDate, toDate, particular, particularType, sortOn } = query;

    const where: any = {
      tenantId,
      deletedAt: null,
      challanDate: parseDateRange(fromDate, toDate),
    };

    if (particular && particularType) {
      switch (particularType) {
        case "party":
          where.party = { name: containsFilter(particular) };
          break;
        case "challanNo":
          where.challanNo = containsFilter(particular);
          break;
        case "yarn":
          where.yarnName = containsFilter(particular);
          break;
      }
    }

    let orderBy: any = { challanDate: "asc" };
    if (sortOn === "yarnWise") orderBy = { yarnName: "asc" };
    else if (sortOn === "partyWise") orderBy = { party: { name: "asc" } };
    else if (sortOn === "challanDateWise") orderBy = { challanDate: "asc" };

    const records = await prisma.rollsSendJobwork.findMany({
      where,
      orderBy,
      include: {
        party: { select: { name: true } },
      },
    });

    return records.map((record: typeof records[number]) => ({
      serialNumber: record.serialNumber,
      challanDate: record.challanDate.toISOString(),
      challanNo: record.challanNo,
      partyName: record.party?.name ?? null,
      yarnName: record.yarnName,
      lotNo: record.lotNo,
      cages: record.cages,
      rolls: record.rolls,
      grossWt: formatDecimalValue(record.grossWt),
      tareWt: formatDecimalValue(record.tareWt),
      netWt: formatDecimalValue(record.netWt),
    }));
  }

  // ─── 7. Taka Received Report ─────────────────────────────────────────

  async getTakaReceivedReport(
    tenantId: string,
    query: TakaReceivedReportQuery,
  ): Promise<TakaReceivedReportRow[]> {
    const { fromDate, toDate, particular, particularType, sortOn } = query;

    const where: any = {
      tenantId,
      deletedAt: null,
      challanDate: parseDateRange(fromDate, toDate),
    };

    if (particular && particularType) {
      switch (particularType) {
        case "item":
          where.items = { some: { itemName: containsFilter(particular) } };
          break;
        case "party":
          where.party = { name: containsFilter(particular) };
          break;
        case "takaNo":
          where.items = { some: { takaNo: containsFilter(particular) } };
          break;
        case "lotNo":
          where.lotNo = containsFilter(particular);
          break;
        case "firm":
          where.firm = { name: containsFilter(particular) };
          break;
      }
    }

    let orderBy: any = { challanDate: "asc" };
    if (sortOn === "partyWise") orderBy = { party: { name: "asc" } };
    else if (sortOn === "firmWise") orderBy = { firm: { name: "asc" } };
    else if (sortOn === "challanDateWise") orderBy = { challanDate: "asc" };

    const records = await prisma.takaReceiveJobwork.findMany({
      where,
      orderBy,
      include: {
        party: { select: { name: true } },
        firm: { select: { name: true } },
        items: { orderBy: { sortOrder: "asc" } },
      },
    });

    const rows: TakaReceivedReportRow[] = [];

    for (const record of records) {
      for (const item of record.items) {
        rows.push({
          serialNumber: record.serialNumber,
          challanDate: record.challanDate.toISOString(),
          challanNo: record.challanNo,
          partyName: record.party?.name ?? null,
          firmName: record.firm?.name ?? null,
          qualityName: record.qualityName,
          takaNo: item.takaNo,
          loomNo: item.loomNo,
          meters: formatDecimalValue(item.meters),
          weight: formatDecimalValue(item.weight),
          itemName: item.itemName,
          sarees: item.sarees,
        });
      }
    }

    if (sortOn === "itemWise") {
      rows.sort((a, b) => (a.itemName ?? "").localeCompare(b.itemName ?? ""));
    } else if (sortOn === "takaNoWise") {
      rows.sort((a, b) => a.takaNo.localeCompare(b.takaNo));
    } else if (sortOn === "lotNoWise") {
      rows.sort((a, b) =>
        (a.qualityName ?? "").localeCompare(b.qualityName ?? ""),
      );
    } else if (sortOn === "loomWise") {
      rows.sort((a, b) => (a.loomNo ?? "").localeCompare(b.loomNo ?? ""));
    }

    return rows;
  }

  // ─── 8. Yarn Sale Challan Report ─────────────────────────────────────

  async getYarnSaleChallanReport(
    tenantId: string,
    query: YarnSaleChallanReportQuery,
  ): Promise<YarnSaleChallanReportRow[]> {
    const { fromDate, toDate, particular, particularType, sortOn } = query;

    const where: any = {
      tenantId,
      deletedAt: null,
      challanType: "YARN_SALE",
      issueDate: parseDateRange(fromDate, toDate),
    };

    if (particular && particularType) {
      switch (particularType) {
        case "item":
          where.yarnEntries = {
            some: { itemName: containsFilter(particular) },
          };
          break;
        case "challanNo":
          where.challanNumber = containsFilter(particular);
          break;
        case "party":
          where.party = { name: containsFilter(particular) };
          break;
        case "cartonNo":
          where.yarnEntries = {
            some: { cartonNo: containsFilter(particular) },
          };
          break;
      }
    }

    let orderBy: any = { issueDate: "asc" };
    if (sortOn === "partyWise") orderBy = { party: { name: "asc" } };
    else if (sortOn === "dateWise") orderBy = { issueDate: "asc" };

    const records = await prisma.challan.findMany({
      where,
      orderBy,
      include: {
        party: { select: { name: true } },
        yarnEntries: { orderBy: { sortOrder: "asc" } },
      },
    });

    const rows: YarnSaleChallanReportRow[] = [];

    for (const record of records) {
      for (const entry of record.yarnEntries) {
        const netWt = formatDecimalValue(entry.netWt);
        const goodsRate = formatDecimalValue(record.goodsRate);

        rows.push({
          serialNumber: record.challanNumber,
          challanDate: record.issueDate.toISOString(),
          challanNo: record.challanNumber,
          partyName: record.party?.name ?? null,
          itemName: entry.itemName,
          quantity: formatDecimalValue(entry.cheese),
          rate: goodsRate,
          amount: formatDecimalValue(record.goodsAmount),
        });
      }
    }

    if (sortOn === "itemWise") {
      rows.sort((a, b) => (a.itemName ?? "").localeCompare(b.itemName ?? ""));
    }

    return rows;
  }

  // ─── 9. Sale Outstanding Report ─────────────────────────────────────

  async getSaleOutstandingReport(
    tenantId: string,
    query: SaleOutstandingReportQuery,
  ): Promise<SaleOutstandingReportRow[]> {
    const {
      fromDate,
      toDate,
      paidAsOn,
      criteria = "outstanding",
      dueAsOn,
      reportFormat = "partyWise",
      partyIds,
      agentName,
      billDaysFrom,
      billDaysTo,
      interestRate,
      interestBasis = "365day",
      dueDaysCountFrom = "billWise",
      dueDays,
      dueCountDate,
    } = query;

    const where: any = {
      tenantId,
      deletedAt: null,
      status: { notIn: ["CANCELLED", "DRAFT"] },
      issueDate: parseDateRange(fromDate, toDate),
    };

    if (criteria === "outstanding") {
      where.paymentStatus = { in: ["UNPAID", "PARTIAL"] };
    } else if (criteria === "due") {
      where.paymentStatus = { in: ["UNPAID", "PARTIAL"] };
      if (dueAsOn) {
        where.dueDate = { lte: new Date(`${dueAsOn}T23:59:59.999Z`) };
      }
    }

    if (partyIds) {
      const ids = partyIds.split(",").filter(Boolean);
      if (ids.length > 0) where.partyId = { in: ids };
    }

    if (agentName) {
      where.agentName = containsFilter(agentName);
    }

    const invoices = await prisma.invoice.findMany({
      where,
      orderBy:
        reportFormat === "dateWise"
          ? { issueDate: "asc" }
          : { party: { name: "asc" } },
      include: {
        party: { select: { id: true, name: true, dueDays: true } },
        payments: {
          where: {
            deletedAt: null,
            ...(paidAsOn
              ? { paymentDate: { lte: new Date(`${paidAsOn}T23:59:59.999Z`) } }
              : {}),
          },
          select: { amount: true },
        },
        bankEntryAdjustments: {
          include: {
            bankEntry: { select: { entryDate: true, deletedAt: true } },
          },
        },
      },
    });

    const refDate = paidAsOn ? new Date(paidAsOn) : new Date();
    const rate = interestRate ? parseFloat(interestRate) : 0;
    const divisor = interestBasis === "30day" ? 30 : 365;

    const rows: SaleOutstandingReportRow[] = [];

    for (const inv of invoices) {
      const paidViaPayments = inv.payments.reduce(
        (sum: number, p: { amount: any }) => sum + formatDecimalValue(p.amount),
        0,
      );
      const paidViaAdj = inv.bankEntryAdjustments
        .filter((a: { bankEntry: { deletedAt: any } }) => !a.bankEntry.deletedAt)
        .filter((a: { bankEntry: { entryDate: Date } }) =>
          paidAsOn
            ? a.bankEntry.entryDate <= new Date(`${paidAsOn}T23:59:59.999Z`)
            : true,
        )
        .reduce(
          (sum: number, a: { amount: any }) => sum + formatDecimalValue(a.amount),
          0,
        );

      const totalPaid = paidViaPayments + paidViaAdj;
      const grand = formatDecimalValue(inv.grandTotal);
      const balance = Math.max(0, grand - totalPaid);

      if (criteria !== "all" && balance <= 0) continue;

      let dueDate: Date | null = inv.dueDate;
      if (!dueDate && dueDaysCountFrom === "partyWise" && inv.party.dueDays) {
        dueDate = new Date(inv.issueDate);
        dueDate.setDate(dueDate.getDate() + inv.party.dueDays);
      } else if (!dueDate && dueDaysCountFrom === "billWise" && dueDays) {
        dueDate = new Date(inv.issueDate);
        dueDate.setDate(dueDate.getDate() + parseInt(dueDays));
      } else if (
        !dueDate &&
        dueDaysCountFrom === "billWise" &&
        dueCountDate
      ) {
        dueDate = new Date(dueCountDate);
      }

      const daysPastDue =
        dueDate && refDate > dueDate
          ? Math.floor(
              (refDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24),
            )
          : 0;

      if (billDaysFrom || billDaysTo) {
        const issueDay = Math.floor(
          (refDate.getTime() - inv.issueDate.getTime()) / (1000 * 60 * 60 * 24),
        );
        if (billDaysFrom && issueDay < parseInt(billDaysFrom)) continue;
        if (billDaysTo && issueDay > parseInt(billDaysTo)) continue;
      }

      const interestAmount =
        rate > 0 && daysPastDue > 0
          ? (balance * rate * daysPastDue) / (divisor * 100)
          : 0;

      rows.push({
        invoiceId: inv.id,
        invoiceNumber: inv.invoiceNumber,
        issueDate: inv.issueDate.toISOString(),
        dueDate: dueDate?.toISOString() ?? null,
        partyId: inv.party.id,
        partyName: inv.party.name,
        agentName: inv.agentName,
        grandTotal: grand,
        paidAmount: totalPaid,
        balanceAmount: Math.round(balance * 100) / 100,
        daysPastDue,
        interestAmount: Math.round(interestAmount * 100) / 100,
        totalWithInterest:
          Math.round((balance + interestAmount) * 100) / 100,
      });
    }

    if (reportFormat === "agentPartyWise") {
      rows.sort((a, b) => {
        const agentCmp = (a.agentName ?? "").localeCompare(
          b.agentName ?? "",
        );
        return agentCmp !== 0
          ? agentCmp
          : a.partyName.localeCompare(b.partyName);
      });
    }

    return rows;
  }

  // ─── 10. Purchase Outstanding Report ────────────────────────────────

  async getPurchaseOutstandingReport(
    tenantId: string,
    query: PurchaseOutstandingReportQuery,
  ): Promise<PurchaseOutstandingReportRow[]> {
    const {
      fromDate,
      toDate,
      paidAsOn,
      criteria = "outstanding",
      dueAsOn,
      reportFormat = "partyWise",
      partyIds,
      billDaysFrom,
      billDaysTo,
      interestRate,
      interestBasis = "365day",
    } = query;

    const where: any = {
      tenantId,
      deletedAt: null,
      purchaseDate: parseDateRange(fromDate, toDate),
    };

    if (partyIds) {
      const ids = partyIds.split(",").filter(Boolean);
      if (ids.length > 0) where.partyId = { in: ids };
    }

    const purchases = await prisma.yarnPurchase.findMany({
      where,
      orderBy:
        reportFormat === "dateWise"
          ? { purchaseDate: "asc" }
          : { party: { name: "asc" } },
      include: {
        party: { select: { id: true, name: true, dueDays: true } },
      },
    });

    const refDate = paidAsOn ? new Date(paidAsOn) : new Date();
    const rate = interestRate ? parseFloat(interestRate) : 0;
    const divisor = interestBasis === "30day" ? 30 : 365;

    const rows: PurchaseOutstandingReportRow[] = [];

    for (const p of purchases) {
      const billAmt = formatDecimalValue(p.billAmount);
      const adjAmt = formatDecimalValue(p.adjustedAmount);
      const balance = Math.max(0, billAmt - adjAmt);

      if (criteria === "outstanding" && balance <= 0) continue;
      if (criteria === "due") {
        if (balance <= 0) continue;
        const dueDays = p.party.dueDays ?? 0;
        const dueDate = new Date(p.billDate ?? p.purchaseDate);
        dueDate.setDate(dueDate.getDate() + dueDays);
        if (dueAsOn && dueDate > new Date(`${dueAsOn}T23:59:59.999Z`))
          continue;
      }

      const billDate = p.billDate ?? p.purchaseDate;
      const daysSinceBill = Math.floor(
        (refDate.getTime() - billDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (billDaysFrom && daysSinceBill < parseInt(billDaysFrom)) continue;
      if (billDaysTo && daysSinceBill > parseInt(billDaysTo)) continue;

      const dueDays = p.party.dueDays ?? 0;
      const dueDate = new Date(billDate);
      dueDate.setDate(dueDate.getDate() + dueDays);
      const daysPastDue =
        refDate > dueDate
          ? Math.floor(
              (refDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24),
            )
          : 0;

      const interestAmount =
        rate > 0 && daysPastDue > 0
          ? (balance * rate * daysPastDue) / (divisor * 100)
          : 0;

      rows.push({
        purchaseId: p.id,
        serialNumber: p.serialNumber,
        billNo: p.billNo,
        billDate: (p.billDate ?? p.purchaseDate).toISOString(),
        purchaseDate: p.purchaseDate.toISOString(),
        partyId: p.party.id,
        partyName: p.party.name,
        billAmount: billAmt,
        adjustedAmount: adjAmt,
        balanceAmount: Math.round(balance * 100) / 100,
        daysPastDue,
        interestAmount: Math.round(interestAmount * 100) / 100,
        totalWithInterest:
          Math.round((balance + interestAmount) * 100) / 100,
      });
    }

    return rows;
  }
}
