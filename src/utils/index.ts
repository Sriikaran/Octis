import { format } from 'date-fns';

export function formatDate(date: Date | string | number): string {
  if (!date) return '';
  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) return String(date);
  return format(parsedDate, 'dd/MM/yyyy, hh:mm a');
}

export function formatDecimal(value: number, decimals: number = 2): string {
  if (isNaN(value)) return '0.00';
  return value.toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function calculateTotalPure(grossWeight: number, purity: number): number {
  return (grossWeight * purity) / 100;
}

export function calculateNetWeight(grossWeight: number, stoneWeight: number): number {
  return grossWeight - stoneWeight;
}
