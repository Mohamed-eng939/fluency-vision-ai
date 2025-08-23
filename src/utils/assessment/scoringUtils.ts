
/**
 * Core Assessment Scoring Utilities
 * 
 * This module provides the core scoring functionality for the assessment engine.
 * It re-exports scoring functions in a more structured way to reduce complexity.
 */

// Core scoring functionality
import { calculateTotalScore, determineCEFRLevel } from './coreScoring';

// Re-export individual scoring components
import { 
  calculateFluencyScore,
  calculateFluencyScoreFromSyllables,
  estimateSyllableCount
} from './fluency';

import { calculatePronunciationScore } from './pronunciationScoring';

import { 
  calculateGrammarScore, 
  calculateGrammarScoreFromErrors, 
  calculateBasicGrammarScore 
} from './grammarScoring';

import { calculateVocabularyScore } from './vocabularyScoring';
import { calculateSyntaxScore } from './syntaxScoring';
import { calculateCoherenceScore } from './coherenceScoring';
import { calculateCriterionScore } from './criterionScoring';

// Re-export criterion scorers
import {
  calculateFluencyCriterion,
  calculatePronunciationCriterion, 
  calculateGrammarCriterion,
  calculateVocabularyCriterion,
  calculateSyntaxCriterion,
  calculateProsodyCriterion,
  calculateCoherenceCriterion,
  calculateDefaultCriterion
} from './criterion';

// Export all scoring functions in organized groups
export {
  // Core scoring
  calculateTotalScore,
  determineCEFRLevel,
  
  // Individual metric scoring
  calculateFluencyScore,
  calculateFluencyScoreFromSyllables,
  estimateSyllableCount,
  calculatePronunciationScore,
  calculateGrammarScore,
  calculateGrammarScoreFromErrors,
  calculateBasicGrammarScore,
  calculateVocabularyScore,
  calculateSyntaxScore,
  calculateCoherenceScore,
  
  // Criterion-based scoring
  calculateCriterionScore,
  calculateFluencyCriterion,
  calculatePronunciationCriterion,
  calculateGrammarCriterion,
  calculateVocabularyCriterion,
  calculateSyntaxCriterion,
  calculateProsodyCriterion,
  calculateCoherenceCriterion,
  calculateDefaultCriterion
};

// Export rigorous scoring system
export {
  performRigorousCEFRAssessment,
  performBenchmarkComparison,
  generateEvidenceBasedFeedback,
  getComprehensiveRubricScore,
  scoreResponseWithCEFR
} from './rigorousScoring';
