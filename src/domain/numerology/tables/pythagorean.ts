import { extractLetters } from '../normalize';
import type { LetterConversion, PythagoreanDigit } from '../types';

/**
 * Tabela Pitagórica clássica (A=1 … I=9, ciclo de 9).
 *
 * 1: A J S
 * 2: B K T
 * 3: C L U
 * 4: D M V
 * 5: E N W
 * 6: F O X
 * 7: G P Y
 * 8: H Q Z
 * 9: I R
 */
export const PYTHAGOREAN_TABLE: Readonly<Record<string, PythagoreanDigit>> = {
  A: 1,
  B: 2,
  C: 3,
  D: 4,
  E: 5,
  F: 6,
  G: 7,
  H: 8,
  I: 9,
  J: 1,
  K: 2,
  L: 3,
  M: 4,
  N: 5,
  O: 6,
  P: 7,
  Q: 8,
  R: 9,
  S: 1,
  T: 2,
  U: 3,
  V: 4,
  W: 5,
  X: 6,
  Y: 7,
  Z: 8,
};

export const PYTHAGOREAN_VOWELS: ReadonlySet<string> = new Set([
  'A',
  'E',
  'I',
  'O',
  'U',
]);

/**
 * Y é vogal quando soa como tal (Yvonne, Yves). Tratada à parte
 * para o Número da Alma — a política será configurável no motor.
 */
export const PYTHAGOREAN_SEMIVOWELS: ReadonlySet<string> = new Set(['Y']);

export function isPythagoreanVowel(
  letter: string,
  treatYAsVowel = false,
): boolean {
  if (PYTHAGOREAN_VOWELS.has(letter)) {
    return true;
  }
  return treatYAsVowel && PYTHAGOREAN_SEMIVOWELS.has(letter);
}

export function letterToPythagorean(letter: string): PythagoreanDigit | null {
  const digit = PYTHAGOREAN_TABLE[letter];
  return digit ?? null;
}

export function nameToPythagoreanMap(fullName: string): LetterConversion[] {
  const letters = extractLetters(fullName);
  const mapped: LetterConversion[] = [];

  for (let i = 0; i < letters.length; i += 1) {
    const letter = letters[i];
    if (letter === undefined) {
      continue;
    }
    const digit = letterToPythagorean(letter);
    if (digit === null) {
      continue;
    }
    mapped.push({ letter, digit, sourceIndex: i });
  }

  return mapped;
}
