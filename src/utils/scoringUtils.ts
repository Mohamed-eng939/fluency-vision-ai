
/**
 * Legacy Scoring Utilities
 * 
 * This file maintains backward compatibility by re-exporting from refactored modules.
 * New code should import directly from the assessment modules.
 */

// Import core assessment scoring functionality
import {
  calculateTotalScore,
  determineCEFRLevel,
  calculateFluencyScore,
  calculateFluencyScoreFromSyllables,
  estimateSyllableCount,
  calculatePronunciationScore
} from './assessment/scoringUtils';

// Import existing scoring functions for backward compatibility
import {
  calculateRubricScore,
  generateAssessmentResult,
  generateRecommendations
} from './scoring';

// Re-export for backward compatibility
export {
  // Core scoring
  calculateRubricScore,
  determineCEFRLevel as determineCEFRLevel,
  generateAssessmentResult,
  generateRecommendations,
  
  // Pronunciation and fluency assessment
  calculatePronunciationScore,
  calculateFluencyScore,
  calculateFluencyScoreFromSyllables,
  estimateSyllableCount
};
