
import { 
  AssessmentQuestion, 
  AssessmentResult,
  CEFRLevel,
  AssessmentMetrics 
} from '../../types/assessment';

// Import from the refactored modules
import { calculateRubricScore } from './rubricScoring';
import { analyzeTranscript } from './transcriptAnalysis';
import { mapCriteriaToMetrics, determineCEFRLevel } from './metricsCalculation';
import { generateDetailedFeedback } from './feedbackGeneration';
import { generateRecommendations } from './recommendationsGenerator';
import { calculateIELTSSpeakingScore } from './ieltsScoringUtils';
import { mapBandToCEFR, mapIELTSto5Point } from '../rubricLoaderUtils';

/**
 * Generate a comprehensive assessment result
 */
export const generateAssessmentResult = (
  criteriaScores: Record<string, number>,
  totalScore: number,
  transcript?: string,
  audioBlob?: Blob
): AssessmentResult => {
  let metrics: AssessmentMetrics;
  let cefrLevel: CEFRLevel;
  
  // If transcript is available, use IELTS scoring for speaking tasks
  if (transcript) {
    // For synchronous execution, we need to work with the results directly
    // instead of waiting for the async function
    metrics = {
      fluency: mapIELTSBandToScale(5), // Default values since we can't wait for async results
      grammar: mapIELTSBandToScale(5),
      pronunciation: mapIELTSBandToScale(5),
      prosody: mapIELTSBandToScale(5),
      vocabulary: mapIELTSBandToScale(5),
      syntax: mapIELTSBandToScale(5),
      coherence: mapIELTSBandToScale(5)
    };
    
    // Use determineCEFRLevel directly
    cefrLevel = determineCEFRLevel(totalScore);
  } else {
    // For non-speaking assessments, use the original scoring method
    metrics = mapCriteriaToMetrics(criteriaScores);
    cefrLevel = determineCEFRLevel(totalScore);
  }
  
  const feedback = generateDetailedFeedback(metrics, cefrLevel);
  
  return {
    metrics,
    totalScore,
    cefrLevel,
    feedback,
    transcript
  };
};

/**
 * Map IELTS band (0-9) to the application's 1-10 scale
 */
export const mapIELTSBandToScale = (band: number): number => {
  // Simple linear mapping: IELTS 0-9 → App scale 1-10
  return 1 + (band / 9) * 9;
};

// Re-export from modules to maintain API compatibility
export { 
  calculateRubricScore,
  analyzeTranscript,
  mapCriteriaToMetrics, 
  determineCEFRLevel,
  generateDetailedFeedback,
  generateRecommendations,  // Added this export
  calculateIELTSSpeakingScore,
  mapBandToCEFR,
  mapIELTSto5Point
};
