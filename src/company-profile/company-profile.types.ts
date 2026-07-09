export interface CompanyProfileDto {
  id: string;
  companyName: string;
  tagline: string | null;
  logoUrl: string | null;
  businessType: string | null;
  address1: string;
  address2: string | null;
  city: string;
  state: string;
  stateCode: string;
  postalCode: string | null;
  country: string;
  phone: string | null;
  email: string | null;
  gstin: string | null;
  pan: string | null;
  msme: string | null;
  bankName: string | null;
  bankAccountNo: string | null;
  bankIfsc: string | null;
  bankBranch: string | null;
  defaultTerms: string | null;
  defaultNotes: string | null;
  interestRate: string;
  jurisdiction: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpsertCompanyProfileDto {
  companyName: string;
  tagline?: string | null;
  logoUrl?: string | null;
  businessType?: string | null;
  address1: string;
  address2?: string | null;
  city: string;
  state: string;
  stateCode: string;
  postalCode?: string | null;
  country?: string;
  phone?: string | null;
  email?: string | null;
  gstin: string;
  pan?: string | null;
  msme?: string | null;
  bankName?: string | null;
  bankAccountNo?: string | null;
  bankIfsc?: string | null;
  bankBranch?: string | null;
  defaultTerms?: string | null;
  defaultNotes?: string | null;
  interestRate?: number;
  jurisdiction?: string | null;
}
