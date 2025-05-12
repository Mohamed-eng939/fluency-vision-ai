
// This file now serves as a re-export of the refactored modules for backward compatibility
import {
  calculateRubricScore,
  determineCEFRLevel,
  generateAssessmentResult
} from './scoring';

// Import the new pronunciation scoring function
import { calculatePronunciationScore } from './assessment/scoringUtils';

// Re-export for backward compatibility
export {
  calculateRubricScore,
  determineCEFRLevel,
  generateAssessmentResult,
  calculatePronunciationScore
};
