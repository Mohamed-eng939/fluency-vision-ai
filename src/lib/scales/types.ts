import { CEFRLevel } from '@/types/assessment';

/**
 * Swappable scoring-scale layer.
 *
 * The scoring engine always produces a CEFR band (`CEFRLevel`). A "scale" is a
 * named target system that a CEFR band maps onto — CEFR itself (identity), or a
 * client-specific scale such as Upedia's Group / Private levels.
 *
 * The principle (see CLAUDE.md → "Swappable scale"): scoring output maps through
 * this layer so CEFR ↔ Upedia's scale is *configuration, not a rewrite*. New
 * scales are added as data (a `ScaleDefinition`), never by changing the engine.
 *
 * This module is intentionally pure: no React, no Supabase. A scale definition
 * could later be loaded per-organization from the DB and dropped into the same
 * shape without touching consumers.
 */

export type ScaleId = string;

/**
 * How a single CEFR band maps onto one target scale.
 * A scale may expose multiple parallel "tracks" (e.g. Upedia runs Group classes
 * and Private classes on different level codes). An empty string for a track
 * means that band has no corresponding level in that track.
 */
export interface ScaleBandMapping {
  /** Human-readable label for the mapped level(s), e.g. "Group 1-3 · Private 1P-4P". */
  label: string;
  /** Named tracks → level code(s), e.g. { group: "1-3", private: "1P-4P" }. */
  tracks: Record<string, string>;
}

export interface ScaleDefinition {
  id: ScaleId;
  /** Display name of the scale, e.g. "Upedia Levels". */
  name: string;
  /** Track keys this scale exposes, in display order (e.g. ["group", "private"]). */
  trackOrder: string[];
  /**
   * Per-CEFR-band mapping. Keyed by precise band where the source data
   * distinguishes sub-levels (A1 vs A1+). A consumer that only has a main band
   * (A1) still resolves via the base-band fallback in `mapCefrToScale`.
   */
  bands: Partial<Record<CEFRLevel, ScaleBandMapping>>;
  /** Note attached when a band sits above the highest mapped band (e.g. above B2). */
  aboveRangeNote?: string;
  /** Note attached when a band sits below the lowest mapped band. */
  belowRangeNote?: string;
}

export type ScaleRangeStatus = 'mapped' | 'above-range' | 'below-range' | 'unmappable';

export interface ScaleMappingResult {
  scaleId: ScaleId;
  /** The source CEFR band that was mapped. */
  cefr: CEFRLevel;
  /** Display label for the mapped level(s); a sensible fallback if not in range. */
  label: string;
  /** Named tracks → level code(s). Empty object when not mapped. */
  tracks: Record<string, string>;
  status: ScaleRangeStatus;
  /** True only when status === 'mapped'. */
  inRange: boolean;
  /** Extra context — e.g. resolved-from-base-band, or an above/below-range note. */
  note?: string;
}
