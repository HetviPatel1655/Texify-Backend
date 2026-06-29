import { z } from "zod";

const optionalString = z.string().trim().optional();

const dateRangeFields = {
  fromDate: z.string().trim().min(1),
  toDate: z.string().trim().min(1),
};

export const beamCardReportSchema = z.object({
  ...dateRangeFields,
  particular: optionalString,
  groupBy: z.enum(["jobworker", "beamNo", "loomNo", "greyName"]).optional(),
});

export const beamIssueReportSchema = z.object({
  ...dateRangeFields,
  sortOn: z
    .enum(["partyWise", "beamNoWise", "challanDateWise", "itemWise"])
    .optional(),
  particular: optionalString,
  particularType: z.enum(["challanNo", "party", "beamNo", "item"]).optional(),
});

export const beamRegisterReportSchema = z.object({
  ...dateRangeFields,
  sortOn: z
    .enum(["beamNo", "itemName", "jobworker", "loomNo", "beamDate"])
    .optional(),
  particular: optionalString,
  groupBy: z
    .enum(["challanNo", "loomNo", "beamNo", "itemName", "jobworker"])
    .optional(),
});

export const yarnIssueReportSchema = z.object({
  ...dateRangeFields,
  particular: optionalString,
  particularType: z
    .enum(["challanNo", "party", "cartonNo", "yarn"])
    .optional(),
  sortOn: z
    .enum([
      "partyWise",
      "yarnWise",
      "cartonNoWise",
      "challanWise",
      "yarnShadeWise",
    ])
    .optional(),
  reportType: z.enum(["detailed", "summary"]).optional(),
});

export const yarnReceiveReportSchema = z.object({
  ...dateRangeFields,
  particular: optionalString,
  particularType: z.enum(["yarn", "party", "shadeName"]).optional(),
  sortOn: z
    .enum(["yarnWise", "partyWise", "challanDateWise"])
    .optional(),
  reportType: z.enum(["detailed", "summary"]).optional(),
});

export const rollsIssueReportSchema = z.object({
  ...dateRangeFields,
  particular: optionalString,
  particularType: z.enum(["party", "challanNo", "yarn"]).optional(),
  sortOn: z
    .enum(["yarnWise", "partyWise", "challanDateWise"])
    .optional(),
});

export const takaReceivedReportSchema = z.object({
  ...dateRangeFields,
  particular: optionalString,
  particularType: z
    .enum(["item", "party", "takaNo", "lotNo", "firm"])
    .optional(),
  sortOn: z
    .enum([
      "challanDateWise",
      "itemWise",
      "takaNoWise",
      "partyWise",
      "lotNoWise",
      "loomWise",
      "firmWise",
    ])
    .optional(),
  reportType: z.enum(["detailed", "challanSummary", "itemSummary"]).optional(),
});

export const yarnSaleChallanReportSchema = z.object({
  ...dateRangeFields,
  particular: optionalString,
  particularType: z
    .enum(["item", "challanNo", "party", "cartonNo"])
    .optional(),
  sortOn: z.enum(["itemWise", "partyWise", "dateWise"]).optional(),
  reportType: z.enum(["detailed", "summary"]).optional(),
});
