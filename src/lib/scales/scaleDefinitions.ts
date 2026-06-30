import { ScaleDefinition } from './types';

/**
 * CEFR identity scale. The engine already speaks CEFR, so this maps each band
 * to itself. Present so CEFR is "just another scale" and the result views can
 * treat every scale uniformly.
 */
export const cefrScale: ScaleDefinition = {
  id: 'cefr',
  name: 'CEFR',
  trackOrder: ['cefr'],
  bands: {
    'A1': { label: 'A1', tracks: { cefr: 'A1' } },
    'A1+': { label: 'A1+', tracks: { cefr: 'A1+' } },
    'A2': { label: 'A2', tracks: { cefr: 'A2' } },
    'A2+': { label: 'A2+', tracks: { cefr: 'A2+' } },
    'B1': { label: 'B1', tracks: { cefr: 'B1' } },
    'B1+': { label: 'B1+', tracks: { cefr: 'B1+' } },
    'B2': { label: 'B2', tracks: { cefr: 'B2' } },
    'B2+': { label: 'B2+', tracks: { cefr: 'B2+' } },
    'C1': { label: 'C1', tracks: { cefr: 'C1' } },
    'C1+': { label: 'C1+', tracks: { cefr: 'C1+' } },
    'C2': { label: 'C2', tracks: { cefr: 'C2' } },
  },
};

/**
 * Upedia's own placement scale, derived from the academic Division Guide and the
 * placement-ladder prompt metadata (one source of truth — the same mapping lives
 * in each placement prompt's `instructions`).
 *
 * Two parallel tracks: Group classes and Private classes. The guide tops out at
 * B2, so bands above B2 are intentionally unmapped (see `aboveRangeNote`).
 *
 * | CEFR | Upedia Group | Upedia Private |
 * |------|--------------|----------------|
 * | A1   | 1-3          | 1P-4P          |
 * | A1+  | —            | 5P             |
 * | A2   | 4-6          | 6P-10P         |
 * | A2+  | 7            | 1A-2A          |
 * | B1   | 8-10         | 3A-6A          |
 * | B1+  | 11-12        | 7A-10A         |
 * | B2   | 12-14        | 1SL-5SL        |
 */
export const upediaScale: ScaleDefinition = {
  id: 'upedia',
  name: 'Upedia Levels',
  trackOrder: ['group', 'private'],
  bands: {
    'A1': { label: 'Group 1-3 · Private 1P-4P', tracks: { group: '1-3', private: '1P-4P' } },
    'A1+': { label: 'Private 5P', tracks: { group: '', private: '5P' } },
    'A2': { label: 'Group 4-6 · Private 6P-10P', tracks: { group: '4-6', private: '6P-10P' } },
    'A2+': { label: 'Group 7 · Private 1A-2A', tracks: { group: '7', private: '1A-2A' } },
    'B1': { label: 'Group 8-10 · Private 3A-6A', tracks: { group: '8-10', private: '3A-6A' } },
    'B1+': { label: 'Group 11-12 · Private 7A-10A', tracks: { group: '11-12', private: '7A-10A' } },
    'B2': { label: 'Group 12-14 · Private 1SL-5SL', tracks: { group: '12-14', private: '1SL-5SL' } },
  },
  aboveRangeNote:
    'Above the Upedia placement ceiling — the Division Guide currently tops out at B2.',
  belowRangeNote: 'Below the lowest Upedia placement band (A1).',
};

/** Registry of all known scales. Add a client scale here (or load from the DB) — no engine changes. */
export const SCALE_REGISTRY: Record<string, ScaleDefinition> = {
  [cefrScale.id]: cefrScale,
  [upediaScale.id]: upediaScale,
};

export const DEFAULT_SCALE_ID = cefrScale.id;
