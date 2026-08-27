import { calculatePythagoreanChart } from './pythagorean-chart';
import { buildKabbalisticTriangle } from './kabbalistic-triangle';
import { findNegativeSequences } from './negative-sequences';
import { calculateSynastry } from './synastry';
import { calculatePersonalCycles, readDailyOracle } from './oracle';

export { calculatePythagoreanChart } from './pythagorean-chart';
export { buildKabbalisticTriangle } from './kabbalistic-triangle';
export { findNegativeSequences } from './negative-sequences';
export { readTriangleCell } from './cell-reading';
export type { TriangleCellReading } from './cell-reading';
export { parseBirthDate } from './birth-date';
export {
  calculateSynastry,
  collectKabbalisticArcana,
  nameForKabbalisticArcana,
  COMPOUND_ARCANA_MIN,
  KABBALISTIC_ARCANA_MAX,
  KABBALISTIC_ARCANA_MIN,
} from './synastry';
export {
  calculatePersonalCycles,
  calculatePersonalDay,
  readDailyOracle,
  resolveLocalCalendarDate,
} from './oracle';
export type { DailyOracle, OracleToday, PersonalCycles } from './oracle';
export type {
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
} from './synastry';

export const numerologyEngines = {
  calculatePythagoreanChart,
  buildKabbalisticTriangle,
  findNegativeSequences,
  calculateSynastry,
  calculatePersonalCycles,
  readDailyOracle,
} as const;
