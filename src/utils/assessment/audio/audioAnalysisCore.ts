
import { 
  AssessmentMetrics, 
  AssessmentResult, 
  CEFRLevel, 
  AssessmentFeedback 
} from '../../../types/assessment';
import { processAudioForAssessment } from '../../speechAnalysisUtils';
import { calculateTotalScore, determineCEFRLevel } from '../scoringUtils';
import { getFeedbackForMetric, getOverallFeedback } from '../../speaking/feedbackUtils';

/**
 * Enhanced audio analysis for assessment
 */
export const analyzeAudio = async (audioBlob: Blob): Promise<AssessmentResult> => {
  try {
    // Process the audio using our new speech analysis utilities
    const processedAudio = await processAudioForAssessment(audioBlob);
    
    // Map the speech metrics to our assessment metrics
    const metrics: AssessmentMetrics = {
      fluency: processedAudio.metrics.fluency,
      grammar: Math.random() * 5 + 5, // Still random as we can't assess grammar from audio alone
      // Use updated pronunciation scoring
      pronunciation: processedAudio.metrics.pronunciation || Math.random() * 5 + 5,
      prosody: processedAudio.metrics.prosody,
      vocabulary: Math.random() * 5 + 5, // Still random as we can't assess vocabulary from audio alone
      syntax: Math.random() * 5 + 5, // Still random as we can't assess syntax from audio alone
      coherence: Math.random() * 5 + 5, // Still random as we can't assess coherence from audio alone
    };

    const totalScore = calculateTotalScore(metrics);
    const cefrLevel = determineCEFRLevel(totalScore);
    
    return {
      metrics,
      totalScore,
      cefrLevel,
      feedback: generateFeedback(metrics, cefrLevel),
      audioUrl: processedAudio.audioUrl,
      duration: processedAudio.duration,
      speechRate: processedAudio.metrics.speechRate,
      confidenceScore: processedAudio.metrics.confidenceScore
    };
  } catch (error) {
    console.error('Error in audio analysis:', error);
    
    // Fallback to the previous implementation if there's an error
    return fallbackAnalyzeAudio(audioBlob);
  }
};

/**
 * Fallback implementation - same as the old implementation
 */
const fallbackAnalyzeAudio = (audioBlob: Blob): Promise<AssessmentResult> => {
  return new Promise((resolve) => {
    // Simulate processing time
    setTimeout(() => {
      const metrics: AssessmentMetrics = {
        fluency: Math.random() * 5 + 5, // 5-10
        grammar: Math.random() * 5 + 5,
        pronunciation: Math.min(7, Math.random() * 3 + 4), // Capped at 7 per new requirements
        prosody: Math.random() * 5 + 5,
        vocabulary: Math.random() * 5 + 5,
        syntax: Math.random() * 5 + 5,
        coherence: Math.random() * 5 + 5,
      };

      const totalScore = calculateTotalScore(metrics);
      const cefrLevel = determineCEFRLevel(totalScore);
      
      resolve({
        metrics,
        totalScore,
        cefrLevel,
        feedback: generateFeedback(metrics, cefrLevel)
      });
    }, 2000);
  });
};

/**
 * Generate feedback based on metrics and CEFR level
 */
export const generateFeedback = (metrics: AssessmentMetrics, cefrLevel: CEFRLevel): AssessmentFeedback => {
  return {
    fluency: getFeedbackForMetric('fluency', metrics.fluency, cefrLevel),
    grammar: getFeedbackForMetric('grammar', metrics.grammar, cefrLevel),
    pronunciation: getFeedbackForMetric('pronunciation', metrics.pronunciation, cefrLevel),
    prosody: getFeedbackForMetric('prosody', metrics.prosody, cefrLevel),
    vocabulary: getFeedbackForMetric('vocabulary', metrics.vocabulary, cefrLevel),
    syntax: getFeedbackForMetric('syntax', metrics.syntax, cefrLevel),
    coherence: getFeedbackForMetric('coherence', metrics.coherence, cefrLevel),
    overall: getOverallFeedback(cefrLevel)
  };
};
