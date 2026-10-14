/**
 * Text-based fluency features — a FIRST-PASS, acoustic-independent analyzer.
 *
 * HONESTY NOTE (see CLAUDE.md): these are derived from the transcript + the
 * recording duration only. We do NOT yet have word-level timestamps or phoneme
 * alignments in the live pipeline (whisper-proxy returns text only), so true
 * pause/articulation timing and pronunciation are out of reach here. Those
 * require the WhisperX + Montreal Forced Aligner service in `backend/` to be
 * deployed. Until then these text features are a useful but rough signal that
 * will need tuning against reviewed data — treat thresholds as provisional.
 *
 * Nothing here is a "score". It produces evidence that a human (or the LLM
 * rubric rater) weighs — it never hardcodes a CEFR level.
 */

export interface FluencyFeatures {
  /** Total word tokens detected in the transcript. */
  words: number;
  /** Recording length in seconds, if known (else null). */
  durationSec: number | null;
  /** Words per minute over the whole recording (speech rate), if duration known. */
  wordsPerMin: number | null;
  /** Count of filled-pause tokens (um, uh, er, hmm, …) + common hedges. */
  fillerCount: number;
  /** Immediate word/bigram repetitions (stutters / restarts). */
  repetitionCount: number;
  /** Fillers + repetitions per 100 words — the headline disfluency rate. */
  disfluencyPer100: number | null;
  /** Distinct word types (case-insensitive). */
  distinctWords: number;
  /** Raw type–token ratio (length-sensitive; prefer `mattr`). */
  typeTokenRatio: number;
  /** Moving-average type–token ratio (window 50) — length-robust lexical diversity. */
  mattr: number;
  /** Mean words per utterance run (approx. mean length of run). */
  meanRunWords: number;
  /** Longest single run in words. */
  longestRunWords: number;
  /** Human-readable observations for the tester / rubric rater. */
  flags: string[];
}

// Conservative filled-pause / hedge lexicon. Kept tight to avoid false positives;
// Whisper transcribes many of these literally ("um", "uh", "you know").
const SINGLE_FILLERS = new Set([
  'um', 'uh', 'uhh', 'uhm', 'erm', 'er', 'err', 'ah', 'ahh', 'eh',
  'hmm', 'hm', 'mm', 'mmm', 'mhm',
]);
const MULTI_FILLERS = ['you know', 'i mean', 'sort of', 'kind of', 'kinda'];

const WORD_RE = /[A-Za-z']+/g;

/** Tokenize to lowercase alphabetic word tokens. */
function tokenize(text: string): string[] {
  const m = (text || '').toLowerCase().match(WORD_RE);
  return m ? m.filter((w) => w.replace(/'/g, '').length > 0) : [];
}

/** Moving-average TTR over a sliding window (length-robust diversity). */
function movingAverageTTR(tokens: string[], window = 50): number {
  const n = tokens.length;
  if (n === 0) return 0;
  if (n <= window) return new Set(tokens).size / n;
  let sum = 0;
  let count = 0;
  for (let i = 0; i + window <= n; i++) {
    const slice = tokens.slice(i, i + window);
    sum += new Set(slice).size / window;
    count++;
  }
  return count > 0 ? sum / count : new Set(tokens).size / n;
}

/** Round to a fixed number of decimals. */
function round(x: number, d = 2): number {
  const f = Math.pow(10, d);
  return Math.round(x * f) / f;
}

/**
 * Analyze a transcript (+ optional duration in seconds) into fluency features.
 * Pure and deterministic — safe to run on the client and (mirrored) server-side.
 */
export function analyzeFluency(transcript: string, durationSeconds?: number | null): FluencyFeatures {
  const text = (transcript || '').trim();
  const tokens = tokenize(text);
  const words = tokens.length;
  const durationSec = durationSeconds && durationSeconds > 0 ? durationSeconds : null;

  // Fillers: single-token + multi-word hedges.
  let fillerCount = tokens.filter((t) => SINGLE_FILLERS.has(t)).length;
  const lowered = ' ' + tokens.join(' ') + ' ';
  for (const phrase of MULTI_FILLERS) {
    const needle = ' ' + phrase + ' ';
    let idx = lowered.indexOf(needle);
    while (idx !== -1) {
      fillerCount++;
      idx = lowered.indexOf(needle, idx + 1);
    }
  }

  // Immediate repetitions: same token twice in a row, or a repeated bigram.
  let repetitionCount = 0;
  for (let i = 1; i < tokens.length; i++) {
    if (tokens[i] === tokens[i - 1] && tokens[i].length > 1) repetitionCount++;
  }
  for (let i = 2; i < tokens.length; i++) {
    if (tokens[i] === tokens[i - 2] && tokens[i - 1] === tokens[i - 3]) repetitionCount++;
  }

  const distinctWords = new Set(tokens).size;
  const typeTokenRatio = words > 0 ? distinctWords / words : 0;
  const mattr = movingAverageTTR(tokens, 50);

  // Utterance runs: split on sentence-ending punctuation as a proxy for pauses
  // (we lack real pause timings). Mean/longest run in words.
  const runs = text
    .split(/[.?!]+/)
    .map((s) => (s.match(WORD_RE) || []).length)
    .filter((n) => n > 0);
  const meanRunWords = runs.length > 0 ? runs.reduce((a, b) => a + b, 0) / runs.length : words;
  const longestRunWords = runs.length > 0 ? Math.max(...runs) : words;

  const wordsPerMin = durationSec ? round((words / durationSec) * 60, 0) : null;
  const disfluencyPer100 = words > 0 ? round(((fillerCount + repetitionCount) / words) * 100, 1) : null;

  // Provisional, tweakable observations.
  const flags: string[] = [];
  if (words < 15) flags.push('Very short answer — limited evidence to grade on.');
  if (wordsPerMin !== null) {
    if (wordsPerMin < 70) flags.push(`Slow speech rate (${wordsPerMin} wpm) — possible hesitancy.`);
    else if (wordsPerMin > 170) flags.push(`Very fast speech rate (${wordsPerMin} wpm) — check it is not rushed/read.`);
  }
  if (disfluencyPer100 !== null && disfluencyPer100 >= 12) {
    flags.push(`High disfluency (${disfluencyPer100} fillers+repeats per 100 words).`);
  }
  if (meanRunWords < 5 && words >= 20) {
    flags.push(`Short runs (mean ${round(meanRunWords, 1)} words) — choppy, frequent breaks.`);
  }
  if (mattr < 0.6 && words >= 30) {
    flags.push(`Narrow lexical range (MATTR ${round(mattr, 2)}) — repeats the same words.`);
  }
  flags.push('Timing-based fluency (pauses/articulation rate) needs the speech service — these are text estimates.');

  return {
    words,
    durationSec,
    wordsPerMin,
    fillerCount,
    repetitionCount,
    disfluencyPer100,
    distinctWords,
    typeTokenRatio: round(typeTokenRatio, 3),
    mattr: round(mattr, 3),
    meanRunWords: round(meanRunWords, 1),
    longestRunWords,
    flags,
  };
}
