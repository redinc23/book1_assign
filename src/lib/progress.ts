/**
 * Compute a completion percentage as an integer in the range [0, 100].
 *
 * Returns 0 when `total` is zero or negative, guarding against division by
 * zero (e.g. a book with no target word count, or an empty task list). The
 * result is clamped to [0, 100] so an over-target `value` — such as a chapter
 * that runs past its word-count goal — never reports more than complete.
 */
export function progressPercent(value: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((value / total) * 100)));
}
