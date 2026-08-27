import { extractLetters } from '../normalize';
import { isNameParticle, splitNameWords } from '../tables/name-particles';
import { reduceToSingleDigit } from '../tables/major-arcana';
import { buildKabbalisticTriangle } from './kabbalistic-triangle';
import { findNegativeSequences } from './negative-sequences';

export type ForgeKind = 'business' | 'baby';

export interface ForgeOptions {
  readonly type: ForgeKind;
  readonly baseWords: readonly string[];
  readonly targetDestiny?: number;
}

export interface GoldenName {
  readonly name: string;
  readonly apex: number;
  readonly isHarmonicWithDestiny: boolean;
  readonly possui_bloqueio: false;
  readonly score: number;
  readonly kind: ForgeKind;
}

const MAX_WORDS = 5;
const MAX_RESULTS = 5;
const EXPANSION_APEX = [8, 3, 9] as const;

const EXPANSION_WEIGHT: Readonly<Record<number, number>> = {
  8: 50,
  3: 44,
  9: 40,
  1: 22,
  6: 18,
  5: 16,
  7: 12,
  2: 10,
  4: 8,
};

function significantWords(baseWords: readonly string[]): string[] {
  const seen = new Set<string>();
  const words: string[] = [];

  for (const raw of baseWords) {
    for (const token of splitNameWords(raw)) {
      if (isNameParticle(token)) {
        continue;
      }
      const letters = extractLetters(token);
      if (letters.length === 0) {
        continue;
      }
      const key = letters.join('');
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);
      words.push(token.trim());
      if (words.length >= MAX_WORDS) {
        return words;
      }
    }
  }

  return words;
}

function permute<T>(items: readonly T[]): T[][] {
  if (items.length <= 1) {
    return [[...items]];
  }
  const results: T[][] = [];
  for (let index = 0; index < items.length; index += 1) {
    const head = items[index];
    if (head === undefined) {
      continue;
    }
    const rest = items.filter((_, current) => current !== index);
    for (const tail of permute(rest)) {
      results.push([head, ...tail]);
    }
  }
  return results;
}

function subsets(words: readonly string[]): string[][] {
  const results: string[][] = [];
  const total = 1 << words.length;
  for (let mask = 1; mask < total; mask += 1) {
    const subset: string[] = [];
    for (let index = 0; index < words.length; index += 1) {
      const word = words[index];
      if (word !== undefined && (mask & (1 << index)) !== 0) {
        subset.push(word);
      }
    }
    if (subset.length > 0) {
      results.push(subset);
    }
  }
  return results;
}

function formatDisplayName(kind: ForgeKind, words: readonly string[]): string {
  if (words.length === 0) {
    return '';
  }
  if (kind === 'business' || words.length === 1) {
    return words.join(' ');
  }
  const first = words[0];
  const last = words[words.length - 1];
  if (first === undefined || last === undefined) {
    return words.join(' ');
  }
  if (words.length === 2) {
    return `${first} de ${last}`;
  }
  const middle = words.slice(1, -1).join(' ');
  return `${first} ${middle} de ${last}`;
}

function apexHarmony(apex: number, targetDestiny: number | undefined): boolean {
  if (targetDestiny === undefined) {
    return EXPANSION_APEX.some((value) => value === apex);
  }
  if (apex === targetDestiny) {
    return true;
  }
  return apex === reduceToSingleDigit(targetDestiny);
}

function scoreGolden(
  apex: number,
  wordCount: number,
  targetDestiny: number | undefined,
): number {
  let score = EXPANSION_WEIGHT[apex] ?? 0;
  if (targetDestiny !== undefined) {
    if (apex === targetDestiny) {
      score += 100;
    } else if (apex === reduceToSingleDigit(targetDestiny)) {
      score += 80;
    }
  }
  score += wordCount * 3;
  return score;
}

/**
 * Forja combinatória: permuta palavras e partículas, calcula o Triângulo
 * e descarta na hora qualquer nome com sequência 111–999.
 */
export function generateGoldenNames(options: ForgeOptions): GoldenName[] {
  const words = significantWords(options.baseWords);
  if (words.length === 0) {
    throw new Error('Informe ao menos uma palavra com letras para forjar.');
  }

  const targetDestiny = options.targetDestiny;
  const seen = new Set<string>();
  const forged: GoldenName[] = [];

  for (const subset of subsets(words)) {
    for (const ordered of permute(subset)) {
      const display = formatDisplayName(options.type, ordered);
      if (display.length === 0) {
        continue;
      }

      let triangle;
      try {
        triangle = buildKabbalisticTriangle(display);
      } catch {
        continue;
      }

      const key = triangle.letters.join('');
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);

      const sequences = findNegativeSequences(triangle);
      if (sequences.length > 0) {
        continue;
      }

      forged.push({
        name: display,
        apex: triangle.apex,
        isHarmonicWithDestiny: apexHarmony(triangle.apex, targetDestiny),
        possui_bloqueio: false,
        score: scoreGolden(triangle.apex, ordered.length, targetDestiny),
        kind: options.type,
      });
    }
  }

  forged.sort((left, right) => {
    if (right.score !== left.score) {
      return right.score - left.score;
    }
    if (left.apex !== right.apex) {
      return left.apex - right.apex;
    }
    return left.name.localeCompare(right.name, 'pt-BR');
  });

  return forged.slice(0, MAX_RESULTS);
}
