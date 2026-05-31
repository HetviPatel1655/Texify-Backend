export function formatDecimalValue(value: { toString(): string } | number | string | null | undefined): string {
  if (value === null || value === undefined) {
    return "0";
  }

  return value.toString();
}