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

// Re-export CEFR evaluation modules
import { 
  evaluateCEFR, 
  cefrLevelToNumeric, 
  calculateLevelDiscrepancy 
} from './assessment/cefrEvaluation';
import { 
  evaluateGrammarAndSyntax, 
  enhanceAudioAnalysisWithCEFR,
  determineCEFRLevelOfPrompt 
} from './assessment/cefrScoringAdapter';

// Re-export enhanced vocabulary assessment modules
import { analyzeCefrVocabulary } from './assessment/vocabulary/cefrVocabularyAnalyzer';
import { 
  createVocabularyEvaluationPrompt, 
  processGptVocabularyEvaluation 
} from './assessment/vocabulary/gptVocabularyEvaluation';
import { 
  assessVocabulary,
  VocabularyAssessmentMethod 
} from './assessment/vocabularyAssessmentService';

// Re-export hesitation detection for fluency scoring
import { detectHesitationMarkers } from './audio/hesitationDetector';
import { applyHesitationPenalties } from './assessment/fluencyScoring';

// Re-export everything for backwards compatibility
export {
  analyzeAudio,
  scoreSpeakingResponse,
  calculateTotalScore,
  determineCEFRLevel,
  getFullAssessmentTests,
  mockPrompts,
  getFeedbackForMetric,
  getOverallFeedback,
  // New CEFR comparison exports
  evaluateCEFR,
  cefrLevelToNumeric,
  calculateLevelDiscrepancy,
  evaluateGrammarAndSyntax,
  enhanceAudioAnalysisWithCEFR,
  determineCEFRLevelOfPrompt,
  // New vocabulary assessment exports
  analyzeCefrVocabulary,
  createVocabularyEvaluationPrompt,
  processGptVocabularyEvaluation,
  assessVocabulary,
  // Fluency assessment enhancements
  detectHesitationMarkers,
  applyHesitationPenalties
};

// Use 'export type' for type exports
export type { VocabularyAssessmentMethod };

/**
 * Generate a unique session ID with a specified prefix
 */
export function generateUniqueId(prefix: string = 'S'): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `${prefix}-${timestamp}-${randomStr}`;
}
