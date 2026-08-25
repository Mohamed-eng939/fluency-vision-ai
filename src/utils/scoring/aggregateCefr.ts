/**
 * Shared CEFR aggregation used by both the results display and the scoring
 * pipeline so the overall level is computed one way everywhere.
 */

const ORDER = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;

const toIndex = (level: string | null | undefined): number =>
  level ? Math.max(0, ORDER.indexOf(level.replace('+', '') as (typeof ORDER)[number])) : 0;

/**
 * Sanity-cap a speech-rate fluency level: a fast talker of clearly low-level
 * English should not score C2 fluency. Fluency here is a speech-rate proxy, so
 * we don't let it exceed the demonstrated content (grammar / vocabulary) by more
 * than one band. Returns the (possibly lowered) level, or the input if there is
 * no content to compare against.
 */
export const capFluencyToContent = (
  fluency: string | null,
  grammar: string | null,
  vocabulary: string | null,
): string | null => {
  if (!fluency) return fluency;
  const content = [grammar, vocabulary].filter(Boolean).map(toIndex);
  if (content.length === 0) return fluency;
  const ceiling = Math.min(ORDER.length - 1, Math.max(...content) + 1);
  return toIndex(fluency) > ceiling ? ORDER[ceiling] : fluency;
};

/**
 * Overall CEFR as the MEDIAN of the available criterion levels — robust to a
 * single wildly-off criterion (e.g. an inflated speech-rate fluency), unlike a
 * mean which the outlier drags up. Returns null if nothing is available.
 */
export const overallCefrFromCriteria = (levels: Array<string | null | undefined>): string | null => {
  const valid = levels.filter(Boolean).map((l) => toIndex(l)).sort((a, b) => a - b);
  if (valid.length === 0) return null;
  const mid = Math.floor(valid.length / 2);
  const medianIndex =
    valid.length % 2 ? valid[mid] : Math.round((valid[mid - 1] + valid[mid]) / 2);
  return ORDER[medianIndex];
};
