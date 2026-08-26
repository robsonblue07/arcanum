import type {
  KabbalisticTriangle,
  NegativeSequence,
  SequenceAxis,
  SingleDigit,
  TriangleCell,
} from '../types';

const MIN_SEQUENCE_LENGTH = 3;

function isTriangle(
  value: KabbalisticTriangle | readonly (readonly number[])[],
): value is KabbalisticTriangle {
  return !Array.isArray(value) && 'rows' in value;
}

function toDigit(value: number): SingleDigit | null {
  if (value >= 1 && value <= 9 && Number.isInteger(value)) {
    return value as SingleDigit;
  }
  return null;
}

function collectRuns(
  cells: readonly TriangleCell[],
  values: readonly number[],
  axis: SequenceAxis,
): NegativeSequence[] {
  const sequences: NegativeSequence[] = [];
  let runStart = 0;

  for (let i = 1; i <= values.length; i += 1) {
    const previous = values[i - 1];
    const current = i < values.length ? values[i] : undefined;
    if (current === previous) {
      continue;
    }

    const length = i - runStart;
    if (length >= MIN_SEQUENCE_LENGTH && previous !== undefined) {
      const digit = toDigit(previous);
      const slice = cells.slice(runStart, i);
      if (digit !== null && slice.length === length) {
        sequences.push({
          digit,
          length,
          axis,
          cells: slice,
        });
      }
    }
    runStart = i;
  }

  return sequences;
}

function scanLine(
  rows: readonly (readonly number[])[],
  points: readonly TriangleCell[],
  axis: SequenceAxis,
): NegativeSequence[] {
  if (points.length < MIN_SEQUENCE_LENGTH) {
    return [];
  }

  const values: number[] = [];
  const cells: TriangleCell[] = [];
  for (const point of points) {
    const value = rows[point.rowIndex]?.[point.columnIndex];
    if (value === undefined) {
      return [];
    }
    values.push(value);
    cells.push(point);
  }

  return collectRuns(cells, values, axis);
}

/**
 * Varre linhas e ambas as diagonais do triângulo em busca de
 * 3+ dígitos adjacentes idênticos (111, 222, …, 999).
 */
export function findNegativeSequences(
  triangleData: KabbalisticTriangle | readonly (readonly number[])[],
): NegativeSequence[] {
  const rows = isTriangle(triangleData) ? triangleData.rows : triangleData;
  if (rows.length === 0) {
    return [];
  }

  const sequences: NegativeSequence[] = [];
  const width = rows[0]?.length ?? 0;

  for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
    const row = rows[rowIndex];
    if (row === undefined) {
      continue;
    }
    const points = row.map((_, columnIndex) => ({ rowIndex, columnIndex }));
    sequences.push(...scanLine(rows, points, 'row'));
  }

  for (let column = 0; column < width; column += 1) {
    const points: TriangleCell[] = [];
    for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
      const row = rows[rowIndex];
      if (row === undefined || column >= row.length) {
        break;
      }
      points.push({ rowIndex, columnIndex: column });
    }
    sequences.push(...scanLine(rows, points, 'diagonalDownRight'));
  }

  for (let startColumn = 0; startColumn < width; startColumn += 1) {
    const points: TriangleCell[] = [];
    for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
      const columnIndex = startColumn - rowIndex;
      const row = rows[rowIndex];
      if (row === undefined || columnIndex < 0 || columnIndex >= row.length) {
        break;
      }
      points.push({ rowIndex, columnIndex });
    }
    sequences.push(...scanLine(rows, points, 'diagonalDownLeft'));
  }

  return sequences;
}
