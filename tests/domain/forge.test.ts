import {
  buildKabbalisticTriangle,
  findNegativeSequences,
  generateGoldenNames,
} from '../../src/domain/numerology';
import { MARIA_SILVA } from '../numerology/fixtures';

function assertGold(names: ReturnType<typeof generateGoldenNames>): void {
  expect(names.length).toBeLessThanOrEqual(5);
  for (const item of names) {
    expect(item.possui_bloqueio).toBe(false);
    const triangle = buildKabbalisticTriangle(item.name);
    expect(findNegativeSequences(triangle)).toEqual([]);
    expect(item.apex).toBe(triangle.apex);
  }
}

describe('generateGoldenNames', () => {
  it('no modo baby nunca devolve combinação com bloqueio 111–999', () => {
    const names = generateGoldenNames({
      type: 'baby',
      baseWords: ['Maria', 'Silva', 'Costa'],
    });

    assertGold(names);
    expect(names.every((item) => item.kind === 'baby')).toBe(true);

    const blockedLetters = buildKabbalisticTriangle(MARIA_SILVA).letters.join('');
    expect(findNegativeSequences(buildKabbalisticTriangle(MARIA_SILVA)).length).toBeGreaterThan(0);
    expect(
      names.some((item) => buildKabbalisticTriangle(item.name).letters.join('') === blockedLetters),
    ).toBe(false);
  });

  it('no modo business forja marcas limpas a partir de palavras-chave', () => {
    const names = generateGoldenNames({
      type: 'business',
      baseWords: ['Luz', 'Sol', 'Ouro'],
    });

    assertGold(names);
    expect(names.length).toBeGreaterThan(0);
    expect(names.every((item) => item.kind === 'business')).toBe(true);
    expect(names.every((item) => !item.name.toLowerCase().includes(' de '))).toBe(true);
  });

  it('prioriza ápice harmônico com o Destino-alvo quando informado', () => {
    const names = generateGoldenNames({
      type: 'baby',
      baseWords: ['Ana', 'Lia'],
      targetDestiny: 3,
    });

    assertGold(names);
    expect(names.length).toBeGreaterThan(0);
    const first = names[0];
    expect(first).toBeDefined();
    if (first === undefined) {
      return;
    }
    expect(first.isHarmonicWithDestiny).toBe(true);
    expect(first.apex).toBe(3);
  });

  it('rejeita lista sem letras significativas', () => {
    expect(() =>
      generateGoldenNames({
        type: 'business',
        baseWords: ['de', '---', 'da'],
      }),
    ).toThrow();
  });
});
