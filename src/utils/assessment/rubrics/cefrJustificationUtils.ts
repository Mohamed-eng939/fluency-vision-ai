
/**
 * CEFR Justification Utilities
 * Functions for generating justification text based on CEFR criteria
 */

import { CEFRFeatureLevel } from './cefrTypes';
import { findCEFRLevelForScore, getCEFRDescriptors } from './cefrLevelUtils';
import { cefrGrammarSyntaxRubric } from './cefrRubricData';

/**
 * Generate justification text for a specific score and category
 */
export const generateCEFRJustification = (
  score: number,
  category: 'grammar' | 'syntax',
  features: string[]
): string => {
  const level = findCEFRLevelForScore(score, category);
  const descriptors = getCEFRDescriptors(level);
  
  return `CEFR ${level} (${score.toFixed(1)}/10): ${descriptors[category]}. 
Features observed: ${features.join(', ')}`;
};

/**
 * Get required features for a specific CEFR level
 */
export const getRequiredFeaturesForLevel = (
  level: CEFRFeatureLevel
): string[] => {
  const entry = cefrGrammarSyntaxRubric.cefr_rubric.find(
    entry => entry.level === level
  );
  
  return entry ? [...entry.features] : [];
};
