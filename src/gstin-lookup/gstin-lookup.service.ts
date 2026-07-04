import { AppError } from "../common/errors/appError";
import { getValidApiKey, incrementCallCount, forceRenewKey } from "./gstin-key-manager";
import { FeatureGateService } from "../feature-gate/feature-gate.service";
import type { GstinLookupResult } from "./gstin-lookup.types";

class CreditExpiredError extends Error {
  constructor() { super("Credit expired"); }
}

const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z0-9]{1}Z[A-Z0-9]{1}$/;

const STATE_MAP: Record<string, string> = {
  "01": "Jammu & Kashmir", "02": "Himachal Pradesh", "03": "Punjab",
  "04": "Chandigarh", "05": "Uttarakhand", "06": "Haryana",
  "07": "Delhi", "08": "Rajasthan", "09": "Uttar Pradesh",
  "10": "Bihar", "11": "Sikkim", "12": "Arunachal Pradesh",
  "13": "Nagaland", "14": "Manipur", "15": "Mizoram",
  "16": "Tripura", "17": "Meghalaya", "18": "Assam",
  "19": "West Bengal", "20": "Jharkhand", "21": "Odisha",
  "22": "Chhattisgarh", "23": "Madhya Pradesh", "24": "Gujarat",
  "25": "Daman & Diu", "26": "Dadra & Nagar Haveli", "27": "Maharashtra",
  "28": "Andhra Pradesh", "29": "Karnataka", "30": "Goa",
  "31": "Lakshadweep", "32": "Kerala", "33": "Tamil Nadu",
  "34": "Puducherry", "35": "Andaman & Nicobar Islands",
  "36": "Telangana", "37": "Andhra Pradesh (New)", "38": "Ladakh",
};

function extractPan(gstin: string): string {
  return gstin.substring(2, 12);
}

function resolveState(code: string): string {
  return STATE_MAP[code] ?? "";
}

function localExtract(gstin: string): GstinLookupResult {
  const stateCode = gstin.substring(0, 2);
  return {
    gstin,
    legalName: "",
    tradeName: "",
    pan: extractPan(gstin),
    stateCode,
    status: "local_only",
    taxpayerType: "",
    businessType: "",
    dateOfRegistration: "",
    address: "",
    centerJurisdiction: "",
    stateJurisdiction: "",
    einvoiceStatus: false,
    aadhaarValidation: "",
    natureOfBusiness: [],
  };
}

// ── gstincheck.co.in — Licensed GSP, official GSTN data ────────────────
// Signup: https://gstincheck.co.in (email only, no KYC, instant API key)
// Dashboard: https://sheet.gstincheck.co.in/user-dashboard
// URL format: GET https://sheet.gstincheck.co.in/check/{API_KEY}/{GSTIN}

interface GstinCheckResponse {
  flag: boolean;
  message?: string;
  data?: {
    gstin?: string;
    lgnm?: string;
    tradeNam?: string;
    sts?: string;
    ctb?: string;
    dty?: string;
    rgdt?: string;
    lstupdt?: string;
    nba?: string[];
    pradr?: {
      adr?: string;
      ntr?: string;
      addr?: {
        bnm?: string;
        bno?: string;
        flno?: string;
        st?: string;
        loc?: string;
        dst?: string;
        city?: string;
        stcd?: string;
        pncd?: string;
      };
    };
    stj?: string;
    ctj?: string;
    einvoiceStatus?: boolean;
    adhrVFlag?: string;
  };
}

async function fetchFromGstinCheck(gstin: string, apiKey: string): Promise<GstinLookupResult> {
  const url = `https://sheet.gstincheck.co.in/check/${encodeURIComponent(apiKey)}/${encodeURIComponent(gstin)}`;

  let json: GstinCheckResponse;
  try {
    const res = await fetch(url, {
      headers: { "Accept": "application/json" },
      signal: AbortSignal.timeout(15_000),
    });
    json = (await res.json()) as GstinCheckResponse;
  } catch {
    throw new AppError("Unable to reach GSTIN verification service. Try again later.", 502);
  }

  if (!json.flag || !json.data) {
    const msg = json.message ?? "";
    if (msg.toLowerCase().includes("credit expire") || msg.toLowerCase().includes("credit limit")) {
      throw new CreditExpiredError();
    }
    throw new AppError(
      msg || "GSTIN not found or invalid. Please verify the number.",
      404,
    );
  }

  const d = json.data;
  const addr = d.pradr?.addr ?? {};
  const stateCode = gstin.substring(0, 2);

  const addrParts = [addr.bno, addr.bnm, addr.flno].filter(Boolean);
  const streetParts = [addr.st, addr.loc].filter(Boolean);
  const fullAddress = d.pradr?.adr
    ?? [...addrParts, ...streetParts, addr.dst, resolveState(addr.stcd ?? stateCode), addr.pncd].filter(Boolean).join(", ");

  return {
    gstin,
    legalName: d.lgnm ?? "",
    tradeName: d.tradeNam ?? "",
    pan: extractPan(gstin),
    stateCode,
    status: d.sts ?? "",
    taxpayerType: d.dty ?? "",
    businessType: d.ctb ?? "",
    dateOfRegistration: d.rgdt ?? "",
    address: fullAddress,
    centerJurisdiction: d.ctj ?? "",
    stateJurisdiction: d.stj ?? "",
    einvoiceStatus: d.einvoiceStatus ?? false,
    aadhaarValidation: d.adhrVFlag ?? "",
    natureOfBusiness: d.nba ?? [],
  };
}

// ── Main entry point ────────────────────────────────────────────────────
export async function lookupGstin(gstin: string, tenantId: string): Promise<GstinLookupResult> {
  const normalized = gstin.trim().toUpperCase();

  if (!GSTIN_REGEX.test(normalized)) {
    throw new AppError("Invalid GSTIN format. Must be 15 characters (e.g. 24AABCU9603R1ZM)", 400);
  }

  const apiKey = await getValidApiKey(tenantId);

  if (!apiKey) {
    return localExtract(normalized);
  }

  try {
    const result = await fetchFromGstinCheck(normalized, apiKey);
    await incrementCallCount(tenantId);
    await FeatureGateService.incrementGstinLookups(tenantId);
    return result;
  } catch (err) {
    if (err instanceof CreditExpiredError) {
      console.log("[gstin-lookup] Credits expired, forcing key renewal...");
      const newKey = await forceRenewKey(tenantId);
      if (!newKey) {
        return localExtract(normalized);
      }
      const result = await fetchFromGstinCheck(normalized, newKey);
      await incrementCallCount(tenantId);
      await FeatureGateService.incrementGstinLookups(tenantId);
      return result;
    }
    throw err;
  }
}
