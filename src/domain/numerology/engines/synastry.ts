import { prepareNameForCalculation } from '../normalize';
import { MAJOR_ARCANA, reduceToSingleDigit } from '../tables/major-arcana';
import type {
  KabbalisticTriangle,
  NegativeSequence,
  ReducedNumber,
  SingleDigit,
} from '../types';
import { buildKabbalisticTriangle } from './kabbalistic-triangle';
import { findNegativeSequences } from './negative-sequences';
import { calculatePythagoreanChart } from './pythagorean-chart';

export interface SynastryPersonInput {
  readonly name: string;
  readonly birthDate: string;
}

export type DestinyHarmonyKind = 'harmonic' | 'neutral' | 'challenging';
export type ApexAlignmentKind = 'identical' | 'crossHarmonic' | 'resonant' | 'dissonant';
export type VibrationFamily = 'mental' | 'material' | 'creative';

export type AffinitySeal =
  | 'Aliança de Ouro no Amor'
  | 'Sociedade Próspera'
  | 'Ajuste Kármico';

export interface SynastryPersonSnapshot {
  readonly name: string;
  readonly normalizedName: string;
  readonly birthDate: string;
  readonly destinyNumber: ReducedNumber;
  readonly destinyDigit: SingleDigit;
  readonly expressionNumber: ReducedNumber;
  readonly soulNumber: ReducedNumber;
  readonly triangle: KabbalisticTriangle;
  readonly negativeSequences: readonly NegativeSequence[];
  readonly blockageDigits: readonly SingleDigit[];
  readonly isApexHarmonicWithDestiny: boolean;
}

export interface DestinyHarmony {
  readonly kind: DestinyHarmonyKind;
  readonly personA: ReducedNumber;
  readonly personB: ReducedNumber;
  readonly familyA: VibrationFamily;
  readonly familyB: VibrationFamily;
}

export interface ApexEncounter {
  readonly kind: ApexAlignmentKind;
  readonly apexA: number;
  readonly apexB: number;
  readonly aMatchesBDestiny: boolean;
  readonly bMatchesADestiny: boolean;
}

export interface NamedArcanum {
  readonly arcanaId: number;
  readonly namePt: string;
  readonly reducedDigit: SingleDigit;
}

/** Escala cabalística completa lida no Triângulo da Vida. */
export const KABBALISTIC_ARCANA_MIN = 1;
export const KABBALISTIC_ARCANA_MAX = 99;
/** 79–99: arcanos compostos / complementares. */
export const COMPOUND_ARCANA_MIN = 79;

export interface CrossedBlockage {
  readonly from: 'A' | 'B';
  readonly onto: 'A' | 'B';
  readonly digit: SingleDigit;
  readonly via: 'apex' | 'destiny';
}

export interface SynastryResult {
  readonly personA: SynastryPersonSnapshot;
  readonly personB: SynastryPersonSnapshot;
  readonly destinyHarmony: DestinyHarmony;
  readonly apexEncounter: ApexEncounter;
  readonly sharedArcana: readonly NamedArcanum[];
  readonly crossedArcana: readonly NamedArcanum[];
  readonly crossedBlockages: readonly CrossedBlockage[];
  readonly affinityScore: number;
  readonly seals: readonly AffinitySeal[];
  readonly synthesis: string;
}

type VibrationFamilyMap = Readonly<Record<SingleDigit, VibrationFamily>>;

const VIBRATION_FAMILY: VibrationFamilyMap = {
  1: 'mental',
  2: 'material',
  3: 'creative',
  4: 'material',
  5: 'mental',
  6: 'creative',
  7: 'mental',
  8: 'material',
  9: 'creative',
};

/** Pares clássicos de atrito (dígito menor-maior). */
const CHALLENGE_PAIRS: ReadonlySet<string> = new Set([
  '1-6',
  '1-8',
  '2-7',
  '3-4',
  '3-8',
  '4-5',
  '5-6',
]);

const HEART_DIGITS: ReadonlySet<SingleDigit> = new Set([2, 3, 6, 9]);
const MATERIAL_DIGITS: ReadonlySet<SingleDigit> = new Set([2, 4, 8]);

