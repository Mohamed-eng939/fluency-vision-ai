
// This file now serves as a re-export of the refactored modules for backward compatibility
import {
  calculateRubricScore,
  determineCEFRLevel as determineCEFRLevelOriginal,
  generateAssessmentResult,
  generateRecommendations
} from './scoring';

// Import the new pronunciation and fluency scoring functions from refactored modules
import { 
  calculatePronunciationScore,
  calculateFluencyScore,
  calculateFluencyScoreFromSyllables,
  estimateSyllableCount 
} from './assessment/scoringUtils';

// Re-export for backward compatibility
export {
  calculateRubricScore,
  determineCEFRLevelOriginal as determineCEFRLevel,
  generateAssessmentResult,
  calculatePronunciationScore,
  calculateFluencyScore,
  calculateFluencyScoreFromSyllables,
  estimateSyllableCount,
  generateRecommendations
};
