/**
 * Validation harness — system-vs-human CEFR agreement.
 *
 * The honest accuracy signal for this product (see CLAUDE.md → "Accuracy is
 * earned via data + validation"). Every assessor review writes a training_data
 * row carrying the system CEFR and the human CEFR; this measures how often the
 * two agree. It is the readiness signal for ML and the number that proves the
 * test works to Upedia / HR clients.
 *
 * Pure logic: it takes already-fetched records and computes stats. The data
 * source (Supabase table now, admin edge function after the security
 * migration locks training_data) lives in the consuming service, not here, so
 * this stays testable and unaffected by where the rows come from.
 *
 * Never fabricates: with no data it reports zeros, not a flattering number.
 */

export interface AgreementRecord {
  /** System-assigned CEFR (engine output). */
  systemCefr: string | null;
  /** Human assessor's CEFR (the label / ground truth). */
  humanCefr: string | null;
  /** Whether the human changed the system's level for this response. */
  isOverridden?: boolean;
}

export interface BandBreakdown {
  /** System main band, e.g. "A1". */
  band: string;
  /** Records the system assigned to this band. */
  count: number;
  /** Of those, how many the human agreed with exactly (same main band). */
  exact: number;
  /** Exact-agreement rate within this band, 0..1. */
  exactRate: number;
}

export interface AgreementStats {
  /** Records with both a system and a human CEFR that resolve to a known band. */
  totalComparable: number;
  /** Records seen in total (including unusable ones missing a label). */
  totalRecords: number;
  exactAgreement: number;
  /** 0..1; share of comparable records where system and human main bands match. */
  exactAgreementRate: number;
  withinOneBand: number;
  /** 0..1; share within one CEFR band (|rank difference| ≤ 1). */
  withinOneBandRate: number;
  overrideCount: number;
  /** 0..1; share of comparable records the human overrode. */
  overrideRate: number;
  /** Per-system-band agreement, ascending by band. */
  byBand: BandBreakdown[];
  /**
   * Mean signed band offset (human − system) across comparable records.
   * Positive ⇒ the engine tends to under-rate vs humans; negative ⇒ over-rate.
   */
  meanSignedBandError: number;
}

/** Main CEFR bands in ascending order; sub-bands (A1+) collapse to their base for comparison. */
const MAIN_ORDER = ['Pre-A1', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

function toMainBand(cefr: string): string {
  const trimmed = cefr.trim();
  return trimmed.endsWith('+') ? trimmed.slice(0, -1) : trimmed;
}

/** Ordinal rank of a CEFR value at the main-band level, or null if unknown. */
function bandRank(cefr: string | null | undefined): number | null {
  if (!cefr) return null;
  const idx = MAIN_ORDER.indexOf(toMainBand(cefr));
  return idx === -1 ? null : idx;
}

const emptyStats = (totalRecords: number): AgreementStats => ({
  totalComparable: 0,
  totalRecords,
  exactAgreement: 0,
  exactAgreementRate: 0,
  withinOneBand: 0,
  withinOneBandRate: 0,
  overrideCount: 0,
  overrideRate: 0,
  byBand: [],
  meanSignedBandError: 0,
});

/**
 * Compute system-vs-human agreement statistics. Records missing either label,
 * or carrying an unrecognised band, are excluded from `totalComparable` but
 * still counted in `totalRecords`.
 */
export function computeAgreement(records: AgreementRecord[]): AgreementStats {
  if (!records || records.length === 0) return emptyStats(0);

  const stats = emptyStats(records.length);
  const bandMap = new Map<string, { count: number; exact: number }>();
  let signedErrorSum = 0;

  for (const rec of records) {
    const sysRank = bandRank(rec.systemCefr);
    const humRank = bandRank(rec.humanCefr);
    if (sysRank === null || humRank === null) continue;

    stats.totalComparable += 1;

    const isExact = sysRank === humRank;
    const diff = Math.abs(sysRank - humRank);
    if (isExact) stats.exactAgreement += 1;
    if (diff <= 1) stats.withinOneBand += 1;
    if (rec.isOverridden) stats.overrideCount += 1;
    signedErrorSum += humRank - sysRank;

    const sysBand = MAIN_ORDER[sysRank];
    const entry = bandMap.get(sysBand) ?? { count: 0, exact: 0 };
    entry.count += 1;
    if (isExact) entry.exact += 1;
    bandMap.set(sysBand, entry);
  }

  const n = stats.totalComparable;
  if (n === 0) return stats;

  stats.exactAgreementRate = stats.exactAgreement / n;
  stats.withinOneBandRate = stats.withinOneBand / n;
  stats.overrideRate = stats.overrideCount / n;
  stats.meanSignedBandError = signedErrorSum / n;

  stats.byBand = MAIN_ORDER.filter((b) => bandMap.has(b)).map((band) => {
    const e = bandMap.get(band)!;
    return { band, count: e.count, exact: e.exact, exactRate: e.exact / e.count };
  });

  return stats;
}

/** Format a 0..1 rate as a whole-number percentage string, e.g. 0.8 → "80%". */
export function formatRate(rate: number): string {
  return `${Math.round(rate * 100)}%`;
}
