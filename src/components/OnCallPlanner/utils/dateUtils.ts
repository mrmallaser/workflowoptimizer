export function formatDate(date: Date): string {
  return date.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

export function getMonthName(date: Date): string {
  return date.toLocaleDateString('de-DE', { month: 'long' });
}

export function parseDate(dateString: string): Date {
  const [day, month, year] = dateString.split('.');
  return new Date(Number(year), Number(month) - 1, Number(day));
}