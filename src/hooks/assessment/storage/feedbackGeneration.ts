import { AudioAnalysisResult, CEFRLevel } from '@/types/assessment';
import { generateResponseFeedback } from '@/utils/assessment/feedbackGenerator';

/**
 * Generate enhanced smart feedback based on actual performance metrics
 */
export const generateSmartFeedback = (
  metrics: any, 
  audioAnalysis: AudioAnalysisResult, 
  cefrLevel: CEFRLevel, 
  taskCount: number
) => {
  // Generate targeted feedback using the new feedback generator
  return generateResponseFeedback(metrics, "", cefrLevel);
};