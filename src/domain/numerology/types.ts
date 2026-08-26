/**
 * Contratos do motor de numerologia.
 * Isolados de React, I/O e UI — apenas dados e formas matemáticas.
 */

export type PythagoreanDigit = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export type KabbalisticDigit = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
export type SingleDigit = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export type MasterNumber = 11 | 22 | 33;

export type ReducedNumber = SingleDigit | MasterNumber;

export type SequenceAxis = 'row' | 'diagonalDownRight' | 'diagonalDownLeft';

export interface LetterConversion {
  readonly letter: string;
  readonly digit: number;
  readonly sourceIndex: number;
}

export interface PythagoreanChart {
  readonly fullName: string;
  readonly normalizedName: string;
  readonly birthDate: string;
  readonly soulNumber: ReducedNumber;
  readonly personalityNumber: ReducedNumber;
  readonly expressionNumber: ReducedNumber;
  readonly destinyNumber: ReducedNumber;
  readonly soulSum: number;
  readonly personalitySum: number;
  readonly expressionSum: number;
  readonly karmicLessons: readonly SingleDigit[];
  readonly letterMap: readonly LetterConversion[];
}

export interface ArcanumHit {
  readonly rowIndex: number;
  readonly columnIndex: number;
  readonly unreducedSum: number;
  readonly reducedDigit: SingleDigit;
  readonly arcanaId: number;
  readonly namePt: string;
  readonly nameEn: string;
}

export interface TriangleCell {
  readonly rowIndex: number;
  readonly columnIndex: number;
}

export interface NegativeSequence {
  readonly digit: SingleDigit;
  readonly length: number;
  readonly axis: SequenceAxis;
  readonly cells: readonly TriangleCell[];
}

export interface KabbalisticTriangle {
  readonly sourceName: string;
  readonly normalizedName: string;
  readonly letters: readonly string[];
  readonly baseDigits: readonly number[];
  readonly rows: readonly (readonly number[])[];
  readonly apex: number;
  readonly arcanumHits: readonly ArcanumHit[];
}

export interface SignatureCandidate {
  readonly signature: string;
  readonly triangle: KabbalisticTriangle;
  readonly negativeSequences: readonly NegativeSequence[];
  readonly destinyNumber: ReducedNumber;
  readonly isHarmonicWithDestiny: boolean;
  readonly score: number;
}

export interface OptimizedSignaturesResult {
  readonly original: SignatureCandidate;
  readonly recommendations: readonly SignatureCandidate[];
}

export interface KabbalisticConvertOptions {
  /**
   * Quando true, dígrafos como PH são lidos pelo som (F).
   * Para retificação de assinatura o padrão é false: conta-se o traçado escrito.
   */
  readonly phoneticDigraphs?: boolean;
}

export interface SignatureGenerationOptions {
  readonly maxResults?: number;
  readonly phoneticDigraphs?: boolean;
}
