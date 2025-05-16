
import { 
  AssessmentMetrics, 
  AssessmentResult, 
  CEFRLevel, 
  AssessmentQuestion, 
  AssessmentFeedback 
} from '../../types/assessment';
import { processAudioForAssessment } from '../speechAnalysisUtils';
import { generateDetailedFeedback } from '../scoring/feedbackGeneration';
import { generateRubricForQuestion } from '../questionUtils';
import { calculateTotalScore, determineCEFRLevel, calculateCriterionScore, getCriterionFeedback } from './scoringUtils';
import { getFeedbackForMetric, getOverallFeedback } from '../speaking/feedbackUtils';
import { analyzeCefrVocabulary } from './vocabulary/cefrVocabularyAnalyzer';

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
      pronunciation: calculateCriterionScore('Pronunciation', processedAudio.metrics, ''),
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

/**
 * Score a speaking response
 */
export const scoreSpeakingResponse = async (
  audioBlob: Blob, 
  question: AssessmentQuestion, 
  transcript?: string
): Promise<{
  score: number, 
  cefrLevel: CEFRLevel,
  detailedScores: Record<string, number>,
  feedback: Record<string, string>
}> => {
  // Process audio to get basic metrics
  const processedAudio = await processAudioForAssessment(audioBlob);
  
  // Create a metrics object that includes optional properties
  const enhancedMetrics = processedAudio.metrics as any;
  
  // If we have a transcript, enhance the audio metrics with vocabulary analysis
  if (transcript) {
    const vocabularyAnalysis = analyzeCefrVocabulary(transcript);
    enhancedMetrics.vocabularyScore = vocabularyAnalysis.vocabularyScore;
    enhancedMetrics.cefrVocabularyLevel = vocabularyAnalysis.cefrVocabularyLevel;
    enhancedMetrics.vocabularyJustification = vocabularyAnalysis.vocabularyJustification;
    enhancedMetrics.vocabularyDistribution = vocabularyAnalysis.wordDistribution;
  }
  
  // If we have a specific question with rubric, use that for more detailed scoring
  if (question?.rubric) {
    // Extract CEFR level from question ID or context
    const level = question.id.substring(0, 2).toUpperCase();
    
    // Generate detailed rubric with level-appropriate descriptors
    const enhancedRubric = generateRubricForQuestion(question, level);
    
    // Calculate scores for each criterion in the rubric
    const detailedScores: Record<string, number> = {};
    const feedback: Record<string, string> = {};
    
    if (enhancedRubric) {
      enhancedRubric.criteria.forEach(criterion => {
        // Calculate a score based on audio metrics and transcript analysis
        // This is a simplified version - in a real system, this would involve 
        // sophisticated NLP and speech analysis
        const score = calculateCriterionScore(
          criterion, 
          enhancedMetrics, 
          transcript || ''
        );
        
        detailedScores[criterion] = score;
        
        // Generate feedback for this criterion
        feedback[criterion] = getCriterionFeedback(criterion, score, level as any);
      });
    }
    
    // Calculate overall score
    const overallScore = Object.values(detailedScores).reduce((sum, score) => sum + score, 0) / 
                         Object.values(detailedScores).length;
    
    // Convert to 0-100 scale
    const finalScore = Math.round((overallScore / 10) * 100);
    
    // Determine CEFR level
    const cefrLevel = determineCEFRLevel(finalScore);
    
    return {
      score: finalScore,
      cefrLevel,
      detailedScores,
      feedback
    };
  }
  
  // Fallback to basic scoring if no rubric available
  const metrics = {
    fluency: processedAudio.metrics.fluency,
    // Use the updated pronunciation scoring logic
    pronunciation: calculateCriterionScore('Pronunciation', processedAudio.metrics, transcript || ''),
    prosody: processedAudio.metrics.prosody,
    // Use enhanced vocabulary scoring if transcript is available
    vocabulary: transcript ? calculateCriterionScore('Vocabulary', enhancedMetrics, transcript) : 7.5,
    // Basic estimates for other metrics
    grammar: 7.5,
    syntax: 7.5,
    coherence: 7.5
  };
  
  const totalScore = calculateTotalScore(metrics);
  const cefrLevel = determineCEFRLevel(totalScore);
  
  return {
    score: totalScore,
    cefrLevel,
    detailedScores: metrics,
    feedback: Object.keys(metrics).reduce((acc, key) => {
      acc[key] = getFeedbackForMetric(key, metrics[key as keyof typeof metrics], cefrLevel);
      return acc;
    }, {} as Record<string, string>)
  };
};
