import { parseBirthDate } from '../domain/numerology';

const DIGITS_ONLY = /\D/g;

export function maskBrazilianDate(raw: string): string {
  const digits = raw.replace(DIGITS_ONLY, '').slice(0, 8);
  if (digits.length <= 2) {
    return digits;
  }
  if (digits.length <= 4) {
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

export function brazilianDateToIso(value: string): string | null {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value.trim());
  if (!match || match[1] === undefined || match[2] === undefined || match[3] === undefined) {
    return null;
  }
  const iso = `${match[3]}-${match[2]}-${match[1]}`;
  try {
    return parseBirthDate(iso).iso;
  } catch {
    return null;
  }
}

export function isoToBrazilianDate(iso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match || match[1] === undefined || match[2] === undefined || match[3] === undefined) {
    return iso;
  }
  return `${match[3]}/${match[2]}/${match[1]}`;
}

export function formatDisplayDate(iso: string): string {
  return isoToBrazilianDate(iso);
}

const MONTHS_PT = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
] as const;

export function formatLongBrazilianDate(iso: string): string {
  const parsed = parseBirthDate(iso);
  const monthName = MONTHS_PT[parsed.month - 1];
  if (monthName === undefined) {
    return isoToBrazilianDate(iso);
  }
  return `${parsed.day} de ${monthName} de ${parsed.year}`;
}
