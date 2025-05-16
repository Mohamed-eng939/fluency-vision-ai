
/**
 * CEFR Level Utilities
 * Helper functions for working with CEFR levels
 */

import { CEFRFeatureLevel } from './cefrTypes';
import { cefrGrammarSyntaxRubric } from './cefrRubricData';

/**
 * Find the CEFR level entry that matches the given score
 */
export const findCEFRLevelForScore = (
  score: number, 
  category: 'grammar' | 'syntax'
): CEFRFeatureLevel => {
  for (const entry of cefrGrammarSyntaxRubric.cefr_rubric) {
    const [min, max] = entry.score_range;
    if (score >= min && score <= max) {
      return entry.level;
    }
  }
  
  // Default to A1 if no match (shouldn't happen with proper scoring)
  return 'A1';
};

/**
 * Get the score range for a specific CEFR level
 */
export const getScoreRangeForLevel = (
  level: CEFRFeatureLevel
): [number, number] => {
  const entry = cefrGrammarSyntaxRubric.cefr_rubric.find(
    entry => entry.level === level
  );
  return entry ? entry.score_range : [1.0, 2.5]; // Default to A1 range if not found
};

/**
 * Get the descriptors for a specific CEFR level
 */
export const getCEFRDescriptors = (
  level: CEFRFeatureLevel
): { grammar: string; syntax: string } => {
  const entry = cefrGrammarSyntaxRubric.cefr_rubric.find(
    entry => entry.level === level
  );
  
  return entry 
    ? { grammar: entry.grammar, syntax: entry.syntax }
    : { grammar: "", syntax: "" };
};
