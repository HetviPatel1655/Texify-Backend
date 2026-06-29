// ─── Common ────────────────────────────────────────────────────────────────────

export interface ReportDateRangeQuery {
  fromDate: string;
  toDate: string;
}

// ─── 1. Beam Card Report ───────────────────────────────────────────────────────

export interface BeamCardReportQuery extends ReportDateRangeQuery {
  particular?: string;
  groupBy?: "jobworker" | "beamNo" | "loomNo" | "greyName";
}

export interface BeamCardReportRow {
  groupKey: string;
  beamNo: string;
  yarnName: string | null;
  lotNo: string | null;
  ends: number;
  takas: number;
  meters: number;
  grossWt: number;
  tareWt: number;
  netWt: number;
  partyName: string | null;
  challanDate: string;
  challanNo: string | null;
}

// ─── 2. Beam Issue Report ──────────────────────────────────────────────────────

export interface BeamIssueReportQuery extends ReportDateRangeQuery {
  sortOn?: "partyWise" | "beamNoWise" | "challanDateWise" | "itemWise";
  particular?: string;
  particularType?: "challanNo" | "party" | "beamNo" | "item";
}

export interface BeamIssueReportRow {
  serialNumber: string;
  challanDate: string;
  challanNo: string | null;
  partyName: string | null;
  firmName: string | null;
  beamNo: string;
  yarnName: string | null;
  lotNo: string | null;
  ends: number;
  takas: number;
  meters: number;
  grossWt: number;
  netWt: number;
}

// ─── 3. Beam Register Report ──────────────────────────────────────────────────

export interface BeamRegisterReportQuery extends ReportDateRangeQuery {
  sortOn?: "beamNo" | "itemName" | "jobworker" | "loomNo" | "beamDate";
  particular?: string;
  groupBy?: "challanNo" | "loomNo" | "beamNo" | "itemName" | "jobworker";
}

export interface BeamRegisterReportRow {
  beamNo: string;
  yarnName: string | null;
  lotNo: string | null;
  ends: number;
  takas: number;
  meters: number;
  grossWt: number;
  netWt: number;
  partyName: string | null;
  challanNo: string | null;
  challanDate: string;
  serialNumber: string;
}

// ─── 4. Yarn Issue Report ──────────────────────────────────────────────────────

export interface YarnIssueReportQuery extends ReportDateRangeQuery {
  particular?: string;
  particularType?: "challanNo" | "party" | "cartonNo" | "yarn";
  sortOn?: "partyWise" | "yarnWise" | "cartonNoWise" | "challanWise" | "yarnShadeWise";
  reportType?: "detailed" | "summary";
}

export interface YarnIssueReportRow {
  serialNumber: string;
  challanDate: string;
  challanNo: string | null;
  partyName: string | null;
  cartonNo: string;
  itemName: string | null;
  shadeName: string | null;
  lotNo: string | null;
  cheese: number;
  grossWt: number;
  tareWt: number;
  netWt: number;
}

// ─── 5. Yarn Receive Report ───────────────────────────────────────────────────

export interface YarnReceiveReportQuery extends ReportDateRangeQuery {
  particular?: string;
  particularType?: "yarn" | "party" | "shadeName";
  sortOn?: "yarnWise" | "partyWise" | "challanDateWise";
  reportType?: "detailed" | "summary";
}

export interface YarnReceiveReportRow {
  serialNumber: string;
  challanDate: string;
  challanNo: string | null;
  partyName: string | null;
  yarnName: string | null;
  shadeName: string | null;
  lotNo: string | null;
  rolls: number;
  grossWt: number;
  tareWt: number;
  netWt: number;
}

// ─── 6. Rolls Issue Report ────────────────────────────────────────────────────

export interface RollsIssueReportQuery extends ReportDateRangeQuery {
  particular?: string;
  particularType?: "party" | "challanNo" | "yarn";
  sortOn?: "yarnWise" | "partyWise" | "challanDateWise";
}

export interface RollsIssueReportRow {
  serialNumber: string;
  challanDate: string;
  challanNo: string | null;
  partyName: string | null;
  yarnName: string | null;
  lotNo: string | null;
  cages: number;
  rolls: number;
  grossWt: number;
  tareWt: number;
  netWt: number;
}

// ─── 7. Taka Received Report ──────────────────────────────────────────────────

export interface TakaReceivedReportQuery extends ReportDateRangeQuery {
  particular?: string;
  particularType?: "item" | "party" | "takaNo" | "lotNo" | "firm";
  sortOn?:
    | "challanDateWise"
    | "itemWise"
    | "takaNoWise"
    | "partyWise"
    | "lotNoWise"
    | "loomWise"
    | "firmWise";
  reportType?: "detailed" | "challanSummary" | "itemSummary";
}

export interface TakaReceivedReportRow {
  serialNumber: string;
  challanDate: string;
  challanNo: string | null;
  partyName: string | null;
  firmName: string | null;
  qualityName: string | null;
  takaNo: string;
  loomNo: string | null;
  meters: number;
  weight: number;
  itemName: string | null;
  sarees: number;
}

// ─── 8. Yarn Sale Challan Report ──────────────────────────────────────────────

export interface YarnSaleChallanReportQuery extends ReportDateRangeQuery {
  particular?: string;
  particularType?: "item" | "challanNo" | "party" | "cartonNo";
  sortOn?: "itemWise" | "partyWise" | "dateWise";
  reportType?: "detailed" | "summary";
}

export interface YarnSaleChallanReportRow {
  serialNumber: string;
  challanDate: string;
  challanNo: string | null;
  partyName: string | null;
  itemName: string | null;
  quantity: number;
  rate: number;
  amount: number;
}
