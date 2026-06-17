import { Prisma } from "@prisma/client";

import { prisma } from "../lib/prisma";
import type { CompanyProfileDto, UpsertCompanyProfileDto } from "./company-profile.types";

function toDto(row: Prisma.CompanyProfileGetPayload<object>): CompanyProfileDto {
  return {
    id: row.id,
    companyName: row.companyName,
    tagline: row.tagline,
    logoUrl: row.logoUrl,
    businessType: row.businessType,
    address1: row.address1,
    address2: row.address2,
    city: row.city,
    state: row.state,
    stateCode: row.stateCode,
    postalCode: row.postalCode,
    country: row.country,
    phone: row.phone,
    email: row.email,
    gstin: row.gstin,
    pan: row.pan,
    msme: row.msme,
    bankName: row.bankName,
    bankAccountNo: row.bankAccountNo,
    bankIfsc: row.bankIfsc,
    bankBranch: row.bankBranch,
    defaultTerms: row.defaultTerms,
    defaultNotes: row.defaultNotes,
    interestRate: row.interestRate.toString(),
    jurisdiction: row.jurisdiction,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString()
  };
}

export class CompanyProfileService {
  async get(tenantId: string): Promise<CompanyProfileDto | null> {
    const row = await prisma.companyProfile.findFirst({ where: { tenantId } });
    return row ? toDto(row) : null;
  }

  async upsert(dto: UpsertCompanyProfileDto, tenantId: string): Promise<CompanyProfileDto> {
    const existing = await prisma.companyProfile.findFirst({ where: { tenantId } });

    const data: Prisma.CompanyProfileUpdateInput = {
      companyName: dto.companyName,
      tagline: dto.tagline ?? null,
      logoUrl: dto.logoUrl ?? null,
      businessType: dto.businessType ?? null,
      address1: dto.address1,
      address2: dto.address2 ?? null,
      city: dto.city,
      state: dto.state,
      stateCode: dto.stateCode,
      postalCode: dto.postalCode ?? null,
      country: dto.country ?? "India",
      phone: dto.phone ?? null,
      email: dto.email ?? null,
      gstin: dto.gstin,
      pan: dto.pan ?? null,
      msme: dto.msme ?? null,
      bankName: dto.bankName ?? null,
      bankAccountNo: dto.bankAccountNo ?? null,
      bankIfsc: dto.bankIfsc ?? null,
      bankBranch: dto.bankBranch ?? null,
      defaultTerms: dto.defaultTerms ?? null,
      defaultNotes: dto.defaultNotes ?? null,
      interestRate: new Prisma.Decimal(dto.interestRate ?? 0),
      jurisdiction: dto.jurisdiction ?? null
    };

    if (existing) {
      const row = await prisma.companyProfile.update({
        where: { id: existing.id },
        data
      });
      return toDto(row);
    }

    const row = await prisma.companyProfile.create({
      data: {
        ...data,
        tenant: { connect: { id: tenantId } }
      } as Prisma.CompanyProfileCreateInput
    });
    return toDto(row);
  }
}
