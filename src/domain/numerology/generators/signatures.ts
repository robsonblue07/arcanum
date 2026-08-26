import { isNameParticle, splitNameWords } from '../tables/name-particles';
import { extractLetters } from '../normalize';
import { reduceToSingleDigit } from '../tables/major-arcana';
import { calculatePythagoreanChart } from '../engines/pythagorean-chart';
import { buildKabbalisticTriangle } from '../engines/kabbalistic-triangle';
import { findNegativeSequences } from '../engines/negative-sequences';
import type {
  OptimizedSignaturesResult,
  ReducedNumber,
  SignatureCandidate,
  SignatureGenerationOptions,
} from '../types';

type WordMode = 'full' | 'initial' | 'omit';

interface SignificantWord {
  readonly text: string;
  readonly leadingParticle: string | null;
}

function parseSignificantWords(fullName: string): SignificantWord[] {
  const raw = splitNameWords(fullName);
  const words: SignificantWord[] = [];
  let pendingParticle: string | null = null;

  for (const token of raw) {
    if (isNameParticle(token)) {
      pendingParticle = token;
      continue;
    }
    words.push({ text: token, leadingParticle: pendingParticle });
    pendingParticle = null;
  }

  return words;
}

function initialOf(word: string): string {
  const letters = extractLetters(word);
  const first = letters[0];
  if (first === undefined) {
    throw new Error(`Cannot abbreviate word without letters: "${word}"`);
  }
  return `${first}.`;
}

function formatSignature(words: readonly SignificantWord[], modes: readonly WordMode[]): string {
  const parts: string[] = [];

  for (let i = 0; i < words.length; i += 1) {
    const word = words[i];
    const mode = modes[i];
    if (word === undefined || mode === undefined || mode === 'omit') {
      continue;
    }
    if (mode === 'initial') {
      parts.push(initialOf(word.text));
      continue;
    }
    if (word.leadingParticle !== null && parts.length > 0) {
      parts.push(`${word.leadingParticle} ${word.text}`);
      continue;
    }
    parts.push(word.text);
  }

  return parts.join(' ');
}

function isValidModeSet(modes: readonly WordMode[]): boolean {
  if (modes[0] === 'omit') {
    return false;
  }
  const kept = modes.filter((mode) => mode !== 'omit');
  const fullCount = modes.filter((mode) => mode === 'full').length;
  return kept.length > 0 && fullCount > 0;
}

function enumerateModes(wordCount: number): WordMode[][] {
  if (wordCount <= 0) {
    return [];
  }

  const results: WordMode[][] = [];
  const current: WordMode[] = Array.from({ length: wordCount }, () => 'full');

  const walk = (index: number): void => {
    if (index >= wordCount) {
      if (isValidModeSet(current)) {
        results.push([...current]);
      }
      return;
    }

    const options: WordMode[] =
      index === 0 ? ['full', 'initial'] : ['full', 'initial', 'omit'];

    for (const option of options) {
      current[index] = option;
      walk(index + 1);
    }
  };

  walk(0);
  return results;
}

function isHarmonicWithDestiny(apex: number, destinyNumber: ReducedNumber): boolean {
  if (apex === destinyNumber) {
    return true;
  }
  return apex === reduceToSingleDigit(destinyNumber);
}

function scoreCandidate(
  candidate: Omit<SignatureCandidate, 'score'>,
  originalLetterCount: number,
  omittedWords: number,
  initialCount: number,
): number {
  let score = 0;
  const negatives = candidate.negativeSequences;

  if (negatives.length === 0) {
    score += 1000;
  } else {
    score -= 200 * negatives.length;
    for (const sequence of negatives) {
      score -= 25 * (sequence.length - 2);
    }
  }

  if (candidate.isHarmonicWithDestiny) {
    score += 400;
  }

  const keptLetters = candidate.triangle.letters.length;
  if (originalLetterCount > 0) {
    score += Math.round((100 * keptLetters) / originalLetterCount);
  }

  score -= 15 * initialCount;
  score -= 40 * omittedWords;
  return score;
}

const DEFAULT_MAX_RESULTS = 12;

/**
 * Gera variações da assinatura (abreviações e inclusão/remoção de
 * sobrenomes), pontua cada uma e devolve as melhores: sem sequências
 * negativas e com ápice harmônico ao Número de Destino.
 */
export function generateOptimizedSignatures(
  fullName: string,
  birthDate: string | Date,
  options: SignatureGenerationOptions = {},
): OptimizedSignaturesResult {
  const maxResults = options.maxResults ?? DEFAULT_MAX_RESULTS;
  const phonetic =
    options.phoneticDigraphs === true ? { phoneticDigraphs: true } : {};

  const chart = calculatePythagoreanChart(fullName, birthDate);
  const words = parseSignificantWords(fullName);
  if (words.length === 0) {
    throw new Error('Full name must contain at least one significant word.');
  }

  const originalLetterCount = extractLetters(fullName).length;
  const seen = new Set<string>();
  const scored: SignatureCandidate[] = [];

  const consider = (signature: string, omittedWords: number, initialCount: number): void => {
    const triangle = buildKabbalisticTriangle(signature, phonetic);
    const key = triangle.letters.join('');
    if (seen.has(key)) {
      return;
    }
    seen.add(key);

    const negativeSequences = findNegativeSequences(triangle);
    const harmonic = isHarmonicWithDestiny(triangle.apex, chart.destinyNumber);
    const partial = {
      signature,
      triangle,
      negativeSequences,
      destinyNumber: chart.destinyNumber,
      isHarmonicWithDestiny: harmonic,
    };
    scored.push({
      ...partial,
      score: scoreCandidate(partial, originalLetterCount, omittedWords, initialCount),
    });
  };

  const originalSignature = formatSignature(
    words,
    words.map(() => 'full'),
  );
  consider(originalSignature.length > 0 ? originalSignature : fullName.trim(), 0, 0);

  for (const modes of enumerateModes(words.length)) {
    const signature = formatSignature(words, modes);
    if (signature.length === 0) {
      continue;
    }
    const omittedWords = modes.filter((mode) => mode === 'omit').length;
    const initialCount = modes.filter((mode) => mode === 'initial').length;
    consider(signature, omittedWords, initialCount);
  }

  scored.sort((left, right) => {
    if (right.score !== left.score) {
      return right.score - left.score;
    }
    return right.triangle.letters.length - left.triangle.letters.length;
  });

  const original = scored.find(
    (candidate) => candidate.triangle.letters.join('') === extractLetters(fullName).join(''),
  );
  if (original === undefined) {
    throw new Error('Failed to evaluate the original signature.');
  }

  const recommendations = scored
    .filter((candidate) => candidate.signature !== original.signature)
    .slice(0, maxResults);

  return { original, recommendations };
}

/**
 * Primeira firma da lista otimizada que está livre de bloqueios.
 * Se nenhuma estiver limpa, devolve a melhor recomendação (ou a original).
 */
export function selectRectifiedSignature(
  result: OptimizedSignaturesResult,
): SignatureCandidate {
  const clean = result.recommendations.find((item) => item.negativeSequences.length === 0);
  if (clean !== undefined) {
    return clean;
  }
  return result.recommendations[0] ?? result.original;
}

