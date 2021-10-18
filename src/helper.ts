export function format(digits: number, number: number): string {
  return Intl.NumberFormat('en', {
    maximumFractionDigits: digits,
    minimumFractionDigits: 0,
  }).format(number);
}
