import { format } from 'date-fns';

export function parseValidDate(dateStr: string | Date | number): Date {
  if (!dateStr) return new Date();
  let d = new Date(dateStr);
  if (isNaN(d.getTime()) && typeof dateStr === 'string' && dateStr.includes('/')) {
    const datePart = dateStr.split(',')[0].trim();
    const parts = datePart.split('/');
    if (parts.length === 3) {
      d = new Date(`${parts[2]}-${parts[1]}-${parts[0]}T00:00:00`);
    }
  }
  return d;
}

export function formatDate(date: Date | string | number): string {
  if (!date) return '';
  const parsedDate = parseValidDate(date);
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