function pairKey(left: SingleDigit, right: SingleDigit): string {
  return left < right ? `${left}-${right}` : `${right}-${left}`;
}

function toDestinyDigit(value: ReducedNumber): SingleDigit {
  return reduceToSingleDigit(value);
}

function isApexHarmonicWithDestiny(apex: number, destinyNumber: ReducedNumber): boolean {
  if (apex === destinyNumber) {
    return true;
  }
  return apex === reduceToSingleDigit(destinyNumber);
}

function uniqueSortedDigits(values: readonly number[]): SingleDigit[] {
  const unique = new Set<SingleDigit>();
  for (const value of values) {
    if (value >= 1 && value <= 9 && Number.isInteger(value)) {
      unique.add(value as SingleDigit);
    }
  }
  return [...unique].sort((left, right) => left - right);
}

function snapshotOf(input: SynastryPersonInput): SynastryPersonSnapshot {
  const chart = calculatePythagoreanChart(input.name, input.birthDate);
  const triangle = buildKabbalisticTriangle(input.name);
  const negativeSequences = findNegativeSequences(triangle);
  const blockageDigits = uniqueSortedDigits(negativeSequences.map((item) => item.digit));

  return {
    name: input.name.trim(),
    normalizedName: chart.normalizedName,
    birthDate: chart.birthDate,
    destinyNumber: chart.destinyNumber,
    destinyDigit: toDestinyDigit(chart.destinyNumber),
    expressionNumber: chart.expressionNumber,
    soulNumber: chart.soulNumber,
    triangle,
    negativeSequences,
    blockageDigits,
    isApexHarmonicWithDestiny: isApexHarmonicWithDestiny(triangle.apex, chart.destinyNumber),
  };
}

function classifyDestiny(personA: SynastryPersonSnapshot, personB: SynastryPersonSnapshot): DestinyHarmony {
  const familyA = VIBRATION_FAMILY[personA.destinyDigit];
  const familyB = VIBRATION_FAMILY[personB.destinyDigit];
  const sameFamily = familyA === familyB;
  const challenging = CHALLENGE_PAIRS.has(pairKey(personA.destinyDigit, personB.destinyDigit));

  let kind: DestinyHarmonyKind = 'neutral';
  if (sameFamily) {
    kind = 'harmonic';
  } else if (challenging) {
    kind = 'challenging';
  }

  return {
    kind,
    personA: personA.destinyNumber,
    personB: personB.destinyNumber,
    familyA,
    familyB,
  };
}

function classifyApex(personA: SynastryPersonSnapshot, personB: SynastryPersonSnapshot): ApexEncounter {
  const apexA = personA.triangle.apex;
  const apexB = personB.triangle.apex;
  const aMatchesBDestiny = apexA === personB.destinyDigit || apexA === personB.destinyNumber;
  const bMatchesADestiny = apexB === personA.destinyDigit || apexB === personA.destinyNumber;
  const sameFamily =
    apexA >= 1 &&
    apexA <= 9 &&
    apexB >= 1 &&
    apexB <= 9 &&
    VIBRATION_FAMILY[apexA as SingleDigit] === VIBRATION_FAMILY[apexB as SingleDigit];

  let kind: ApexAlignmentKind = 'dissonant';
  if (apexA === apexB) {
    kind = 'identical';
  } else if (aMatchesBDestiny || bMatchesADestiny) {
    kind = 'crossHarmonic';
  } else if (sameFamily) {
    kind = 'resonant';
  }

  return {
    kind,
    apexA,
    apexB,
    aMatchesBDestiny,
    bMatchesADestiny,
  };
}

export function nameForKabbalisticArcana(id: number): string {
  if (id >= COMPOUND_ARCANA_MIN && id <= KABBALISTIC_ARCANA_MAX) {
    return `Arcano ${id} (composto)`;
  }
  if (id === 22) {
    return MAJOR_ARCANA[0]?.namePt ?? 'O Louco';
  }
  return MAJOR_ARCANA[id]?.namePt ?? `Arcano ${id}`;
}

