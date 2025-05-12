
import { 
  AssessmentMetrics, 
  AssessmentResult, 
  CEFRLevel, 
  AssessmentQuestion, 
  AssessmentFeedback,
  TestTask, 
  TestSection, 
  FullAssessment,
  SpeakingPrompt,
} from "../types/assessment";

// Re-export from refactored modules
import { getFullAssessmentTests } from './assessment/testDataUtils';
import { analyzeAudio, scoreSpeakingResponse } from './assessment/audioAssessment';
import { calculateTotalScore, determineCEFRLevel } from './assessment/scoringUtils';
import { mockPrompts } from './speaking/promptUtils';
import { getFeedbackForMetric, getOverallFeedback } from './speaking/feedbackUtils';

// Re-export everything for backwards compatibility
export {
  analyzeAudio,
  scoreSpeakingResponse,
  calculateTotalScore,
  determineCEFRLevel,
  getFullAssessmentTests,
  mockPrompts,
  getFeedbackForMetric,
  getOverallFeedback
};
