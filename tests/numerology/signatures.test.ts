import { generateOptimizedSignatures, selectRectifiedSignature } from '../../src/domain/numerology';
import { MARIA_DA_SILVA, MARIA_BIRTH_DATE } from './fixtures';

describe('generateOptimizedSignatures', () => {
  const result = generateOptimizedSignatures(MARIA_DA_SILVA, MARIA_BIRTH_DATE);

  it('avalia a assinatura original com partícula visível e sem ela no cálculo', () => {
    expect(result.original.signature).toBe('Maria da Silva');
    expect(result.original.triangle.letters.join('')).toBe('MARIASILVA');
    expect(result.original.triangle.apex).toBe(2);
    expect(result.original.destinyNumber).toBe(6);
    expect(result.original.isHarmonicWithDestiny).toBe(false);
    expect(result.original.negativeSequences.length).toBeGreaterThan(0);
  });

  it('gera variações por abreviação e remoção de sobrenome', () => {
    const signatures = result.recommendations.map((item) => item.signature);

    expect(signatures).toEqual(expect.arrayContaining(['Maria', 'M. da Silva', 'Maria S.']));
    expect(signatures).not.toContain('Maria da Silva');
  });

  it('ranqueia candidatos sem sequências negativas acima da firma original bloqueada', () => {
    const clean = result.recommendations.filter((item) => item.negativeSequences.length === 0);
    expect(clean.length).toBeGreaterThan(0);
    expect(clean[0]?.score).toBeGreaterThan(result.original.score);
  });

  it('marca harmonia quando o ápice coincide com o Destino (ou sua raiz)', () => {
    const ana = generateOptimizedSignatures('Ana', '1986-03-03');
    expect(ana.original.triangle.apex).toBe(3);
    expect(ana.original.destinyNumber).toBe(3);
    expect(ana.original.isHarmonicWithDestiny).toBe(true);
    expect(ana.original.negativeSequences).toEqual([]);
  });

  it('considera Destino 11 harmônico com ápice 2', () => {
    const ana = generateOptimizedSignatures('Ana', '1939-12-22');
    expect(ana.original.destinyNumber).toBe(11);
    expect(ana.original.triangle.apex).toBe(3);
    expect(ana.original.isHarmonicWithDestiny).toBe(false);

    const maria = generateOptimizedSignatures(MARIA_DA_SILVA, '1939-12-22');
    expect(maria.original.destinyNumber).toBe(11);
    expect(maria.original.triangle.apex).toBe(2);
    expect(maria.original.isHarmonicWithDestiny).toBe(true);
  });

  it('ordena recomendações da maior para a menor pontuação', () => {
    const scores = result.recommendations.map((item) => item.score);
    const sorted = [...scores].sort((a, b) => b - a);
    expect(scores).toEqual(sorted);
  });
});

describe('selectRectifiedSignature', () => {
  it('escolhe a primeira firma livre de bloqueios da lista otimizada', () => {
    const result = generateOptimizedSignatures(MARIA_DA_SILVA, MARIA_BIRTH_DATE);
    const rectified = selectRectifiedSignature(result);

    expect(rectified.signature).not.toBe(result.original.signature);
    expect(rectified.negativeSequences).toEqual([]);
    expect(rectified.score).toBeGreaterThan(result.original.score);
  });
});
