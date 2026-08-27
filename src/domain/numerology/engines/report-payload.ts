import { calculatePythagoreanChart } from './pythagorean-chart';
import { collectKabbalisticArcana } from './synastry';
import { selectRectifiedSignature } from '../generators/signatures';
import type { DailyOracle } from './oracle';
import type {
  NegativeSequence,
  OptimizedSignaturesResult,
  ReducedNumber,
  SignatureCandidate,
  SingleDigit,
} from '../types';

export const GRIMOIRE_CHAPTERS = [
  {
    number: 1,
    title: 'O Código Oculto da sua Data de Nascimento (Destino e Missão)',
  },
  {
    number: 2,
    title: 'A Anatomia do Triângulo da Vida & Revelação dos 99 Arcanos',
  },
  {
    number: 3,
    title: 'Rompimento de Bloqueios Kármicos & O Poder da Nova Assinatura',
  },
  {
    number: 4,
    title: 'Guia Prático de Ativação Prosperidade e Selo de Conclusão',
  },
] as const;

export interface ReportProfileInput {
  readonly fullName: string;
  readonly birthDate: string;
}

export interface SynastryReportSummary {
  readonly partnerName: string;
  readonly partnerBirthDate: string;
  readonly affinityScore: number;
  readonly destinyHarmony: 'harmonic' | 'neutral' | 'challenging';
  readonly seals: readonly string[];
  readonly sharedArcanaIds: readonly number[];
}

export interface CanonicalBlockage {
  readonly code: string;
  readonly digit: SingleDigit;
  readonly length: number;
  readonly axis: NegativeSequence['axis'];
}

export interface CanonicalArcana {
  readonly id: number;
  readonly namePt: string;
  readonly reducedDigit: SingleDigit;
}

export interface CanonicalSignature {
  readonly signature: string;
  readonly apex: number;
  readonly destinyNumber: ReducedNumber;
  readonly isHarmonicWithDestiny: boolean;
  readonly score: number;
  readonly blockageCodes: readonly string[];
  readonly blockages: readonly CanonicalBlockage[];
}

export interface CanonicalReportPayload {
  readonly schemaVersion: 1;
  readonly person: {
    readonly fullName: string;
    readonly normalizedName: string;
    readonly birthDate: string;
  };
  readonly triad: {
    readonly destiny: ReducedNumber;
    readonly mission: ReducedNumber;
    readonly soul: ReducedNumber;
    readonly personality: ReducedNumber;
    readonly apex: number;
  };
  readonly pyramid: {
    readonly sourceSignature: string;
    readonly apex: number;
    readonly rows: readonly (readonly number[])[];
    readonly arcana: readonly CanonicalArcana[];
    readonly blockages: readonly CanonicalBlockage[];
    readonly blockageCodes: readonly string[];
  };
  readonly originalSignature: CanonicalSignature;
  readonly rectifiedSignature: CanonicalSignature;
  readonly oracle: {
    readonly calendarDate: string;
    readonly personalYear: ReducedNumber;
    readonly personalMonth: ReducedNumber;
    readonly personalDay: SingleDigit;
    readonly title: string;
    readonly summary: string;
  };
  readonly synastry: SynastryReportSummary | null;
}

function blockageCode(sequence: NegativeSequence): string {
  return String(sequence.digit).repeat(sequence.length);
}

function mapBlockages(sequences: readonly NegativeSequence[]): CanonicalBlockage[] {
  return sequences.map((sequence) => ({
    code: blockageCode(sequence),
    digit: sequence.digit,
    length: sequence.length,
    axis: sequence.axis,
  }));
}

function uniqueCodes(blockages: readonly CanonicalBlockage[]): string[] {
  return [...new Set(blockages.map((item) => item.code))].sort();
}

function mapSignature(candidate: SignatureCandidate): CanonicalSignature {
  const blockages = mapBlockages(candidate.negativeSequences);
  return {
    signature: candidate.signature,
    apex: candidate.triangle.apex,
    destinyNumber: candidate.destinyNumber,
    isHarmonicWithDestiny: candidate.isHarmonicWithDestiny,
    score: candidate.score,
    blockageCodes: uniqueCodes(blockages),
    blockages,
  };
}

/**
 * Compila um payload canônico a partir de cálculos já feitos pelos motores.
 * Não inventa números: apenas projeta Destino, Missão, ápice, 99 arcanos e bloqueios.
 */
export function buildCanonicalReportPayload(
  profile: ReportProfileInput,
  signatures: OptimizedSignaturesResult,
  oracle: DailyOracle,
  synastrySummary?: SynastryReportSummary,
): CanonicalReportPayload {
  const chart = calculatePythagoreanChart(profile.fullName, profile.birthDate);
  const original = signatures.original;
  const rectified = selectRectifiedSignature(signatures);
  const arcana = collectKabbalisticArcana(original.triangle).map((item) => ({
    id: item.arcanaId,
    namePt: item.namePt,
    reducedDigit: item.reducedDigit,
  }));
  const pyramidBlockages = mapBlockages(original.negativeSequences);

  return {
    schemaVersion: 1,
    person: {
      fullName: profile.fullName.trim(),
      normalizedName: chart.normalizedName,
      birthDate: chart.birthDate,
    },
    triad: {
      destiny: chart.destinyNumber,
      mission: chart.expressionNumber,
      soul: chart.soulNumber,
      personality: chart.personalityNumber,
      apex: original.triangle.apex,
    },
    pyramid: {
      sourceSignature: original.signature,
      apex: original.triangle.apex,
      rows: original.triangle.rows.map((row) => [...row]),
      arcana,
      blockages: pyramidBlockages,
      blockageCodes: uniqueCodes(pyramidBlockages),
    },
    originalSignature: mapSignature(original),
    rectifiedSignature: mapSignature(rectified),
    oracle: {
      calendarDate: oracle.cycles.calendarDate.iso,
      personalYear: oracle.cycles.personalYear,
      personalMonth: oracle.cycles.personalMonth,
      personalDay: oracle.cycles.personalDay,
      title: oracle.entry.title,
      summary: oracle.entry.summary,
    },
    synastry: synastrySummary ?? null,
  };
}
