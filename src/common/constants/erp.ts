export const PartyTypes = ["CUSTOMER", "SUPPLIER", "BOTH", "OTHER"] as const;
export const InvoiceStatuses = ["DRAFT", "ISSUED", "PARTIALLY_PAID", "PAID", "OVERDUE", "CANCELLED"] as const;
export const ChallanStatuses = ["DRAFT", "ISSUED", "PARTIALLY_RETURNED", "CLOSED", "CANCELLED"] as const;
export const PaymentStatuses = ["UNPAID", "PARTIAL", "PAID", "REFUNDED"] as const;
export const UnitTypes = ["PIECE", "KILOGRAM", "METER", "LITER", "ROLL", "SET", "BOX", "DOZEN"] as const;
export const GSTTypes = ["TAXABLE", "EXEMPT", "NIL", "RCM"] as const;

export type PartyType = (typeof PartyTypes)[number];
export type InvoiceStatus = (typeof InvoiceStatuses)[number];
export type ChallanStatus = (typeof ChallanStatuses)[number];
export type PaymentStatus = (typeof PaymentStatuses)[number];
export type UnitType = (typeof UnitTypes)[number];
export type GSTType = (typeof GSTTypes)[number];