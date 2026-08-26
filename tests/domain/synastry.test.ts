import {
  buildKabbalisticTriangle,
  calculatePythagoreanChart,
  calculateSynastry,
  collectKabbalisticArcana,
  COMPOUND_ARCANA_MIN,
  KABBALISTIC_ARCANA_MAX,
  KABBALISTIC_ARCANA_MIN,
} from '../../src/domain/numerology';
import { MARIA_BIRTH_DATE, MARIA_DA_SILVA, MARIA_SILVA } from '../numerology/fixtures';

const ANA = {
  name: 'Ana Clara Souza',
  birthDate: '1990-01-01',
} as const;

const PEDRO = {
  name: 'Pedro Henrique Costa',
  birthDate: '1990-08-01',
} as const;

describe('calculateSynastry', () => {
  it('cruza dois perfis harmônicos (família 3–6–9)', () => {
    const maria = calculatePythagoreanChart(MARIA_DA_SILVA, MARIA_BIRTH_DATE);
    const ana = calculatePythagoreanChart(ANA.name, ANA.birthDate);

    expect(maria.destinyNumber).toBe(6);
    expect(ana.destinyNumber).toBe(3);

    const result = calculateSynastry(
      { name: MARIA_DA_SILVA, birthDate: MARIA_BIRTH_DATE },
      ANA,
    );

    expect(result.destinyHarmony.kind).toBe('harmonic');
    expect(result.destinyHarmony.familyA).toBe('creative');
    expect(result.destinyHarmony.familyB).toBe('creative');
    expect(result.affinityScore).toBeGreaterThanOrEqual(60);
    expect(result.affinityScore).toBeLessThanOrEqual(100);
    expect(result.seals.length).toBeGreaterThan(0);
    expect(result.synthesis).toMatch(/Maria/);
    expect(result.synthesis).toMatch(/Ana/);
    expect(result.synthesis).toMatch(new RegExp(`${result.affinityScore}%`));
    expect(result.personA.triangle.apex).toBeGreaterThan(0);
    expect(result.personB.triangle.apex).toBeGreaterThan(0);
    expectArcanaScale(result.sharedArcana);
    expectArcanaScale(result.crossedArcana);
  });

  it('detecta atrito kármico entre Destinos 6 e 1', () => {
    const maria = calculatePythagoreanChart(MARIA_DA_SILVA, MARIA_BIRTH_DATE);
    const pedro = calculatePythagoreanChart(PEDRO.name, PEDRO.birthDate);

    expect(maria.destinyNumber).toBe(6);
    expect(pedro.destinyNumber).toBe(1);

    const result = calculateSynastry(
      { name: MARIA_DA_SILVA, birthDate: MARIA_BIRTH_DATE },
      PEDRO,
    );

    expect(result.destinyHarmony.kind).toBe('challenging');
    expect(result.seals).toContain('Ajuste Kármico');
    expect(result.affinityScore).toBeLessThan(80);
    expect(result.synthesis).toMatch(/desafiadores/);
    expectArcanaScale(result.sharedArcana);
    expectArcanaScale(result.crossedArcana);
  });

  it('o par harmônico pontua acima do par com atrito, com os mesmos nomes de âncora', () => {
    const harmonic = calculateSynastry(
      { name: MARIA_DA_SILVA, birthDate: MARIA_BIRTH_DATE },
      ANA,
    );
    const karmic = calculateSynastry(
      { name: MARIA_DA_SILVA, birthDate: MARIA_BIRTH_DATE },
      PEDRO,
    );

    expect(harmonic.affinityScore).toBeGreaterThan(karmic.affinityScore);
  });

  it('trata nomes compostos, partículas e caracteres especiais como o nome despojado', () => {
    const withOrnament = calculateSynastry(
      { name: 'María da Silva', birthDate: MARIA_BIRTH_DATE },
      { name: 'José de Souza', birthDate: ANA.birthDate },
    );
    const stripped = calculateSynastry(
      { name: MARIA_SILVA, birthDate: MARIA_BIRTH_DATE },
      { name: 'Jose Souza', birthDate: ANA.birthDate },
    );

    expect(withOrnament.personA.triangle.letters).toEqual(stripped.personA.triangle.letters);
    expect(withOrnament.personB.triangle.letters).toEqual(stripped.personB.triangle.letters);
    expect(withOrnament.personA.destinyNumber).toBe(stripped.personA.destinyNumber);
    expect(withOrnament.personB.destinyNumber).toBe(stripped.personB.destinyNumber);
    expect(withOrnament.personA.triangle.apex).toBe(stripped.personA.triangle.apex);
    expect(withOrnament.personB.triangle.apex).toBe(stripped.personB.triangle.apex);
    expect(withOrnament.affinityScore).toBe(stripped.affinityScore);
    expect(withOrnament.destinyHarmony.kind).toBe(stripped.destinyHarmony.kind);
    expect(withOrnament.sharedArcana.map((item) => item.arcanaId)).toEqual(
      stripped.sharedArcana.map((item) => item.arcanaId),
    );
  });

  it('varre os 99 Arcanos Cabalísticos, inclusive compostos 79–99', () => {
    const triangle = buildKabbalisticTriangle(MARIA_DA_SILVA);
    const catalog = collectKabbalisticArcana(triangle);
    const ids = catalog.map((item) => item.arcanaId);

    expect(ids).toEqual([...ids].sort((left, right) => left - right));
    expect(ids.every((id) => id >= KABBALISTIC_ARCANA_MIN && id <= KABBALISTIC_ARCANA_MAX)).toBe(
      true,
    );
    expect(ids).toContain(4);
    expect(ids).toContain(41);
    expect(ids).toContain(97);
    expect(ids.some((id) => id >= COMPOUND_ARCANA_MIN)).toBe(true);

    const mirror = calculateSynastry(
      { name: MARIA_DA_SILVA, birthDate: MARIA_BIRTH_DATE },
      { name: MARIA_DA_SILVA, birthDate: MARIA_BIRTH_DATE },
    );
    expect(mirror.sharedArcana.map((item) => item.arcanaId)).toEqual(ids);
    expect(mirror.synthesis).toMatch(/99 Arcanos Cabalísticos/);
  });

  it('rejeita nome sem letras significativas', () => {
    expect(() =>
      calculateSynastry(
        { name: '---', birthDate: MARIA_BIRTH_DATE },
        ANA,
      ),
    ).toThrow();
  });
});

function expectArcanaScale(items: readonly { arcanaId: number }[]): void {
  for (const item of items) {
    expect(item.arcanaId).toBeGreaterThanOrEqual(KABBALISTIC_ARCANA_MIN);
    expect(item.arcanaId).toBeLessThanOrEqual(KABBALISTIC_ARCANA_MAX);
  }
}
