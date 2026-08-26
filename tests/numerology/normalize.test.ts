import {
  extractLetters,
  stripNameParticles,
  prepareNameForCalculation,
  nameToPythagoreanMap,
  nameToKabbalisticDigits,
} from '../../src/domain/numerology';
import { MARIA_DA_SILVA, MARIA_SILVA } from './fixtures';

describe('normalize — partículas oficiais', () => {
  it('remove da, de, do, das, dos antes do cálculo', () => {
    expect(stripNameParticles('Maria da Silva')).toBe('Maria Silva');
    expect(stripNameParticles('João de Souza')).toBe('João Souza');
    expect(stripNameParticles('Ana do Carmo')).toBe('Ana Carmo');
    expect(stripNameParticles('Lucas das Neves')).toBe('Lucas Neves');
    expect(stripNameParticles('Helena dos Santos')).toBe('Helena Santos');
  });

  it('remove partículas em qualquer capitalização', () => {
    expect(prepareNameForCalculation('MARIA DA SILVA')).toBe('MARIA SILVA');
    expect(stripNameParticles('Maria DA Silva')).toBe('Maria Silva');
  });

  it('processa "Maria da Silva" exatamente como "Maria Silva"', () => {
    expect(extractLetters(MARIA_DA_SILVA).join('')).toBe('MARIASILVA');
    expect(extractLetters(MARIA_SILVA).join('')).toBe('MARIASILVA');
    expect(nameToPythagoreanMap(MARIA_DA_SILVA)).toEqual(nameToPythagoreanMap(MARIA_SILVA));
    expect(nameToKabbalisticDigits(MARIA_DA_SILVA)).toEqual(nameToKabbalisticDigits(MARIA_SILVA));
  });

  it('remove múltiplas partículas no mesmo nome', () => {
    expect(extractLetters('Maria de Souza dos Santos').join('')).toBe('MARIASOUZASANTOS');
  });

  it('não remove a conjunção "e", que está fora da lista oficial', () => {
    expect(stripNameParticles('Maria e Silva')).toBe('Maria e Silva');
  });

  it('normaliza acentos antes de converter letras', () => {
    expect(extractLetters('José Araújo').join('')).toBe('JOSEARAUJO');
    expect(extractLetters('Inês Çunha').join('')).toBe('INESCUNHA');
  });
});
