
/**
 * Syntax Feature Detection
 * Functions to detect syntactic features in text for CEFR evaluation
 * 
 * This file re-exports all relevant functions from feature modules
 */

export { detectSyntacticFeatures } from './cefrFeatureDetection';
export { 
  detectCompoundComplexSentences,
  countRepeatedBeginnings,
  estimateSVORatio,
  estimateClauseComplexity
} from './features/sentenceFeatures';
export {
  countPatterns,
  estimateRepetitionRatio,
  estimateErrorDensity
} from './features/qualityMetrics';
export { countEmbeddedClausePatterns } from './features/complexStructures';
