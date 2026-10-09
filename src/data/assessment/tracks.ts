import type { CEFRLevel, Track } from '@/types/assessment';

export type { Track };

export interface TrackDefinition {
  id: Track;
  /** User-facing name, shown to the student and in results/reports. */
  label: string;
  minAge: number;
  /** Upper age bound (inclusive). null = no upper bound. */
  maxAge: number | null;
  /** Highest CEFR level this track is designed to certify on its own. */
  ceilingCefr: CEFRLevel;
  /** One-line description for the age gate and results screen. */
  blurb: string;
  /** Course family this track's content is built from (for internal reference). */
  curriculum: string;
}

/**
 * The three age-based placement tracks.
 *
 *  - Kids    (6-10)  : Family & Friends content, CEFR A1 -> B1.
 *  - Teens   (11-16) : Metro content, CEFR Pre-A1 -> A2 (plus B1 "probe" items
 *                      that flag a student for a human to move up to Adults).
 *  - Adults  (17+)   : American English File content, CEFR A1 -> C2 (the
 *                      existing placement test).
 */
export const TRACKS: Record<Track, TrackDefinition> = {
  kids: {
    id: 'kids',
    label: 'Kids',
    minAge: 6,
    maxAge: 10,
    ceilingCefr: 'B1',
    blurb: 'For young learners, ages 6 to 10.',
    curriculum: 'Family & Friends',
  },
  teens: {
    id: 'teens',
    label: 'Teens',
    minAge: 11,
    maxAge: 16,
    ceilingCefr: 'A2',
    blurb: 'For teenage learners, ages 11 to 16.',
    curriculum: 'Metro',
  },
  adults: {
    id: 'adults',
    label: 'Adults',
    minAge: 17,
    maxAge: null,
    ceilingCefr: 'C2',
    blurb: 'For adult learners, ages 17 and above.',
    curriculum: 'American English File',
  },
};

export const TRACK_ORDER: Track[] = ['kids', 'teens', 'adults'];

export const MIN_SUPPORTED_AGE = 4;
export const MAX_SUPPORTED_AGE = 120;

/**
 * Pick the track for a given age. A missing/invalid age defaults to Adults
 * (the owner's primary market); a very young age still maps to the closest
 * (Kids) track rather than being rejected.
 */
export function trackForAge(age: number | null | undefined): Track {
  if (age == null || Number.isNaN(age)) return 'adults';
  if (age <= TRACKS.kids.maxAge!) return 'kids'; // 10 and under (incl. under 6)
  if (age <= TRACKS.teens.maxAge!) return 'teens'; // 11-16
  return 'adults'; // 17+
}

export function trackLabel(track: Track | null | undefined): string {
  return track ? TRACKS[track].label : '';
}

export function trackDefinition(track: Track | null | undefined): TrackDefinition | null {
  return track ? TRACKS[track] : null;
}

// Ordered CEFR ranking across the frontend's richer CEFR space, used for
// ceiling comparisons (e.g. "did a teen score above A2?").
const CEFR_RANK: Record<string, number> = {
  'Below Pre-A1': 0,
  'Pre-A1': 1,
  A1: 2,
  'A1+': 3,
  A2: 4,
  'A2+': 5,
  B1: 6,
  'B1+': 7,
  B2: 8,
  'B2+': 9,
  C1: 10,
  'C1+': 11,
  C2: 12,
};

export function cefrRank(level?: string | null): number {
  if (!level) return -1;
  return CEFR_RANK[level] ?? -1;
}

/** True when a result sits strictly above the track's intended ceiling. */
export function isAboveTrackCeiling(track: Track, cefr?: string | null): boolean {
  if (!cefr) return false;
  return cefrRank(cefr) > cefrRank(TRACKS[track].ceilingCefr);
}

/**
 * If a student scored above what their track certifies, return the track a
 * human assessor should consider moving them to. Today this only applies to
 * teens who exceed A2 -> suggest Adults (confirmed by a human, never automatic).
 */
export function suggestedTrackForResult(track: Track, cefr?: string | null): Track | null {
  if (track === 'teens' && isAboveTrackCeiling('teens', cefr)) return 'adults';
  return null;
}
