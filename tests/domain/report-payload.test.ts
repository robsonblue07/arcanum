import {
  buildCanonicalReportPayload,
  calculatePythagoreanChart,
  collectKabbalisticArcana,
  generateOptimizedSignatures,
  readDailyOracle,
  selectRectifiedSignature,
} from '../../src/domain/numerology';
import { MARIA_BIRTH_DATE, MARIA_DA_SILVA, MARIA_SILVA_TRIANGLE_ROWS } from '../numerology/fixtures';

const AUGUST_26_2026 = { year: 2026, month: 8, day: 26, iso: '2026-08-26' } as const;

describe('buildCanonicalReportPayload', () => {
  const signatures = generateOptimizedSignatures(MARIA_DA_SILVA, MARIA_BIRTH_DATE);
  const oracle = readDailyOracle(MARIA_BIRTH_DATE, AUGUST_26_2026);
  const chart = calculatePythagoreanChart(MARIA_DA_SILVA, MARIA_BIRTH_DATE);
  const payload = buildCanonicalReportPayload(
    { fullName: MARIA_DA_SILVA, birthDate: MARIA_BIRTH_DATE },
    signatures,
    oracle,
  );

  it('projeta Destino, Missão e ápice exatamente como os motores', () => {
    expect(payload.schemaVersion).toBe(1);
    expect(payload.person.fullName).toBe(MARIA_DA_SILVA);
    expect(payload.person.birthDate).toBe(MARIA_BIRTH_DATE);
    expect(payload.triad.destiny).toBe(chart.destinyNumber);
    expect(payload.triad.destiny).toBe(6);
    expect(payload.triad.mission).toBe(chart.expressionNumber);
    expect(payload.triad.soul).toBe(chart.soulNumber);
    expect(payload.triad.apex).toBe(signatures.original.triangle.apex);
    expect(payload.triad.apex).toBe(2);
    expect(payload.triad.destiny).toBe(signatures.original.destinyNumber);
  });

  it('preserva a pirâmide, os 99 arcanos e os bloqueios 111–999 sem corrupção', () => {
    expect(payload.pyramid.rows).toEqual(MARIA_SILVA_TRIANGLE_ROWS);
    expect(payload.pyramid.apex).toBe(2);
    expect(payload.pyramid.blockageCodes).toContain('444');
    expect(payload.pyramid.blockages.some((item) => item.digit === 4 && item.length === 3)).toBe(
      true,
    );

    const catalogIds = collectKabbalisticArcana(signatures.original.triangle).map(
      (item) => item.arcanaId,
    );
    expect(payload.pyramid.arcana.map((item) => item.id)).toEqual(catalogIds);
    expect(payload.pyramid.arcana.every((item) => item.id >= 1 && item.id <= 99)).toBe(true);
    expect(payload.pyramid.arcana.some((item) => item.id === 97)).toBe(true);
  });

  it('espelha a firma original e a retificada dos geradores', () => {
    const rectified = selectRectifiedSignature(signatures);

    expect(payload.originalSignature.signature).toBe(signatures.original.signature);
    expect(payload.originalSignature.apex).toBe(signatures.original.triangle.apex);
    expect(payload.originalSignature.score).toBe(signatures.original.score);
    expect(payload.rectifiedSignature.signature).toBe(rectified.signature);
    expect(payload.rectifiedSignature.apex).toBe(rectified.triangle.apex);
    expect(payload.rectifiedSignature.blockageCodes).toEqual([]);
    expect(payload.rectifiedSignature.signature).not.toBe(payload.originalSignature.signature);
  });

  it('carrega o oráculo canônico e não inventa o Dia Pessoal', () => {
    expect(payload.oracle.personalDay).toBe(oracle.cycles.personalDay);
    expect(payload.oracle.personalDay).toBe(4);
    expect(payload.oracle.personalYear).toBe(oracle.cycles.personalYear);
    expect(payload.oracle.title).toBe(oracle.entry.title);
    expect(payload.synastry).toBeNull();
  });

  it('copia a sinastria opcional sem alterar o score', () => {
    const withSynastry = buildCanonicalReportPayload(
      { fullName: MARIA_DA_SILVA, birthDate: MARIA_BIRTH_DATE },
      signatures,
      oracle,
      {
        partnerName: 'Ana Clara Souza',
        partnerBirthDate: '1990-01-01',
        affinityScore: 74,
        destinyHarmony: 'harmonic',
        seals: ['Aliança de Ouro no Amor'],
        sharedArcanaIds: [13, 97],
      },
    );

    expect(withSynastry.synastry?.affinityScore).toBe(74);
    expect(withSynastry.synastry?.sharedArcanaIds).toEqual([13, 97]);
    expect(withSynastry.triad.destiny).toBe(payload.triad.destiny);
    expect(withSynastry.pyramid.apex).toBe(payload.pyramid.apex);
  });
});
