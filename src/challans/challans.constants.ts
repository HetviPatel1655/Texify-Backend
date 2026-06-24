export const challanEntityName = "challan" as const;

export const challanSearchableFields = ["challanNumber", "seriesCode", "fiscalYear", "notes", "terms", "transportMode", "vehicleNumber", "placeOfSupply"] as const;

export const ChallanTypes = ["SALE", "GREY", "FINISHED_TAKA", "DIRECT", "SAREES", "BEAM", "YARN_SALE"] as const;
export type ChallanType = (typeof ChallanTypes)[number];

export const CHALLAN_SERIES_CODES: Record<ChallanType, string> = {
  SALE: "CHL",
  GREY: "GCH",
  FINISHED_TAKA: "FCH",
  DIRECT: "DCH",
  SAREES: "SCH",
  BEAM: "BCH",
  YARN_SALE: "YCH",
};

export const CHALLAN_TYPE_LABELS: Record<ChallanType, string> = {
  SALE: "Sale Challan",
  GREY: "Grey Challan",
  FINISHED_TAKA: "Finished Taka Challan",
  DIRECT: "Direct Challan",
  SAREES: "Sarees Challan",
  BEAM: "Beam Challan",
  YARN_SALE: "Yarn Sale Challan",
};
