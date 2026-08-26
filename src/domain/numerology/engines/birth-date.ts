export interface CalendarDate {
  readonly year: number;
  readonly month: number;
  readonly day: number;
  readonly iso: string;
}

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

function pad2(value: number): string {
  return String(value).padStart(2, '0');
}

function isValidCalendarDate(year: number, month: number, day: number): boolean {
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return false;
  }
  const probe = new Date(Date.UTC(year, month - 1, day));
  return (
    probe.getUTCFullYear() === year &&
    probe.getUTCMonth() === month - 1 &&
    probe.getUTCDate() === day
  );
}

function toIso(year: number, month: number, day: number): string {
  return `${String(year).padStart(4, '0')}-${pad2(month)}-${pad2(day)}`;
}

/**
 * Interpreta data de nascimento como data civil, sem fuso horário.
 * Strings devem estar em YYYY-MM-DD.
 */
export function parseBirthDate(birthDate: string | Date): CalendarDate {
  if (birthDate instanceof Date) {
    if (Number.isNaN(birthDate.getTime())) {
      throw new Error('Invalid birth date.');
    }
    const year = birthDate.getFullYear();
    const month = birthDate.getMonth() + 1;
    const day = birthDate.getDate();
    return { year, month, day, iso: toIso(year, month, day) };
  }

  const match = ISO_DATE.exec(birthDate.trim());
  if (!match || match[1] === undefined || match[2] === undefined || match[3] === undefined) {
    throw new Error(`Birth date must be YYYY-MM-DD. Received: "${birthDate}"`);
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (!isValidCalendarDate(year, month, day)) {
    throw new Error(`Invalid calendar date: ${birthDate}`);
  }

  return { year, month, day, iso: toIso(year, month, day) };
}
