import { calculatePersonalDay as calculatePersonalDayFromDomain } from '../domain/numerology/engines/oracle';

/** Fachada local: o motor vive no domínio. Usa o fuso do aparelho. */
export function calculatePersonalDay(
  birthDate: string,
  today: Date = new Date(),
): ReturnType<typeof calculatePersonalDayFromDomain> {
  return calculatePersonalDayFromDomain(birthDate, today);
}
