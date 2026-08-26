import type { MasterNumber, ReducedNumber, SingleDigit } from './types';
import { reduceToSingleDigit } from './tables/major-arcana';

export const MASTER_NUMBERS: readonly MasterNumber[] = [11, 22, 33];

export function isMasterNumber(value: number): value is MasterNumber {
  return value === 11 || value === 22 || value === 33;
}

export function digitSum(value: number): number {
  let remaining = Math.abs(value);
  let sum = 0;
  while (remaining > 0) {
    sum += remaining % 10;
    remaining = Math.floor(remaining / 10);
  }
  return sum;
}

/**
 * Redução Pitagórica: 11, 22 e 33 permanecem. Demais valores
 * acima de 9 são somados até um dígito ou um mestre.
 */
export function reducePreservingMasters(value: number): ReducedNumber {
  if (value <= 0) {
    throw new Error(`Cannot reduce non-positive value: ${value}`);
  }
  let current = value;
  while (current > 9 && !isMasterNumber(current)) {
    current = digitSum(current);
  }
  return current as ReducedNumber;
}

export { reduceToSingleDigit };
export type { SingleDigit };
