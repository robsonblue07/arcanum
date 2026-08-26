import { MAJOR_ARCANA, type MajorArcana } from '../tables/major-arcana';
import {
  formatArcanaTitle,
  meaningForArcana,
  type ArcanaMeaning,
} from '../tables/arcana-meanings';
import type { ArcanumHit, KabbalisticTriangle } from '../types';

export interface TriangleCellReading {
  readonly rowIndex: number;
  readonly columnIndex: number;
  readonly displayedDigit: number;
  readonly letter: string | null;
  readonly blocked: boolean;
  readonly compoundArcana: boolean;
  readonly unreducedSum: number | null;
  readonly arcana: MajorArcana;
  readonly title: string;
  readonly meaning: ArcanaMeaning;
}

export function readTriangleCell(
  triangle: KabbalisticTriangle,
  rowIndex: number,
  columnIndex: number,
  blocked: boolean,
): TriangleCellReading | null {
  const row = triangle.rows[rowIndex];
  const displayedDigit = row?.[columnIndex];
  if (displayedDigit === undefined) {
    return null;
  }

  const hit = findHit(triangle.arcanumHits, rowIndex, columnIndex);
  const arcana = resolveArcana(displayedDigit, hit);
  if (arcana === null) {
    return null;
  }

  const unreducedSum = hit?.unreducedSum ?? null;
  const letter = rowIndex === 0 ? (triangle.letters[columnIndex] ?? null) : null;

  return {
    rowIndex,
    columnIndex,
    displayedDigit,
    letter,
    blocked,
    compoundArcana: hit !== null,
    unreducedSum,
    arcana,
    title:
      unreducedSum === null ? formatArcanaTitle(arcana) : formatArcanaTitle(arcana, unreducedSum),
    meaning: meaningForArcana(arcana),
  };
}

function findHit(
  hits: readonly ArcanumHit[],
  rowIndex: number,
  columnIndex: number,
): ArcanumHit | null {
  return (
    hits.find((hit) => hit.rowIndex === rowIndex && hit.columnIndex === columnIndex) ?? null
  );
}

function resolveArcana(displayedDigit: number, hit: ArcanumHit | null): MajorArcana | null {
  if (hit !== null) {
    return (
      MAJOR_ARCANA[hit.arcanaId] ?? {
        id: hit.arcanaId,
        namePt: hit.namePt,
        nameEn: hit.nameEn,
      }
    );
  }
  return MAJOR_ARCANA[displayedDigit] ?? null;
}
