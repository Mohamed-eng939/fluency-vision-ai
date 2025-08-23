/**
 * Rigorous CEFR Scoring System - Main Export
 * 
 * This module provides deterministic, evidence-based CEFR assessment that:
 * 1. Compares responses against CEFR benchmark samples using embedding similarity
 * 2. Scores based on rubric descriptors with specific evidence markers
 * 3. Generates feedback that cites specific elements from learner responses
 * 4. Rejects assessment when similarity is low or data is insufficient
 */

// Main rigorous assessment
export { 
  performRigorousCEFRAssessment
} from './rigorous-cefr-scoring';
export type { 
  RigorousCEFRAssessment 
} from './rigorous-cefr-scoring';

// Evidence-based feedback
export { 
  generateEvidenceBasedFeedback
} from './evidenceBasedFeedback';
export type { 
  EvidenceBasedFeedback, 
  EvidenceCitation 
} from './evidenceBasedFeedback';

// Benchmark comparison against sample bank
export { 
  performBenchmarkComparison, 
  compareAgainstTargetLevel
} from './benchmarkComparison';
export type { 
  BenchmarkComparison, 
  DetailedComparison 
} from './benchmarkComparison';

// Rubric-based scoring with CEFR descriptors
export { 
  getComprehensiveRubricScore,
  scoreAgainstRubric,
  grammarRubric,
  vocabularyRubric,
  coherenceRubric
} from './cefrRubricScoring';
export type { 
  CEFRRubricDescriptor
} from './cefrRubricScoring';

// Enhanced embedding similarity with validation
export { 
  findSimilarSamples, 
  getBestMatchingLevel, 
  calculateWeightedCEFRLevel
} from './embeddingSimilarity';
export type { 
  SimilarityMatch
} from './embeddingSimilarity';

// Updated scoring integration
export { 
  scoreResponseWithCEFR
} from './cefrScoringIntegration';
export type { 
  CEFRScoringResult 
} from './cefrScoringIntegration';

/**
 * Quick Start Guide:
 * 
 * For basic rigorous assessment:
 * ```
 * const result = performRigorousCEFRAssessment(transcript, promptId);
 * if (result.isReliable) {
 *   console.log(`Level: ${result.primaryAssessment.finalLevel}`);
 *   console.log(`Evidence:`, result.detailedFeedback.grammar.citations);
 * }
 * ```
 * 
 * For benchmark comparison:
 * ```
 * const comparison = performBenchmarkComparison(transcript, promptId);
 * if (comparison) {
 *   console.log(`Recommended: ${comparison.recommendedLevel}`);
 *   console.log(`Gaps:`, comparison.skillGaps);
 * }
 * ```
 * 
 * For rubric-based scoring:
 * ```
 * const rubricScores = getComprehensiveRubricScore(transcript);
 * console.log(`Grammar: ${rubricScores.grammar.score}/10`);
 * console.log(`Evidence:`, rubricScores.grammar.evidence);
 * ```
 */