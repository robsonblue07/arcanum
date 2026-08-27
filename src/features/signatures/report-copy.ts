import type { TFunction } from 'i18next';
import type { NegativeSequence, ReducedNumber, SignatureCandidate } from '../../domain/numerology';

export function sequenceCodes(sequences: readonly NegativeSequence[]): string[] {
  return [...new Set(sequences.map((item) => String(item.digit).repeat(item.length)))];
}

export function blockageImpactLine(
  sequences: readonly NegativeSequence[],
  t: TFunction,
): string {
  if (sequences.length === 0) {
    return t('report.blockage.none');
  }

  const ranked = [...sequences].sort((left, right) => right.length - left.length);
  const primary = ranked[0];
  if (primary === undefined) {
    return t('report.blockage.fallback');
  }

  const key = `report.blockage.${primary.digit}`;
  const copy = t(key);
  if (copy !== key) {
    return copy;
  }
  return t('report.blockage.generic', { code: String(primary.digit).repeat(primary.length) });
}

export function reliefLine(candidate: SignatureCandidate, t: TFunction): string {
  const destiny = formatDestiny(candidate.destinyNumber);
  if (candidate.negativeSequences.length === 0 && candidate.isHarmonicWithDestiny) {
    return t('report.relief.harmonic', {
      signature: candidate.signature,
      apex: candidate.triangle.apex,
      destiny,
    });
  }
  if (candidate.negativeSequences.length === 0) {
    return t('report.relief.clear', {
      signature: candidate.signature,
      apex: candidate.triangle.apex,
    });
  }
  return t('report.relief.soften', {
    signature: candidate.signature,
    destiny,
  });
}

function formatDestiny(value: ReducedNumber): string {
  return String(value);
}
