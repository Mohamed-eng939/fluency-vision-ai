
// This file now serves as a re-export of the refactored modules for backward compatibility
import {
  calculateRubricScore,
  determineCEFRLevel,
  generateAssessmentResult,
  generateRecommendations
} from './scoring';

// Import the new pronunciation and fluency scoring functions
import { 
  calculatePronunciationScore,
  calculateFluencyScore,
  calculateFluencyScoreFromSyllables,
  estimateSyllableCount 
} from './assessment/scoringUtils';

// Re-export for backward compatibility
export {
  calculateRubricScore,
  determineCEFRLevel,
  generateAssessmentResult,
  calculatePronunciationScore,
  calculateFluencyScore,
  calculateFluencyScoreFromSyllables,
  estimateSyllableCount,
  generateRecommendations
};
