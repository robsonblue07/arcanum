import { parseBirthDate, reducePreservingMasters } from '../domain/numerology';
import type { ReducedNumber } from '../domain/numerology';

export function calculatePersonalDay(
  birthDate: string,
  today: Date = new Date(),
): ReducedNumber {
  const birth = parseBirthDate(birthDate);
  const personalYear = reducePreservingMasters(
    birth.month + birth.day + today.getFullYear(),
  );
  const personalMonth = reducePreservingMasters(
    personalYear + (today.getMonth() + 1),
  );
  return reducePreservingMasters(personalMonth + today.getDate());
}
