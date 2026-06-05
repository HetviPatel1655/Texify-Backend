export interface GstinLookupResult {
  gstin: string;
  legalName: string;
  tradeName: string;
  pan: string;
  stateCode: string;
  status: string;
  taxpayerType: string;
  businessType: string;
  dateOfRegistration: string;
  address: string;
  centerJurisdiction: string;
  stateJurisdiction: string;
  einvoiceStatus: boolean;
  aadhaarValidation: string;
  natureOfBusiness: string[];
}
