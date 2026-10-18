export const POSITION_STEP = 1000;

/**
 * Float position for a card dropped between two neighbours (CLAUDE.md section 4):
 * - between two cards: the midpoint
 * - at the end: last + 1000
 * - at the start: half of the first (or first - 1000 when the first is not positive)
 * - into an empty column: 1000
 * Only the moved card's position changes.
 */
export function positionBetween(prev: number | undefined, next: number | undefined): number {
  if (prev !== undefined && next !== undefined) return (prev + next) / 2;
  if (prev !== undefined) return prev + POSITION_STEP;
  if (next !== undefined) return next > 0 ? next / 2 : next - POSITION_STEP;
  return POSITION_STEP;
}
