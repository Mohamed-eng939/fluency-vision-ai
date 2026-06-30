import { CEFRLevel } from '@/types/assessment';
import {
  ScaleDefinition,
  ScaleId,
  ScaleMappingResult,
} from './types';
import {
  SCALE_REGISTRY,
  DEFAULT_SCALE_ID,
  cefrScale,
  upediaScale,
} from './scaleDefinitions';

export type { ScaleDefinition, ScaleId, ScaleMappingResult, ScaleBandMapping, ScaleRangeStatus } from './types';
export { SCALE_REGISTRY, DEFAULT_SCALE_ID, cefrScale, upediaScale } from './scaleDefinitions';

/**
 * Ascending rank of every CEFR band, used to decide whether a band sits above or
 * below a scale's mapped range. Sub-bands (A1+) rank just above their base (A1).
 */
const CEFR_RANK: Record<CEFRLevel, number | null> = {
  'Below Pre-A1': -2,
  'Pre-A1': -1,
  'A1': 0,
  'A1+': 1,
  'A2': 2,
  'A2+': 3,
  'B1': 4,
  'B1+': 5,
  'B2': 6,
  'B2+': 7,
  'C1': 8,
  'C1+': 9,
  'C2': 10,
  'N/A': null,
};

/** Map a precise band to its base main band, e.g. 'A1+' → 'A1'. Non-plus bands return unchanged. */
function baseBand(cefr: CEFRLevel): CEFRLevel {
  return (cefr.endsWith('+') ? cefr.slice(0, -1) : cefr) as CEFRLevel;
}

function rankedMappedBands(def: ScaleDefinition): number[] {
  return Object.keys(def.bands)
    .map((b) => CEFR_RANK[b as CEFRLevel])
    .filter((r): r is number => r !== null && r !== undefined);
}

export function getScaleDefinition(scaleId: ScaleId): ScaleDefinition | undefined {
  return SCALE_REGISTRY[scaleId];
}

export function listScales(): ScaleDefinition[] {
  return Object.values(SCALE_REGISTRY);
}

/**
 * Map a CEFR result onto a target scale.
 *
 * Resolution order:
 *   1. exact band match (e.g. 'A1+' has its own Upedia mapping) → mapped
 *   2. base-band fallback (e.g. system only knows 'A1') → mapped, with a note
 *   3. above / below the scale's mapped range → labelled, not in range
 *   4. unmappable ('N/A') → unmappable
 *
 * Never throws: an unknown scaleId falls back to the CEFR identity scale.
 */
export function mapCefrToScale(cefr: CEFRLevel, scaleId: ScaleId = DEFAULT_SCALE_ID): ScaleMappingResult {
  const def = SCALE_REGISTRY[scaleId] ?? cefrScale;

  // 1. exact precise-band match
  const exact = def.bands[cefr];
  if (exact) {
    return {
      scaleId: def.id,
      cefr,
      label: exact.label,
      tracks: exact.tracks,
      status: 'mapped',
      inRange: true,
    };
  }

  // unmappable bands (N/A) — no rank
  const rank = CEFR_RANK[cefr];
  if (rank === null || rank === undefined) {
    return {
      scaleId: def.id,
      cefr,
      label: 'Not available',
      tracks: {},
      status: 'unmappable',
      inRange: false,
      note: 'No scale mapping for this CEFR value.',
    };
  }

  // 2. base-band fallback (precise band not separately mapped)
  const base = baseBand(cefr);
  const baseMapping = base !== cefr ? def.bands[base] : undefined;
  if (baseMapping) {
    return {
      scaleId: def.id,
      cefr,
      label: baseMapping.label,
      tracks: baseMapping.tracks,
      status: 'mapped',
      inRange: true,
      note: `Resolved from base band ${base}.`,
    };
  }

  // 3. above / below the scale's mapped range
  const ranks = rankedMappedBands(def);
  const maxRank = ranks.length ? Math.max(...ranks) : -Infinity;
  const minRank = ranks.length ? Math.min(...ranks) : Infinity;

  if (rank > maxRank) {
    return {
      scaleId: def.id,
      cefr,
      label: def.aboveRangeNote ?? `Above the ${def.name} range`,
      tracks: {},
      status: 'above-range',
      inRange: false,
      note: def.aboveRangeNote,
    };
  }

  return {
    scaleId: def.id,
    cefr,
    label: def.belowRangeNote ?? `Below the ${def.name} range`,
    tracks: {},
    status: 'below-range',
    inRange: false,
    note: def.belowRangeNote,
  };
}
