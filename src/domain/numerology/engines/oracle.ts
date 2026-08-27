import { reducePreservingMasters, reduceToSingleDigit } from '../reduce';
import { lookupOracleEntry, type OracleEntry } from '../tables/oracle-dictionary';
import type { ReducedNumber, SingleDigit } from '../types';
import { parseBirthDate, type CalendarDate } from './birth-date';

export type OracleToday = Date | CalendarDate;

export interface PersonalCycles {
  readonly birthDate: string;
  readonly calendarDate: CalendarDate;
  readonly personalYear: ReducedNumber;
  readonly personalMonth: ReducedNumber;
  readonly personalDay: SingleDigit;
}

export interface DailyOracle {
  readonly cycles: PersonalCycles;
  readonly entry: OracleEntry;
}

function pad2(value: number): string {
  return String(value).padStart(2, '0');
}

function toIso(year: number, month: number, day: number): string {
  return `${String(year).padStart(4, '0')}-${pad2(month)}-${pad2(day)}`;
}

/**
 * Data civil no fuso local do aparelho (getFullYear / getMonth / getDate).
 * CalendarDate entra sem conversão de fuso — ideal para testes.
 */
export function resolveLocalCalendarDate(today: OracleToday = new Date()): CalendarDate {
  if (!(today instanceof Date)) {
    return today;
  }
  if (Number.isNaN(today.getTime())) {
    throw new Error('Invalid calendar date for the oracle.');
  }
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const day = today.getDate();
  return { year, month, day, iso: toIso(year, month, day) };
}

/**
 * Ano Pessoal → Mês Pessoal → Dia Pessoal (1–9).
 * O Dia do Oráculo reduz a um dígito: mestres no ano/mês não abrem
 * entradas 11/22/33 no dicionário.
 */
export function calculatePersonalCycles(
  birthDate: string | Date,
  today: OracleToday = new Date(),
): PersonalCycles {
  const birth = parseBirthDate(birthDate);
  const calendarDate = resolveLocalCalendarDate(today);
  const personalYear = reducePreservingMasters(birth.month + birth.day + calendarDate.year);
  const personalMonth = reducePreservingMasters(personalYear + calendarDate.month);
  const personalDay = reduceToSingleDigit(personalMonth + calendarDate.day);

  return {
    birthDate: birth.iso,
    calendarDate,
    personalYear,
    personalMonth,
    personalDay,
  };
}

export function calculatePersonalDay(
  birthDate: string | Date,
  today: OracleToday = new Date(),
): SingleDigit {
  return calculatePersonalCycles(birthDate, today).personalDay;
}

/** Oráculo do dia: ciclos + conselho determinístico do dicionário 1–9. */
export function readDailyOracle(
  birthDate: string | Date,
  today: OracleToday = new Date(),
): DailyOracle {
  const cycles = calculatePersonalCycles(birthDate, today);
  return {
    cycles,
    entry: lookupOracleEntry(cycles.personalDay),
  };
}
