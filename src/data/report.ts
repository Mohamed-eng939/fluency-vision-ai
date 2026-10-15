import {
  getLevel,
  programConfig,
  type ProgramLevel,
  type SkillKey,
  type Track,
} from './programLevels';

/**
 * The student-facing performance report. Its shape mirrors the academy's Word
 * templates exactly: a header grid, Goals, Feedback, Current Skills (the five
 * skill lines), Objectives / Scope of Topics, Other Programs, Signature.
 *
 * The report is assembled once by the tester at review time and stored on the
 * assessor_review (column `report`). The level-specific content (skills + items
 * + band) is SNAPSHOTTED into the payload so the report a student sees never
 * changes if the level ladder is edited later.
 */

export interface ReportHeader {
  date: string; // 'D/M/YYYY' — matches the template's "Date: 1/1/2025"
  name: string;
  age: string;
  nationality: string;
  residency: string;
  occupation: string;
  /** Rendered as "Program: {track}" in the header (Private / Group). */
  track: string;
}

export interface PerformanceReportPayload {
  version: 1;
  /** Program identity (for internal logic + the Upedia header band). */
  program: string; // 'General English', 'Conversation', ...
  subtrack: Track | null;
  levelCode: string; // '1P', 'SL2', '7', 'Pre', ...
  band: string; // suggested CEFR band, snapshotted from the level
  header: ReportHeader;
  goals: string;
  feedback: string;
  /** Snapshot of the level's five skill lines. */
  skills: Partial<Record<SkillKey, string>>;
  itemsLabel: string | null; // 'Objectives' | 'Scope of Topics'
  items: string[]; // snapshot of the level's objectives / scope
  /** Eligible programs the student may switch to (tester-marked). */
  otherPrograms: string;
  /** Teen (or similar) scoring above A2 → recommended adult track, if any. */
  recommendTrackChange?: string | null;
  /** The three engine-backed criteria, as graded by the tester. */
  criteria?: { grammar?: string; fluency?: string; vocabulary?: string };
  overallCefr?: string | null;
  generatedAt: string; // ISO timestamp
}

export const SKILL_ORDER: SkillKey[] = [
  'listening',
  'reading',
  'speaking',
  'vocabulary',
  'grammar',
];

export const SKILL_LABEL: Record<SkillKey, string> = {
  listening: 'Listening',
  reading: 'Reading',
  speaking: 'Speaking',
  vocabulary: 'Vocabulary',
  grammar: 'Grammar',
};

/** Format a date the way the templates do: D/M/YYYY (no zero-padding). */
export function formatReportDate(d: Date = new Date()): string {
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}

/** Whole-year age from a date of birth (string or Date), or '' if unknown. */
export function ageFromDob(dob: unknown): string {
  if (!dob) return '';
  const d = dob instanceof Date ? dob : new Date(String(dob));
  if (isNaN(d.getTime())) return '';
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  return age >= 0 && age < 130 ? String(age) : '';
}

/**
 * Best-effort header defaults from a session's student_info + linked profile.
 * Occupation isn't captured today, so it defaults blank for the tester to fill.
 */
export function headerDefaultsFromSession(session: any): Partial<ReportHeader> {
  const si = session?.student_info || {};
  const prof = session?.profiles || {};
  const age =
    typeof si.age === 'number' && si.age > 0
      ? String(si.age)
      : ageFromDob(si.dateOfBirth || prof.date_of_birth);
  return {
    date: formatReportDate(),
    name: prof.full_name || si.name || '',
    age,
    nationality: si.citizenshipCountry || prof.country_of_citizenship || si.nationality || '',
    residency: si.residenceCountry || prof.country_of_residence || si.residency || '',
    occupation: si.occupation || '',
  };
}

/** The student's own stated reason for taking the course (the "need"). */
export function studentStatedNeed(session: any): string {
  const si = session?.student_info || {};
  const reason = si.otherReason?.trim() || si.testReason?.trim() || '';
  return reason;
}

/**
 * Assemble the final report payload. The level content is resolved from the
 * bundled ladder and snapshotted in. Programs without a level ladder
 * (Business / IELTS Prep) produce a header-only placement report.
 */
export function assembleReport(args: {
  program: string;
  subtrack: Track | null;
  levelCode: string;
  header: ReportHeader;
  goals: string;
  feedback: string;
  otherPrograms: string;
  recommendTrackChange?: string | null;
  criteria?: { grammar?: string; fluency?: string; vocabulary?: string };
  overallCefr?: string | null;
}): PerformanceReportPayload {
  const level: ProgramLevel | null = args.levelCode
    ? getLevel(args.program, args.levelCode, args.subtrack)
    : null;
  return {
    version: 1,
    program: args.program,
    subtrack: args.subtrack,
    levelCode: args.levelCode,
    band: level?.cefr_band || '',
    header: { ...args.header, track: args.subtrack || args.header.track || '' },
    goals: args.goals,
    feedback: args.feedback,
    skills: level?.skills || {},
    itemsLabel: level?.items_label || null,
    items: level?.items || [],
    otherPrograms: args.otherPrograms,
    recommendTrackChange: args.recommendTrackChange ?? null,
    criteria: args.criteria,
    overallCefr: args.overallCefr ?? null,
    generatedAt: new Date().toISOString(),
  };
}

/** Does this program produce a full performance report (vs placed-by-score)? */
export function programHasReport(program: string): boolean {
  return programConfig(program)?.hasReport ?? false;
}

/** A plain-text rendering of the report — used for email bodies. */
export function reportToPlainText(r: PerformanceReportPayload): string {
  const L: string[] = [];
  L.push(`Date: ${r.header.date}`);
  L.push('Performance Report');
  L.push(`Name: ${r.header.name}    Age: ${r.header.age}`);
  L.push(`Nationality: ${r.header.nationality}    Program: ${r.header.track}`);
  L.push(`Residency: ${r.header.residency}    Suggested Level: ${r.levelCode}`);
  L.push(`Occupation: ${r.header.occupation}    Suggested Band: ${r.band}`);
  L.push('');
  L.push('Goals');
  L.push(r.goals || '');
  L.push('');
  L.push('Feedback');
  L.push(r.feedback || '');
  if (Object.keys(r.skills).length) {
    L.push('');
    L.push('Current Skills');
    for (const k of SKILL_ORDER) {
      const v = r.skills[k];
      if (v) L.push(`${SKILL_LABEL[k]}: ${v}`);
    }
  }
  if (r.items.length) {
    L.push('');
    L.push(r.itemsLabel || 'Objectives');
    for (const it of r.items) L.push(`- ${it}`);
  }
  L.push('');
  L.push('Other Programs');
  L.push(r.otherPrograms || '');
  L.push('');
  L.push('Signature:');
  return L.join('\n');
}
