import {
  calculatePythagoreanChart,
  reducePreservingMasters,
  letterToPythagorean,
} from '../../src/domain/numerology';
import {
  MARIA_DA_SILVA,
  MARIA_SILVA,
  MARIA_SILVA_PYTHAGOREAN_DIGITS,
  MARIA_BIRTH_DATE,
} from './fixtures';

describe('calculatePythagoreanChart', () => {
  it('converte Maria da Silva pela tabela Pitagórica sem a partícula', () => {
    const chart = calculatePythagoreanChart(MARIA_DA_SILVA, MARIA_BIRTH_DATE);

    expect(chart.normalizedName).toBe('Maria Silva');
    expect(chart.letterMap.map((item) => item.letter).join('')).toBe('MARIASILVA');
    expect(chart.letterMap.map((item) => item.digit)).toEqual([...MARIA_SILVA_PYTHAGOREAN_DIGITS]);
  });

  it('produz o mesmo mapa para Maria da Silva e Maria Silva', () => {
    const withParticle = calculatePythagoreanChart(MARIA_DA_SILVA, MARIA_BIRTH_DATE);
    const withoutParticle = calculatePythagoreanChart(MARIA_SILVA, MARIA_BIRTH_DATE);

    expect(withParticle.soulNumber).toBe(withoutParticle.soulNumber);
    expect(withParticle.personalityNumber).toBe(withoutParticle.personalityNumber);
    expect(withParticle.expressionNumber).toBe(withoutParticle.expressionNumber);
    expect(withParticle.karmicLessons).toEqual(withoutParticle.karmicLessons);
  });

  it('calcula Alma 3, Aparência 3, Expressão 6 e Lições Cármicas 2,5,6,7,8', () => {
    const chart = calculatePythagoreanChart(MARIA_DA_SILVA, MARIA_BIRTH_DATE);

    expect(chart.soulSum).toBe(21);
    expect(chart.personalitySum).toBe(21);
    expect(chart.expressionSum).toBe(42);
    expect(chart.soulNumber).toBe(3);
    expect(chart.personalityNumber).toBe(3);
    expect(chart.expressionNumber).toBe(6);
    expect(chart.karmicLessons).toEqual([2, 5, 6, 7, 8]);
  });

  it('calcula Destino 6 para 15/08/1990 sem reduzir mestres intermediários indevidamente', () => {
    const chart = calculatePythagoreanChart(MARIA_DA_SILVA, MARIA_BIRTH_DATE);
    expect(chart.destinyNumber).toBe(6);
    expect(chart.birthDate).toBe(MARIA_BIRTH_DATE);
  });

  it('preserva números mestres 11, 22 e 33', () => {
    expect(reducePreservingMasters(11)).toBe(11);
    expect(reducePreservingMasters(22)).toBe(22);
    expect(reducePreservingMasters(33)).toBe(33);
    expect(reducePreservingMasters(29)).toBe(11);
    expect(reducePreservingMasters(47)).toBe(11);
    expect(reducePreservingMasters(21)).toBe(3);
  });

  it('mantém Alma 11 para Elena (vogais 5+5+1)', () => {
    const chart = calculatePythagoreanChart('Elena', '1990-01-01');
    expect(chart.soulSum).toBe(11);
    expect(chart.soulNumber).toBe(11);
    expect(chart.personalityNumber).toBe(8);
    expect(chart.expressionNumber).toBe(1);
  });

  it('mantém Destino 11 para 22/12/1939', () => {
    const chart = calculatePythagoreanChart('Ana', '1939-12-22');
    expect(chart.destinyNumber).toBe(11);
  });

  it('trata Ç como C na tabela Pitagórica', () => {
    expect(letterToPythagorean('C')).toBe(3);
    const chart = calculatePythagoreanChart('Ça', '1990-01-01');
    expect(chart.letterMap[0]?.letter).toBe('C');
    expect(chart.letterMap[0]?.digit).toBe(3);
  });

  it('rejeita nome vazio e data inválida', () => {
    expect(() => calculatePythagoreanChart('da de', MARIA_BIRTH_DATE)).toThrow();
    expect(() => calculatePythagoreanChart(MARIA_DA_SILVA, '1990-13-40')).toThrow();
    expect(() => calculatePythagoreanChart(MARIA_DA_SILVA, '15/08/1990')).toThrow();
  });
});
