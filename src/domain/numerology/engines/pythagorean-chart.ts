import { nameToPythagoreanMap, isPythagoreanVowel } from '../tables/pythagorean';
import { prepareNameForCalculation } from '../normalize';
import { reducePreservingMasters } from '../reduce';
import type { PythagoreanChart, ReducedNumber, SingleDigit } from '../types';
import { parseBirthDate } from './birth-date';

const ALL_DIGITS: readonly SingleDigit[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];

export interface PythagoreanChartOptions {
  readonly treatYAsVowel?: boolean;
}

function destinyFromDate(year: number, month: number, day: number): ReducedNumber {
  const monthNumber = reducePreservingMasters(month);
  const dayNumber = reducePreservingMasters(day);
  const yearNumber = reducePreservingMasters(year);
  return reducePreservingMasters(monthNumber + dayNumber + yearNumber);
}

function karmicLessons(digits: readonly number[]): SingleDigit[] {
  const present = new Set(digits);
  return ALL_DIGITS.filter((digit) => !present.has(digit));
}

/**
 * Mapa Pitagórico: Alma (vogais), Aparência (consoantes), Expressão (total),
 * Destino (data) e Lições Cármicas (dígitos ausentes no nome).
 * Partículas já foram removidas em extractLetters.
 */
export function calculatePythagoreanChart(
  fullName: string,
  birthDate: string | Date,
  options: PythagoreanChartOptions = {},
): PythagoreanChart {
  const treatYAsVowel = options.treatYAsVowel ?? false;
  const normalizedName = prepareNameForCalculation(fullName);
  if (normalizedName.length === 0) {
    throw new Error('Full name must contain at least one significant word.');
  }

  const letterMap = nameToPythagoreanMap(fullName);
  if (letterMap.length === 0) {
    throw new Error('Full name must contain letters after normalization.');
  }

  const calendar = parseBirthDate(birthDate);

  let soulSum = 0;
  let personalitySum = 0;
  for (const item of letterMap) {
    if (isPythagoreanVowel(item.letter, treatYAsVowel)) {
      soulSum += item.digit;
    } else {
      personalitySum += item.digit;
    }
  }
  const expressionSum = soulSum + personalitySum;

  return {
    fullName: fullName.trim(),
    normalizedName,
    birthDate: calendar.iso,
    soulSum,
    personalitySum,
    expressionSum,
    soulNumber: reducePreservingMasters(soulSum),
    personalityNumber: reducePreservingMasters(personalitySum),
    expressionNumber: reducePreservingMasters(expressionSum),
    destinyNumber: destinyFromDate(calendar.year, calendar.month, calendar.day),
    karmicLessons: karmicLessons(letterMap.map((item) => item.digit)),
    letterMap,
  };
}
