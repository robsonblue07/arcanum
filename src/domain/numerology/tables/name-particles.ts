/**
 * Partículas oficiais. Não carregam vibração ancestral e são
 * removidas antes de qualquer cálculo (Pitagórica e Cabalística).
 */
export const NAME_PARTICLES: readonly string[] = [
  'DA',
  'DE',
  'DO',
  'DAS',
  'DOS',
];

export function isNameParticle(word: string): boolean {
  const key = word
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toUpperCase();
  return NAME_PARTICLES.includes(key);
}

export function splitNameWords(fullName: string): string[] {
  return fullName
    .trim()
    .split(/[\s-]+/)
    .filter((word) => word.length > 0);
}
