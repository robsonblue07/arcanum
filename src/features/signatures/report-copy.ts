import type { NegativeSequence, ReducedNumber, SignatureCandidate } from '../../domain/numerology';

const BLOCK_IMPACT: Readonly<Record<number, string>> = {
  1: 'O 111 trava a iniciativa: a firma grita no lugar de conduzir, e as portas se fecham por excesso de força.',
  2: 'O 222 paralisa a decisão. Contratos, relações e caminhos oscilam — a firma não escolhe um rumo.',
  3: 'O 333 dispersa a expressão. Ideias e talentos se espalham sem se materializar no Destino.',
  4: 'O 444 é o bloqueio clássico da matéria: dinheiro, casa e reconhecimento emperram no traço repetido.',
  5: 'O 555 inquieta o rumo. Mudanças começam e não se sustentam — a firma não encontra chão.',
  6: 'O 666 desequilibra o ninho. Família, dever e afeto pesam sobre a identidade escrita.',
  7: 'O 777 isola a busca. A sabedoria se fecha e a firma não conversa com o mundo.',
  8: 'O 888 trava o poder. Autoridade e recursos circulam em loop, sem colheita próspera.',
  9: 'O 999 impede o encerramento. Ciclos antigos não se fecham e a firma carrega o que já deveria partir.',
};

export function sequenceCodes(sequences: readonly NegativeSequence[]): string[] {
  return [...new Set(sequences.map((item) => String(item.digit).repeat(item.length)))];
}

export function blockageImpactLine(sequences: readonly NegativeSequence[]): string {
  if (sequences.length === 0) {
    return 'A firma atual não carrega sequência de bloqueio, mas ainda pode se alinhar com mais clareza ao Destino.';
  }

  const ranked = [...sequences].sort((left, right) => right.length - left.length);
  const primary = ranked[0];
  if (primary === undefined) {
    return 'Há um padrão repetido no triângulo que trava o fluxo da firma.';
  }

  const copy = BLOCK_IMPACT[primary.digit];
  if (copy !== undefined) {
    return copy;
  }
  return `A sequência ${String(primary.digit).repeat(primary.length)} trava o fluxo da firma e pede retificação.`;
}

export function reliefLine(candidate: SignatureCandidate): string {
  const destiny = formatDestiny(candidate.destinyNumber);
  if (candidate.negativeSequences.length === 0 && candidate.isHarmonicWithDestiny) {
    return `A firma ${candidate.signature} dissolve os bloqueios. O ápice ${candidate.triangle.apex} vibra com o Destino ${destiny} — o traço volta a subir.`;
  }
  if (candidate.negativeSequences.length === 0) {
    return `A firma ${candidate.signature} está livre de sequências negativas. O ápice ${candidate.triangle.apex} reabre o caminho da prosperidade.`;
  }
  return `A firma ${candidate.signature} suaviza o padrão atual. Treine o novo traço para selar o Destino ${destiny}.`;
}

function formatDestiny(value: ReducedNumber): string {
  return String(value);
}