function inKabbalisticScale(id: number): boolean {
  return Number.isInteger(id) && id >= KABBALISTIC_ARCANA_MIN && id <= KABBALISTIC_ARCANA_MAX;
}

function uniqueArcana(items: readonly NamedArcanum[]): NamedArcanum[] {
  const byId = new Map<number, NamedArcanum>();
  for (const item of items) {
    if (!inKabbalisticScale(item.arcanaId) || byId.has(item.arcanaId)) {
      continue;
    }
    byId.set(item.arcanaId, item);
  }
  return [...byId.values()].sort((left, right) => left.arcanaId - right.arcanaId);
}

/**
 * Varre o Triângulo da Vida na escala 1–99:
 * células (1–9), pares adjacentes concatenados (11–99) e somas
 * já registradas como arcanos maiores (10–22, com 22 = O Louco).
 * 79–99 entram como arcanos compostos/complementares.
 */
export function collectKabbalisticArcana(triangle: KabbalisticTriangle): NamedArcanum[] {
  const collected: NamedArcanum[] = [];

  const add = (id: number, reducedDigit: SingleDigit): void => {
    if (!inKabbalisticScale(id)) {
      return;
    }
    collected.push({
      arcanaId: id,
      namePt: nameForKabbalisticArcana(id),
      reducedDigit,
    });
  };

  for (const row of triangle.rows) {
    for (let index = 0; index < row.length; index += 1) {
      const cell = row[index];
      if (cell === undefined) {
        continue;
      }
      add(cell, reduceToSingleDigit(cell));

      const neighbour = row[index + 1];
      if (neighbour === undefined) {
        continue;
      }
      const concatenated = cell * 10 + neighbour;
      add(concatenated, reduceToSingleDigit(concatenated));
    }
  }

  for (const hit of triangle.arcanumHits) {
    const id = hit.arcanaId === 0 ? 22 : hit.arcanaId;
    add(id, hit.reducedDigit);
  }

  return uniqueArcana(collected);
}

function sharedArcanaOf(
  personA: SynastryPersonSnapshot,
  personB: SynastryPersonSnapshot,
): NamedArcanum[] {
  const catalogA = collectKabbalisticArcana(personA.triangle);
  const idsB = new Set(collectKabbalisticArcana(personB.triangle).map((item) => item.arcanaId));
  return uniqueArcana(catalogA.filter((item) => idsB.has(item.arcanaId)));
}

function crossedArcanaOf(
  personA: SynastryPersonSnapshot,
  personB: SynastryPersonSnapshot,
): NamedArcanum[] {
  const fromA = collectKabbalisticArcana(personA.triangle).filter((item) =>
    personB.blockageDigits.includes(item.reducedDigit),
  );
  const fromB = collectKabbalisticArcana(personB.triangle).filter((item) =>
    personA.blockageDigits.includes(item.reducedDigit),
  );
  return uniqueArcana([...fromA, ...fromB]);
}

function blockageHits(
  source: SynastryPersonSnapshot,
  target: SynastryPersonSnapshot,
  from: 'A' | 'B',
  onto: 'A' | 'B',
): CrossedBlockage[] {
  const hits: CrossedBlockage[] = [];
  const apexDigit =
    source.triangle.apex >= 1 && source.triangle.apex <= 9
      ? (source.triangle.apex as SingleDigit)
      : null;

  if (apexDigit !== null && target.blockageDigits.includes(apexDigit)) {
    hits.push({ from, onto, digit: apexDigit, via: 'apex' });
  }
  if (target.blockageDigits.includes(source.destinyDigit)) {
    const already = hits.some((item) => item.digit === source.destinyDigit && item.via === 'destiny');
    if (!already) {
      hits.push({ from, onto, digit: source.destinyDigit, via: 'destiny' });
    }
  }
  return hits;
}

