import { nameToKabbalisticMap } from '../tables/kabbalistic';
import { arcanaFromSum, reduceToSingleDigit } from '../tables/major-arcana';
import { prepareNameForCalculation } from '../normalize';
import type {
  ArcanumHit,
  KabbalisticConvertOptions,
  KabbalisticTriangle,
} from '../types';

function buildRowsAndArcanos(
  baseDigits: readonly number[],
): { rows: number[][]; arcanumHits: ArcanumHit[] } {
  const rows: number[][] = [ [...baseDigits] ];
  const arcanumHits: ArcanumHit[] = [];

  while ((rows[rows.length - 1] ?? []).length > 1) {
    const previous = rows[rows.length - 1];
    if (previous === undefined) {
      break;
    }
    const next: number[] = [];
    const nextRowIndex = rows.length;

    for (let i = 0; i < previous.length - 1; i += 1) {
      const left = previous[i];
      const right = previous[i + 1];
      if (left === undefined || right === undefined) {
        continue;
      }
      const unreducedSum = left + right;
      const reducedDigit = reduceToSingleDigit(unreducedSum);
      next.push(reducedDigit);

      if (unreducedSum >= 10) {
        const arcana = arcanaFromSum(unreducedSum);
        if (arcana !== null) {
          arcanumHits.push({
            rowIndex: nextRowIndex,
            columnIndex: next.length - 1,
            unreducedSum,
            reducedDigit,
            arcanaId: arcana.id,
            namePt: arcana.namePt,
            nameEn: arcana.nameEn,
          });
        }
      }
    }

    rows.push(next);
  }

  return { rows, arcanumHits };
}

/**
 * Triângulo da Vida (pirâmide invertida): cada célula é a soma dos
 * dois dígitos adjacentes da linha acima, reduzida a 1 dígito se > 9.
 * 8 + 5 = 13 → 4. Números mestres NÃO se aplicam aqui.
 */
export function buildKabbalisticTriangle(
  name: string,
  options: KabbalisticConvertOptions = {},
): KabbalisticTriangle {
  const normalizedName = prepareNameForCalculation(name);
  if (normalizedName.length === 0) {
    throw new Error('Name must contain at least one significant word.');
  }

  const letterMap = nameToKabbalisticMap(name, options);
  if (letterMap.length === 0) {
    throw new Error('Name must contain letters after normalization.');
  }

  const letters = letterMap.map((item) => item.letter);
  const baseDigits = letterMap.map((item) => item.digit);
  const { rows, arcanumHits } = buildRowsAndArcanos(baseDigits);
  const lastRow = rows[rows.length - 1];
  const apex = lastRow?.[0];
  if (apex === undefined) {
    throw new Error('Failed to reduce triangle to an apex digit.');
  }

  return {
    sourceName: name.trim(),
    normalizedName,
    letters,
    baseDigits,
    rows,
    apex,
    arcanumHits,
  };
}
