import { extractLetterTokens } from '../normalize';
import type {
  KabbalisticConvertOptions,
  KabbalisticDigit,
  LetterConversion,
} from '../types';

/**
 * Tabela de Gematria Cabalística / Caldeia (1–8).
 * O 9 não é atribuído a letras: é considerado número divino/kármico,
 * podendo aparecer apenas como soma no Triângulo da Vida.
 *
 * 1: A I J Q Y
 * 2: B K R
 * 3: C G L S
 * 4: D M T
 * 5: E H N
 * 6: U V W X
 * 7: O Z
 * 8: F P
 *
 * Esta é a matriz usada na retificação de assinaturas (tradição
 * cabalística brasileira / caldeia). Acentuação é resolvida antes
 * do lookup (ver normalize.ts). Fonética (PH→F) é opt-in.
 */
export const KABBALISTIC_TABLE: Readonly<Record<string, KabbalisticDigit>> = {
  A: 1,
  I: 1,
  J: 1,
  Q: 1,
  Y: 1,
  B: 2,
  K: 2,
  R: 2,
  C: 3,
  G: 3,
  L: 3,
  S: 3,
  D: 4,
  M: 4,
  T: 4,
  E: 5,
  H: 5,
  N: 5,
  U: 6,
  V: 6,
  W: 6,
  X: 6,
  O: 7,
  Z: 7,
  F: 8,
  P: 8,
};

export const KABBALISTIC_MAX_LETTER_VALUE = 8 as const;

export function letterToKabbalistic(letter: string): KabbalisticDigit | null {
  const digit = KABBALISTIC_TABLE[letter];
  return digit ?? null;
}

export function nameToKabbalisticMap(
  fullName: string,
  options: KabbalisticConvertOptions = {},
): LetterConversion[] {
  const tokens = extractLetterTokens(fullName, options);
  const mapped: LetterConversion[] = [];

  for (let i = 0; i < tokens.length; i += 1) {
    const letter = tokens[i];
    if (letter === undefined) {
      continue;
    }
    const digit = letterToKabbalistic(letter);
    if (digit === null) {
      continue;
    }
    mapped.push({ letter, digit, sourceIndex: i });
  }

  return mapped;
}

export function nameToKabbalisticDigits(
  fullName: string,
  options: KabbalisticConvertOptions = {},
): number[] {
  return nameToKabbalisticMap(fullName, options).map((item) => item.digit);
}
