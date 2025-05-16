
/**
 * CEFR Grammar and Syntax Rubric
 * Re-exports from refactored modules for backward compatibility
 */

// Re-export types
export type { CEFRFeatureLevel, CEFRGrammarSyntaxEntry, CEFRGrammarSyntaxRubric } from './cefrTypes';

// Re-export rubric data
export { cefrGrammarSyntaxRubric } from './cefrRubricData';

// Re-export level utilities
export { 
  findCEFRLevelForScore,
  getScoreRangeForLevel,
  getCEFRDescriptors
} from './cefrLevelUtils';

// Re-export justification utilities
export {
  generateCEFRJustification,
  getRequiredFeaturesForLevel
} from './cefrJustificationUtils';
