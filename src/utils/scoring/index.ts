
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
export const generateAssessmentResult = async (
  criteriaScores: Record<string, number>,
  totalScore: number,
  transcript?: string,
  audioBlob?: Blob
): Promise<AssessmentResult> => {
  let metrics: AssessmentMetrics;
  let cefrLevel: CEFRLevel;
  
  // If transcript is available, use IELTS scoring for speaking tasks
  if (transcript) {
    // Get scores from IELTS scoring engine
    const ieltsScores = await calculateIELTSSpeakingScore(transcript, audioBlob);
    
    // Map to our application's metrics (1-10 scale)
    metrics = {
      fluency: mapIELTSBandToScale(ieltsScores["Fluency and Coherence"] as number),
      grammar: mapIELTSBandToScale(ieltsScores["Grammatical Range and Accuracy"] as number),
      pronunciation: mapIELTSBandToScale(ieltsScores["Pronunciation"] as number),
      prosody: mapIELTSBandToScale(ieltsScores["Pronunciation"] as number),
      vocabulary: mapIELTSBandToScale(ieltsScores["Lexical Resource"] as number),
      syntax: mapIELTSBandToScale(ieltsScores["Grammatical Range and Accuracy"] as number),
      coherence: mapIELTSBandToScale(ieltsScores["Fluency and Coherence"] as number)
    };
    
    // Use IELTS CEFR mapping
    cefrLevel = ieltsScores["CEFR_Level"] as CEFRLevel;
    
    // Recalculate total score based on IELTS band
    totalScore = Math.min(Math.round((ieltsScores["Total_Band"] as number) * 11.1), 100);
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
  generateRecommendations,
  calculateIELTSSpeakingScore,
  mapBandToCEFR,
  mapIELTSto5Point
};
