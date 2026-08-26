import {
  buildKabbalisticTriangle,
  findNegativeSequences,
  readTriangleCell,
  reduceToSingleDigit,
  letterToKabbalistic,
} from '../../src/domain/numerology';
import {
  MARIA_DA_SILVA,
  MARIA_SILVA,
  MARIA_SILVA_KABBALISTIC_DIGITS,
  MARIA_SILVA_TRIANGLE_ROWS,
} from './fixtures';

describe('buildKabbalisticTriangle', () => {
  it('converte Maria da Silva pela Gematria 1–8 sem a partícula', () => {
    const triangle = buildKabbalisticTriangle(MARIA_DA_SILVA);

    expect(triangle.normalizedName).toBe('Maria Silva');
    expect(triangle.letters.join('')).toBe('MARIASILVA');
    expect(triangle.baseDigits).toEqual([...MARIA_SILVA_KABBALISTIC_DIGITS]);
  });

  it('é idêntico para Maria da Silva e Maria Silva', () => {
    const withParticle = buildKabbalisticTriangle(MARIA_DA_SILVA);
    const withoutParticle = buildKabbalisticTriangle(MARIA_SILVA);

    expect(withParticle.rows).toEqual(withoutParticle.rows);
    expect(withParticle.apex).toBe(withoutParticle.apex);
  });

  it('monta o Triângulo da Vida até o ápice 2', () => {
    const triangle = buildKabbalisticTriangle(MARIA_DA_SILVA);

    expect(triangle.rows).toEqual(MARIA_SILVA_TRIANGLE_ROWS);
    expect(triangle.apex).toBe(2);
    expect(triangle.rows[triangle.rows.length - 1]).toEqual([2]);
  });

  it('reduz soma > 9 a um único dígito (8+5=13→4)', () => {
    expect(reduceToSingleDigit(13)).toBe(4);
    expect(letterToKabbalistic('P')).toBe(8);
    expect(letterToKabbalistic('E')).toBe(5);

    const triangle = buildKabbalisticTriangle('Pe');
    expect(triangle.baseDigits).toEqual([8, 5]);
    expect(triangle.rows[1]).toEqual([4]);
    expect(triangle.apex).toBe(4);
    expect(triangle.arcanumHits).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          unreducedSum: 13,
          reducedDigit: 4,
          namePt: 'A Morte',
        }),
      ]),
    );
  });

  it('não preserva mestres na pirâmide: 11 vira 2', () => {
    const triangle = buildKabbalisticTriangle('Nu');
    expect(triangle.baseDigits).toEqual([5, 6]);
    expect(triangle.rows[1]).toEqual([2]);
    expect(triangle.apex).toBe(2);
  });
});

describe('findNegativeSequences', () => {
  it('detecta 444 na segunda linha do triângulo de Maria da Silva', () => {
    const triangle = buildKabbalisticTriangle(MARIA_DA_SILVA);
    const sequences = findNegativeSequences(triangle);
    const fourRun = sequences.find((item) => item.digit === 4 && item.axis === 'row');

    expect(fourRun).toBeDefined();
    expect(fourRun?.length).toBe(3);
    expect(fourRun?.cells).toEqual([
      { rowIndex: 1, columnIndex: 4 },
      { rowIndex: 1, columnIndex: 5 },
      { rowIndex: 1, columnIndex: 6 },
    ]);
  });

  it('detecta sequência negativa na diagonal descendente à direita', () => {
    const rows = [
      [1, 2, 3, 4],
      [1, 5, 6],
      [1, 7],
      [8],
    ] as const;
    const sequences = findNegativeSequences(rows);
    const diagonal = sequences.find((item) => item.axis === 'diagonalDownRight');

    expect(diagonal).toEqual(
      expect.objectContaining({
        digit: 1,
        length: 3,
        axis: 'diagonalDownRight',
      }),
    );
  });

  it('detecta sequência negativa na diagonal descendente à esquerda', () => {
    const rows = [
      [2, 3, 4, 5],
      [6, 7, 4],
      [8, 4],
      [4],
    ] as const;
    const sequences = findNegativeSequences(rows);
    const diagonal = sequences.find(
      (item) => item.axis === 'diagonalDownLeft' && item.digit === 4,
    );

    expect(diagonal?.length).toBe(3);
    expect(diagonal?.cells.map((cell) => cell.rowIndex)).toEqual([1, 2, 3]);
  });

  it('não marca pares (22, 44) como sequência negativa', () => {
    const sequences = findNegativeSequences([[1, 1, 2, 2, 3]]);
    expect(sequences).toEqual([]);
  });
});

describe('readTriangleCell', () => {
  it('abre o Arcano 13 — A Morte no nó composto de Pe', () => {
    const triangle = buildKabbalisticTriangle('Pe');
    const reading = readTriangleCell(triangle, 1, 0, false);

    expect(reading?.title).toBe('Arcano 13 — A Morte');
    expect(reading?.displayedDigit).toBe(4);
    expect(reading?.compoundArcana).toBe(true);
    expect(reading?.unreducedSum).toBe(13);
  });

  it('abre o Arcano da letra na base da pirâmide', () => {
    const triangle = buildKabbalisticTriangle('Pe');
    const reading = readTriangleCell(triangle, 0, 0, false);

    expect(reading?.letter).toBe('P');
    expect(reading?.title).toBe('Arcano 8 — A Justiça');
    expect(reading?.compoundArcana).toBe(false);
  });
});