function uniqueBlockages(items: readonly CrossedBlockage[]): CrossedBlockage[] {
  const seen = new Set<string>();
  const unique: CrossedBlockage[] = [];
  for (const item of items) {
    const key = `${item.from}:${item.onto}:${item.digit}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    unique.push(item);
  }
  return unique;
}

function crossedBlockagesOf(
  personA: SynastryPersonSnapshot,
  personB: SynastryPersonSnapshot,
): CrossedBlockage[] {
  return uniqueBlockages([
    ...blockageHits(personA, personB, 'A', 'B'),
    ...blockageHits(personB, personA, 'B', 'A'),
  ]);
}

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function scoreAffinity(
  destiny: DestinyHarmony,
  apex: ApexEncounter,
  personA: SynastryPersonSnapshot,
  personB: SynastryPersonSnapshot,
  sharedCount: number,
  crossedCount: number,
): number {
  let score = 36;

  if (destiny.kind === 'harmonic') {
    score += 30;
  } else if (destiny.kind === 'neutral') {
    score += 14;
  } else {
    score += 2;
  }

  if (personA.destinyNumber === personB.destinyNumber) {
    score += 8;
  }

  if (apex.kind === 'identical') {
    score += 14;
  } else if (apex.kind === 'crossHarmonic') {
    score += 10;
  } else if (apex.kind === 'resonant') {
    score += 8;
  }

  if (personA.isApexHarmonicWithDestiny) {
    score += 5;
  }
  if (personB.isApexHarmonicWithDestiny) {
    score += 5;
  }

  score += Math.min(12, sharedCount * 3);
  score -= crossedCount * 14;

  const aClean = personA.negativeSequences.length === 0;
  const bClean = personB.negativeSequences.length === 0;
  if (aClean && bClean) {
    score += 6;
  } else if (!aClean && !bClean) {
    score -= 4;
  }

  return clampScore(score);
}

function selectSeals(
  destiny: DestinyHarmony,
  apex: ApexEncounter,
  personA: SynastryPersonSnapshot,
  personB: SynastryPersonSnapshot,
  crossedCount: number,
  affinityScore: number,
): AffinitySeal[] {
  const seals: AffinitySeal[] = [];
  const karmic = destiny.kind === 'challenging' || crossedCount > 0;
  const heart =
    HEART_DIGITS.has(personA.destinyDigit) || HEART_DIGITS.has(personB.destinyDigit);
  const material =
    MATERIAL_DIGITS.has(personA.destinyDigit) || MATERIAL_DIGITS.has(personB.destinyDigit);

  if (karmic) {
    seals.push('Ajuste Kármico');
  }

  if (destiny.kind === 'harmonic' && heart && affinityScore >= 68 && crossedCount === 0) {
    seals.push('Aliança de Ouro no Amor');
  }

  if (
    (destiny.kind === 'harmonic' || apex.kind === 'identical') &&
    material &&
    affinityScore >= 62
  ) {
    seals.push('Sociedade Próspera');
  }

  if (seals.length === 0) {
    if (affinityScore >= 70) {
      seals.push('Aliança de Ouro no Amor');
    } else if (affinityScore >= 50) {
      seals.push('Sociedade Próspera');
    } else {
      seals.push('Ajuste Kármico');
    }
  }

  return seals;
}

function givenName(snapshot: SynastryPersonSnapshot): string {
  const prepared = prepareNameForCalculation(snapshot.name);
  const first = prepared.split(/\s+/)[0];
  return first ?? snapshot.name;
}

function destinyKindPhrase(kind: DestinyHarmonyKind): string {
  if (kind === 'harmonic') {
    return 'caminhos afins: a mesma família vibratória reconhece o outro';
  }
  if (kind === 'challenging') {
    return 'caminhos desafiadores: o par se encontra para ajustar o que o Destino ainda não resolveu sozinho';
  }
  return 'caminhos neutros: há espaço para construir, sem o ímã automático nem o atrito imediato';
}

function apexPhrase(apex: ApexEncounter): string {
  if (apex.kind === 'identical') {
    return `Os ápices coincidem em ${apex.apexA}: as firmas falam a mesma nota no topo da pirâmide.`;
  }
  if (apex.kind === 'crossHarmonic') {
    return `Os ápices ${apex.apexA} e ${apex.apexB} se cruzam com o Destino do outro — um nome acende a missão alheia.`;
  }
  if (apex.kind === 'resonant') {
    return `Os ápices ${apex.apexA} e ${apex.apexB} ressoam na mesma família, ainda que não sejam idênticos.`;
  }
  return `Os ápices ${apex.apexA} e ${apex.apexB} pedem escuta: as pirâmides não se sobrepõem, e a aliança exige tradução.`;
}

function composeSharedArcanaLine(shared: readonly NamedArcanum[]): string {
  if (shared.length === 0) {
    return ' Na escala dos 99 Arcanos Cabalísticos, cada triângulo guarda chaves próprias; o diálogo nasce da diferença.';
  }

  const compound = shared.filter((item) => item.arcanaId >= COMPOUND_ARCANA_MIN);
  const highlight =
    compound.length > 0
      ? compound.slice(0, 3).map((item) => item.namePt).join(', ')
      : shared.slice(0, 3).map((item) => item.namePt).join(', ');

  return (
    ` A leitura dos 99 Arcanos Cabalísticos revela ${shared.length} arcanos em comum` +
    (highlight.length > 0 ? `, entre eles ${highlight}` : '') +
    '.'
  );
}

function composeSynthesis(
  personA: SynastryPersonSnapshot,
  personB: SynastryPersonSnapshot,
  destiny: DestinyHarmony,
  apex: ApexEncounter,
  shared: readonly NamedArcanum[],
  crossedBlockages: readonly CrossedBlockage[],
  seals: readonly AffinitySeal[],
  affinityScore: number,
): string {
  const nameA = givenName(personA);
  const nameB = givenName(personB);
  const sharedLine = composeSharedArcanaLine(shared);
  const blockLine =
    crossedBlockages.length > 0
      ? ' Um nome acende bloqueio no triângulo do outro: a aliança pede consciência onde a firma ainda repete o traço.'
      : ' Nenhum nome acende sequência de bloqueio no outro — o cruzamento está limpo neste eixo.';
  const sealLine = seals[0] ?? 'Aliança de Ouro no Amor';

  return (
    `No cruzamento de ${nameA} e ${nameB}, os Destinos ${personA.destinyNumber} e ${personB.destinyNumber} ` +
    `revelam ${destinyKindPhrase(destiny.kind)}. ${apexPhrase(apex)}${sharedLine}${blockLine} ` +
    `A afinidade deste par vibra em ${affinityScore}% — o selo que preside a leitura é ${sealLine}.`
  );
}

/**
 * Sinastria cabalística: cruza mapa Pitagórico (Destino) e Triângulo da Vida
 * (ápice, arcanos, sequências) de dois nomes. Função pura — sem I/O.
 */
export function calculateSynastry(
  personA: SynastryPersonInput,
  personB: SynastryPersonInput,
): SynastryResult {
  const snapshotA = snapshotOf(personA);
  const snapshotB = snapshotOf(personB);
  const destinyHarmony = classifyDestiny(snapshotA, snapshotB);
  const apexEncounter = classifyApex(snapshotA, snapshotB);
  const sharedArcana = sharedArcanaOf(snapshotA, snapshotB);
  const crossedArcana = crossedArcanaOf(snapshotA, snapshotB);
  const crossedBlockages = crossedBlockagesOf(snapshotA, snapshotB);
  const affinityScore = scoreAffinity(
    destinyHarmony,
    apexEncounter,
    snapshotA,
    snapshotB,
    sharedArcana.length,
    crossedBlockages.length,
  );
  const seals = selectSeals(
    destinyHarmony,
    apexEncounter,
    snapshotA,
    snapshotB,
    crossedBlockages.length,
    affinityScore,
  );
  const synthesis = composeSynthesis(
    snapshotA,
    snapshotB,
    destinyHarmony,
    apexEncounter,
    sharedArcana,
    crossedBlockages,
    seals,
    affinityScore,
  );

  return {
    personA: snapshotA,
    personB: snapshotB,
    destinyHarmony,
    apexEncounter,
    sharedArcana,
    crossedArcana,
    crossedBlockages,
    affinityScore,
    seals,
    synthesis,
  };
}
