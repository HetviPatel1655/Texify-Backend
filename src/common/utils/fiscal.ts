/**
 * Derives the Indian fiscal year string (e.g. "2024-2025") from a given date.
 * The fiscal year starts on April 1 and ends on March 31.
 */
export function fiscalYearFromDate(date: Date): string {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1; // 1-indexed
  const startYear = month >= 4 ? year : year - 1;
  return `${startYear}-${startYear + 1}`;
}
