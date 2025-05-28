
import { 
  CEFRLevel, 
  AssessmentQuestion 
} from '../../../types/assessment';
import { processAudioForAssessment } from '../../speechAnalysisUtils';
import { generateRubricForQuestion } from '../../questionUtils';
import { calculateCriterionScore } from '../criterionScoring';
import { determineCEFRLevel } from '../coreScoring';
import { getFeedbackForMetric } from '../../speaking/feedbackUtils';
import { analyzeCefrVocabulary } from '../vocabulary/cefrVocabularyAnalyzer';
import { getCriterionFeedback } from '../feedbackScoring';

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
    return await scoreWithRubric(question, enhancedMetrics, transcript);
  }
  
  // Fallback to basic scoring if no rubric available
  return await basicScoring(processedAudio.metrics, enhancedMetrics, transcript);
};

/**
 * Score with a detailed rubric
 */
const scoreWithRubric = async (
  question: AssessmentQuestion,
  enhancedMetrics: any,
  transcript?: string
): Promise<{
  score: number, 
  cefrLevel: CEFRLevel,
  detailedScores: Record<string, number>,
  feedback: Record<string, string>
}> => {
  // Extract CEFR level from question ID or context
  const level = question.id.substring(0, 2).toUpperCase();
  
  // Generate detailed rubric with level-appropriate descriptors
  const enhancedRubric = generateRubricForQuestion(question, level);
  
  // Calculate scores for each criterion in the rubric
  const detailedScores: Record<string, number> = {};
  const feedback: Record<string, string> = {};
  
  if (enhancedRubric) {
    // Process criteria sequentially to handle async coherence scoring
    for (const criterion of enhancedRubric.criteria) {
      // Calculate a score based on audio metrics and transcript analysis
      const score = await calculateCriterionScore(
        criterion, 
        enhancedMetrics, 
        transcript || '',
        question.text // Pass the question text as prompt reference
      );
      
      detailedScores[criterion] = score;
      
      // Generate feedback for this criterion
      feedback[criterion] = getCriterionFeedback(criterion, score, level as any);
    }
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
};

/**
 * Basic scoring when no rubric is available
 */
const basicScoring = async (
  basicMetrics: any,
  enhancedMetrics: any,
  transcript?: string
): Promise<{
  score: number, 
  cefrLevel: CEFRLevel,
  detailedScores: Record<string, number>,
  feedback: Record<string, string>
}> => {
  const metrics = {
    fluency: basicMetrics.fluency,
    // Use the updated pronunciation scoring logic
    pronunciation: await calculateCriterionScore('Pronunciation', basicMetrics, transcript || ''),
    prosody: basicMetrics.prosody,
    // Use enhanced vocabulary scoring if transcript is available
    vocabulary: transcript ? await calculateCriterionScore('Vocabulary', enhancedMetrics, transcript) : 7.5,
    // Basic estimates for other metrics
    grammar: 7.5,
    syntax: 7.5,
    coherence: transcript ? await calculateCriterionScore('Coherence', enhancedMetrics, transcript) : 7.5
  };
  
  const totalScore = Object.values(metrics).reduce((sum, score) => sum + score, 0) / 
                     Object.keys(metrics).length * 10;
                     
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
