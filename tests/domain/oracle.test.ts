import {
  calculatePersonalCycles,
  lookupOracleEntry,
  ORACLE_DICTIONARY,
  readDailyOracle,
} from '../../src/domain/numerology';
import { MARIA_BIRTH_DATE } from '../numerology/fixtures';

const AUGUST_26_2026 = { year: 2026, month: 8, day: 26, iso: '2026-08-26' } as const;
const JANUARY_3_2026 = { year: 2026, month: 1, day: 3, iso: '2026-01-03' } as const;
const NOVEMBER_11_2004 = { year: 2004, month: 11, day: 11, iso: '2004-11-11' } as const;

describe('calculatePersonalCycles', () => {
  it('calcula Ano 6, Mês 5 e Dia 4 para Maria em 26/08/2026', () => {
    const cycles = calculatePersonalCycles(MARIA_BIRTH_DATE, AUGUST_26_2026);

    expect(cycles.personalYear).toBe(6);
    expect(cycles.personalMonth).toBe(5);
    expect(cycles.personalDay).toBe(4);
    expect(cycles.calendarDate.iso).toBe('2026-08-26');
  });

  it('calcula Dia Pessoal 1 em uma data conhecida', () => {
    const cycles = calculatePersonalCycles(MARIA_BIRTH_DATE, JANUARY_3_2026);

    expect(cycles.personalYear).toBe(6);
    expect(cycles.personalMonth).toBe(7);
    expect(cycles.personalDay).toBe(1);
  });

  it('reduz o Dia Pessoal a 1–9 mesmo com mestres no Ano e no Mês', () => {
    const cycles = calculatePersonalCycles(MARIA_BIRTH_DATE, NOVEMBER_11_2004);

    expect(cycles.personalYear).toBe(11);
    expect(cycles.personalMonth).toBe(22);
    expect(cycles.personalDay).toBe(6);
  });
});

describe('ORACLE_DICTIONARY', () => {
  it('cobre os dias 1 a 9 com título, resumo, conselho e o que evitar', () => {
    for (const day of [1, 2, 3, 4, 5, 6, 7, 8, 9] as const) {
      const entry = lookupOracleEntry(day);
      expect(entry.day).toBe(day);
      expect(entry).toBe(ORACLE_DICTIONARY[day]);
      expect(entry.title.length).toBeGreaterThan(0);
      expect(entry.summary.length).toBeGreaterThan(0);
      expect(entry.counsel.length).toBeGreaterThan(entry.summary.length);
      expect(entry.avoid.length).toBeGreaterThan(0);
    }
  });

  it('devolve o texto do Dia 4 (oficina / evitar gastos) para a data âncora', () => {
    const reading = readDailyOracle(MARIA_BIRTH_DATE, AUGUST_26_2026);

    expect(reading.entry.day).toBe(4);
    expect(reading.entry.title).toBe('A Oficina');
    expect(reading.entry.summary).toMatch(/trabalho duro/i);
    expect(reading.entry.avoid).toMatch(/gastos/i);
    expect(reading.cycles.personalDay).toBe(4);
  });

  it('devolve o texto do Dia 1 (plantio / iniciativa)', () => {
    const reading = readDailyOracle(MARIA_BIRTH_DATE, JANUARY_3_2026);

    expect(reading.entry.day).toBe(1);
    expect(reading.entry.title).toBe('O Plantio');
    expect(reading.entry.summary).toMatch(/iniciativa/i);
    expect(reading.entry.counsel).toMatch(/semente|comece/i);
  });
});
