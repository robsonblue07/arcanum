/**
 * Arcanum — domínio de numerologia.
 *
 * Arquitetura híbrida:
 *   - Pitagórica: mapa de personalidade (Alma, Aparência, Expressão, Destino, Lições Cármicas).
 *   - Cabalística: motor de harmonização — Gematria 1–8, Triângulo da Vida,
 *     arcanos, sequências negativas e retificação de assinatura.
 *
 * Este módulo é TypeScript puro. Nenhuma dependência de React Native, Expo ou I/O.
 */

export type {
  PythagoreanDigit,
  KabbalisticDigit,
  SingleDigit,
  MasterNumber,
  ReducedNumber,
  SequenceAxis,
  LetterConversion,
  PythagoreanChart,
  ArcanumHit,
  TriangleCell,
  NegativeSequence,
  KabbalisticTriangle,
  SignatureCandidate,
  OptimizedSignaturesResult,
  KabbalisticConvertOptions,
  SignatureGenerationOptions,
} from './types';

export {
  stripDiacritics,
  normalizeLetter,
  stripNameParticles,
  prepareNameForCalculation,
  extractLetters,
  extractLetterTokens,
} from './normalize';

export {
  reducePreservingMasters,
  isMasterNumber,
  digitSum,
  MASTER_NUMBERS,
} from './reduce';

export {
  PYTHAGOREAN_TABLE,
  PYTHAGOREAN_VOWELS,
  PYTHAGOREAN_SEMIVOWELS,
  isPythagoreanVowel,
  letterToPythagorean,
  nameToPythagoreanMap,
  KABBALISTIC_TABLE,
  KABBALISTIC_MAX_LETTER_VALUE,
  letterToKabbalistic,
  nameToKabbalisticMap,
  nameToKabbalisticDigits,
  MAJOR_ARCANA,
  reduceToSingleDigit,
  arcanaFromSum,
  ARCANA_MEANINGS,
  meaningForArcana,
  formatArcanaTitle,
  NAME_PARTICLES,
  isNameParticle,
  splitNameWords,
  ORACLE_DICTIONARY,
  lookupOracleEntry,
} from './tables';

export type { MajorArcana, ArcanaMeaning, OracleEntry } from './tables';

export {
  calculatePythagoreanChart,
  buildKabbalisticTriangle,
  findNegativeSequences,
  readTriangleCell,
  parseBirthDate,
  calculateSynastry,
  collectKabbalisticArcana,
  nameForKabbalisticArcana,
  COMPOUND_ARCANA_MIN,
  KABBALISTIC_ARCANA_MAX,
  KABBALISTIC_ARCANA_MIN,
  calculatePersonalCycles,
  calculatePersonalDay,
  readDailyOracle,
  resolveLocalCalendarDate,
} from './engines';

export type {
  TriangleCellReading,
  AffinitySeal,
  ApexAlignmentKind,
  ApexEncounter,
  CrossedBlockage,
  DestinyHarmony,
  DestinyHarmonyKind,
  NamedArcanum,
  SynastryPersonInput,
  SynastryPersonSnapshot,
  SynastryResult,
  VibrationFamily,
  DailyOracle,
  OracleToday,
  PersonalCycles,
} from './engines';

export { generateOptimizedSignatures, selectRectifiedSignature } from './generators';
