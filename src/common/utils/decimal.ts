export function formatDecimalValue(value: { toString(): string } | number | string | null | undefined): number {
  if (value === null || value === undefined) {
    return 0;
  }

  return Number(value);
}