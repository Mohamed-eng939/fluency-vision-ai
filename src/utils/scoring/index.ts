
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

/**
 * Generate a comprehensive assessment result
 */
export const generateAssessmentResult = (
  criteriaScores: Record<string, number>,
  totalScore: number,
  transcript?: string
): AssessmentResult => {
  const metrics = mapCriteriaToMetrics(criteriaScores);
  
  // Apply dynamic scoring if transcript is available
  if (transcript) {
    const transcriptAnalysis = analyzeTranscript(transcript);
    // Adjust metrics based on transcript analysis
    Object.keys(transcriptAnalysis).forEach(key => {
      const metricKey = key as keyof AssessmentMetrics;
      if (metrics[metricKey]) {
        // Blend the original metric with transcript analysis
        metrics[metricKey] = (metrics[metricKey] + transcriptAnalysis[metricKey]!) / 2;
      }
    });
    
    // Recalculate total score based on adjusted metrics
    const averageMetric = Object.values(metrics).reduce((sum, val) => sum + val, 0) / Object.values(metrics).length;
    totalScore = Math.min(Math.round(averageMetric * 10), 100);
  }
  
  const cefrLevel = determineCEFRLevel(totalScore);
  const feedback = generateDetailedFeedback(metrics, cefrLevel);
  
  return {
    metrics,
    totalScore,
    cefrLevel,
    feedback,
    transcript
  };
};

// Re-export from modules to maintain API compatibility
export { 
  calculateRubricScore,
  analyzeTranscript,
  mapCriteriaToMetrics, 
  determineCEFRLevel,
  generateDetailedFeedback,
  generateRecommendations
};
