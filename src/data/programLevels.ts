import raw from './programLevels.json';

export type Track = 'Private' | 'Group';

export type SkillKey = 'listening' | 'reading' | 'speaking' | 'vocabulary' | 'grammar';

/**
 * One level of a Upedia program, built from the academy's performance-report
 * templates. The `skills` + `items` (Objectives / Scope of Topics) are the fixed,
 * level-specific content; the rest of a report (header, goals, feedback, program,
 * band) is filled per student at review time.
 */
export interface ProgramLevel {
  program: string;
  subtrack: Track | null;
  stage: string | null; // Pioneer / Advanced / Super Learner (General Private only)
  level_code: string; // '3P','SL2','7','Pre K','Pre', ...
  order_index: number;
  cefr_band: string | null; // 'A1','A2+','B2','Pre A1', or null (Kids have no band)
  skills: Partial<Record<SkillKey, string>>;
  items_label: string | null; // 'Objectives' | 'Scope of Topics'
  items: string[];
}

export const PROGRAM_LEVELS = raw as ProgramLevel[];

export interface ProgramConfig {
  name: string;
  tracks: Track[]; // Private/Group options offered for this program
  hasLevels: boolean; // has a level ladder + report template
  hasReport: boolean; // produces a performance report
  note?: string;
}

/**
 * The full program catalogue for the Tester's dropdown.
 * - Group is offered only for General English, Conversation and Teens.
 * - Business & IELTS Prep have NO report — the student is placed from their
 *   General (or equivalent) test score.
 * - Jolly Phonics is a reading check, kept available for later.
 */
export const PROGRAMS: ProgramConfig[] = [
  { name: 'General English', tracks: ['Private', 'Group'], hasLevels: true, hasReport: true },
  { name: 'Conversation', tracks: ['Private', 'Group'], hasLevels: true, hasReport: true },
  { name: 'Teens', tracks: ['Private', 'Group'], hasLevels: true, hasReport: true },
  { name: 'Kids', tracks: ['Private'], hasLevels: true, hasReport: true },
  { name: 'Jolly Phonics', tracks: ['Private', 'Group'], hasLevels: true, hasReport: true, note: 'Reading check' },
  { name: 'Business', tracks: ['Private'], hasLevels: false, hasReport: false, note: 'Placed by General/equivalent score' },
  { name: 'IELTS Prep', tracks: ['Private'], hasLevels: false, hasReport: false, note: 'Placed by General/equivalent score' },
];

export function programConfig(name: string): ProgramConfig | null {
  return PROGRAMS.find((p) => p.name === name) ?? null;
}

/**
 * Levels for a program. General English keeps separate Private (25) and Group
 * (14) ladders; the other programs share one ladder across tracks.
 */
export function levelsFor(program: string, subtrack?: Track | null): ProgramLevel[] {
  let rows = PROGRAM_LEVELS.filter((r) => r.program === program);
  if (program === 'General English' && subtrack) {
    rows = rows.filter((r) => r.subtrack === subtrack);
  }
  return rows.slice().sort((a, b) => a.order_index - b.order_index);
}

export function getLevel(
  program: string,
  levelCode: string,
  subtrack?: Track | null,
): ProgramLevel | null {
  return levelsFor(program, subtrack).find((r) => r.level_code === levelCode) ?? null;
}
