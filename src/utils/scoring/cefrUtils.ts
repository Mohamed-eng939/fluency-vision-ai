
/**
 * Unified CEFR Calibration System
 * Central utility for mapping scores to CEFR levels across all skills
 */

export type CEFRLevel = 'Pre-A1' | 'A1' | 'A1+' | 'A2' | 'A2+' | 'B1' | 'B1+' | 'B2' | 'B2+' | 'C1' | 'C1+' | 'C2';
export type Skill = 'grammar' | 'fluency' | 'pronunciation' | 'prosody' | 'vocabulary' | 'coherence' | 'syntax' | 'listening' | 'reading' | 'writing';

/**
 * Skill-specific CEFR thresholds
 * Each skill may have slightly different thresholds based on research and standards
 */
const SKILL_THRESHOLDS: Record<Skill, number[]> = {
  // Standard thresholds for most skills
  grammar: [1.5, 2.5, 4.0, 5.5, 7.0, 8.5, 9.5],       // A1, A2, B1, B2, C1, C2
  fluency: [2.0, 3.0, 4.5, 6.0, 7.5, 9.0, 9.7],       // Slightly higher for fluency
  pronunciation: [1.8, 2.8, 4.2, 5.8, 7.2, 8.7, 9.5], // MFA-aligned thresholds
  prosody: [2.0, 3.0, 4.5, 6.0, 7.5, 9.0, 9.8],       // Pitch/tempo variability
  vocabulary: [1.5, 2.5, 4.0, 5.5, 7.0, 8.5, 9.5],    // CEFR word match levels
  coherence: [2.0, 3.0, 4.5, 6.0, 7.5, 8.5, 9.5],     // Semantic similarity
  syntax: [1.5, 2.5, 4.0, 5.5, 7.0, 8.5, 9.5],        // Structural complexity
  listening: [1.5, 2.5, 4.0, 5.5, 7.0, 8.5, 9.5],     // Standard thresholds
  reading: [1.5, 2.5, 4.0, 5.5, 7.0, 8.5, 9.5],       // Standard thresholds
  writing: [1.5, 2.5, 4.0, 5.5, 7.0, 8.5, 9.5]        // Standard thresholds
};

/**
 * CEFR level labels in order
 */
const CEFR_LEVELS: CEFRLevel[] = ['Pre-A1', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

/**
 * Map a score (1-10) to CEFR level for a specific skill
 */
export function mapScoreToCEFR(score: number, skill: Skill = 'grammar'): CEFRLevel {
  const thresholds = SKILL_THRESHOLDS[skill] || SKILL_THRESHOLDS.grammar;
  
  if (score < thresholds[0]) return 'Pre-A1';
  if (score < thresholds[1]) return 'A1';
  if (score < thresholds[2]) return 'A2';
  if (score < thresholds[3]) return 'B1';
  if (score < thresholds[4]) return 'B2';
  if (score < thresholds[5]) return 'C1';
  return 'C2';
}

/**
 * Convert CEFR level to numerical value for calculations
 */
export function cefrToNumber(level: CEFRLevel): number {
  const index = CEFR_LEVELS.indexOf(level);
  return index === -1 ? 0 : index;
}

/**
 * Convert numerical value back to CEFR level
 */
export function numberToCefr(num: number): CEFRLevel {
  const index = Math.round(Math.max(0, Math.min(6, num)));
  return CEFR_LEVELS[index];
}

/**
 * Calculate overall CEFR level from individual skill scores
 * Uses weighted average approach
 */
export function calculateOverallCEFR(
  skillScores: Partial<Record<Skill, number>>,
  weights?: Partial<Record<Skill, number>>
): CEFRLevel {
  const defaultWeights: Record<Skill, number> = {
    grammar: 1.2,
    fluency: 1.3,
    pronunciation: 1.1,
    prosody: 0.9,
    vocabulary: 1.2,
    coherence: 1.0,
    syntax: 1.0,
    listening: 1.0,
    reading: 1.0,
    writing: 1.0
  };
  
  const activeWeights = { ...defaultWeights, ...weights };
  let totalWeightedScore = 0;
  let totalWeight = 0;
  
  for (const [skill, score] of Object.entries(skillScores)) {
    if (score !== undefined && score !== null) {
      const skillKey = skill as Skill;
      const cefrLevel = mapScoreToCEFR(score, skillKey);
      const numericalLevel = cefrToNumber(cefrLevel);
      const weight = activeWeights[skillKey] || 1.0;
      
      totalWeightedScore += numericalLevel * weight;
      totalWeight += weight;
    }
  }
  
  if (totalWeight === 0) return 'A1';
  
  const averageLevel = totalWeightedScore / totalWeight;
  return numberToCefr(averageLevel);
}

/**
 * Generate CEFR levels object for all skills
 */
export function generateCEFRLevels(skillScores: Partial<Record<Skill, number>>): Record<string, CEFRLevel> {
  const cefrLevels: Record<string, CEFRLevel> = {};
  
  for (const [skill, score] of Object.entries(skillScores)) {
    if (score !== undefined && score !== null) {
      cefrLevels[skill] = mapScoreToCEFR(score, skill as Skill);
    }
  }
  
  return cefrLevels;
}

/**
 * Get color for CEFR level (for UI components)
 */
export function getCEFRColor(level: CEFRLevel): string {
  const colors: Record<CEFRLevel, string> = {
    'Pre-A1': '#dc2626', // red-600
    'A1': '#ef4444',     // red-500
    'A1+': '#f97316',    // orange-500
    'A2': '#f59e0b',     // amber-500
    'A2+': '#eab308',    // yellow-500
    'B1': '#84cc16',     // lime-500
    'B1+': '#22c55e',    // green-500
    'B2': '#10b981',     // emerald-500
    'B2+': '#06b6d4',    // cyan-500
    'C1': '#3b82f6',     // blue-500
    'C1+': '#6366f1',    // indigo-500
    'C2': '#8b5cf6'      // violet-500
  };
  return colors[level] || '#9ca3af';
}

/**
 * Check if a CEFR level meets a minimum requirement
 */
export function meetsCEFRRequirement(actual: CEFRLevel, required: CEFRLevel): boolean {
  return cefrToNumber(actual) >= cefrToNumber(required);
}
