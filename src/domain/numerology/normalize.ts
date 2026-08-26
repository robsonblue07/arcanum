import { isNameParticle, splitNameWords } from './tables/name-particles';
import type { KabbalisticConvertOptions } from './types';

const SPECIAL_GRAPHEMES: Readonly<Record<string, string>> = {
  ç: 'c',
  Ç: 'C',
  ñ: 'n',
  Ñ: 'N',
  ß: 'ss',
};

const COMBINING_MARKS = /\p{M}/gu;
const LETTERS_ONLY = /[^A-Z]/g;

/**
 * Remove acentos após mapear grafemas especiais do português/espanhol.
 * Á, Ã, Â → A; É, Ê → E; Í → I; Ó, Ô, Õ → O; Ú, Ü → U; Ç → C; Ñ → N.
 */
export function stripDiacritics(raw: string): string {
  let buffer = '';
  for (const grapheme of raw) {
    buffer += SPECIAL_GRAPHEMES[grapheme] ?? grapheme;
  }
  return buffer.normalize('NFD').replace(COMBINING_MARKS, '');
}

export function normalizeLetter(raw: string): string {
  return stripDiacritics(raw).toUpperCase();
}

/**
 * Remove conectivos oficiais (da, de, do, das, dos) antes do cálculo.
 * "Maria da Silva" → "Maria Silva".
 */
export function stripNameParticles(fullName: string): string {
  return splitNameWords(fullName)
    .filter((word) => !isNameParticle(word))
    .join(' ');
}

export function prepareNameForCalculation(fullName: string): string {
  return stripNameParticles(fullName.trim());
}

/**
 * Extrai apenas letras A–Z na ordem em que aparecem no nome,
 * depois de remover partículas. Espaços, hífens e apóstrofos não entram.
 */
export function extractLetters(fullName: string): string[] {
  const prepared = prepareNameForCalculation(fullName);
  const normalized = stripDiacritics(prepared).toUpperCase();
  return normalized.replace(LETTERS_ONLY, '').split('').filter(Boolean);
}

export function extractLetterTokens(
  fullName: string,
  options: KabbalisticConvertOptions = {},
): string[] {
  const letters = extractLetters(fullName);
  if (options.phoneticDigraphs !== true) {
    return letters;
  }
  return applyPhoneticDigraphs(letters);
}

function applyPhoneticDigraphs(letters: readonly string[]): string[] {
  const tokens: string[] = [];
  for (let i = 0; i < letters.length; i += 1) {
    const current = letters[i];
    const next = letters[i + 1];
    if (current === 'P' && next === 'H') {
      tokens.push('F');
      i += 1;
      continue;
    }
    if (current !== undefined) {
      tokens.push(current);
    }
  }
  return tokens;
}
