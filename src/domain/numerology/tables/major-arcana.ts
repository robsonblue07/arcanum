import type { SingleDigit } from '../types';

export interface MajorArcana {
  readonly id: number;
  readonly namePt: string;
  readonly nameEn: string;
}

/**
 * Arcanos Maiores no padrão Marselha (8 = A Justiça, 11 = A Força),
 * comum na numerologia cabalística de língua portuguesa.
 * Somas adjacentes de 10–21 no triângulo apontam para estes arcanos.
 * 22 / 0 = O Louco.
 */
export const MAJOR_ARCANA: Readonly<Record<number, MajorArcana>> = {
  0: { id: 0, namePt: 'O Louco', nameEn: 'The Fool' },
  1: { id: 1, namePt: 'O Mago', nameEn: 'The Magician' },
  2: { id: 2, namePt: 'A Sacerdotisa', nameEn: 'The High Priestess' },
  3: { id: 3, namePt: 'A Imperatriz', nameEn: 'The Empress' },
  4: { id: 4, namePt: 'O Imperador', nameEn: 'The Emperor' },
  5: { id: 5, namePt: 'O Hierofante', nameEn: 'The Hierophant' },
  6: { id: 6, namePt: 'Os Enamorados', nameEn: 'The Lovers' },
  7: { id: 7, namePt: 'O Carro', nameEn: 'The Chariot' },
  8: { id: 8, namePt: 'A Justiça', nameEn: 'Justice' },
  9: { id: 9, namePt: 'O Eremita', nameEn: 'The Hermit' },
  10: { id: 10, namePt: 'A Roda da Fortuna', nameEn: 'Wheel of Fortune' },
  11: { id: 11, namePt: 'A Força', nameEn: 'Strength' },
  12: { id: 12, namePt: 'O Pendurado', nameEn: 'The Hanged Man' },
  13: { id: 13, namePt: 'A Morte', nameEn: 'Death' },
  14: { id: 14, namePt: 'A Temperança', nameEn: 'Temperance' },
  15: { id: 15, namePt: 'O Diabo', nameEn: 'The Devil' },
  16: { id: 16, namePt: 'A Torre', nameEn: 'The Tower' },
  17: { id: 17, namePt: 'A Estrela', nameEn: 'The Star' },
  18: { id: 18, namePt: 'A Lua', nameEn: 'The Moon' },
  19: { id: 19, namePt: 'O Sol', nameEn: 'The Sun' },
  20: { id: 20, namePt: 'O Julgamento', nameEn: 'Judgement' },
  21: { id: 21, namePt: 'O Mundo', nameEn: 'The World' },
  22: { id: 0, namePt: 'O Louco', nameEn: 'The Fool' },
};

export function reduceToSingleDigit(value: number): SingleDigit {
  if (value <= 0) {
    throw new Error(`Cannot reduce non-positive value: ${value}`);
  }
  let current = value;
  while (current > 9) {
    current = String(current)
      .split('')
      .reduce((sum, char) => sum + Number(char), 0);
  }
  return current as SingleDigit;
}

export function arcanaFromSum(unreducedSum: number): MajorArcana | null {
  if (unreducedSum === 22) {
    const fool = MAJOR_ARCANA[0];
    return fool ?? null;
  }
  const arcana = MAJOR_ARCANA[unreducedSum];
  return arcana ?? null;
}
