
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
  // Quality control checks
  if (!transcript || transcript.trim().split(/\s+/).length < 10) {
    // Special case for Q2 (phone number) - allow shorter responses
    if (question.id !== 'Q2_A1') {
      throw new Error('Insufficient data for reliable scoring. Please provide a more detailed response (at least 10 words).');
    }
  }
  
  // Special case for Q2 - phone number pronunciation assessment
  if (question.id === 'Q2_A1') {
    return await scorePhoneNumberResponse(audioBlob, transcript);
  }
  
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
 * Special scoring for Q2 - phone number pronunciation
 */
const scorePhoneNumberResponse = async (
  audioBlob: Blob,
  transcript?: string
): Promise<{
  score: number, 
  cefrLevel: CEFRLevel,
  detailedScores: Record<string, number>,
  feedback: Record<string, string>
}> => {
  // Process audio to get pronunciation metrics
  const processedAudio = await processAudioForAssessment(audioBlob);
  
  // For phone numbers, focus primarily on pronunciation clarity
  const pronunciationScore = await calculateCriterionScore('Pronunciation', processedAudio.metrics, transcript || '');
  
  // Check if transcript contains digits/numbers
  const hasNumbers = transcript && /\d/.test(transcript);
  const numberClarity = hasNumbers ? 8.5 : 6.0; // Bonus for clear number pronunciation
  
  // Simple scoring focused on pronunciation and clarity
  const detailedScores = {
    pronunciation: pronunciationScore,
    clarity: numberClarity,
    task_completion: transcript && transcript.length > 5 ? 8.0 : 6.0
  };
  
  // Calculate average score
  const averageScore = Object.values(detailedScores).reduce((sum, score) => sum + score, 0) / 
                       Object.values(detailedScores).length;
  
  // Convert to 0-100 scale
  const finalScore = Math.round((averageScore / 10) * 100);
  
  // Phone number responses are typically A1 level with focus on pronunciation
  const cefrLevel: CEFRLevel = finalScore >= 80 ? 'A2' : 'A1';
  
  const feedback = {
    pronunciation: finalScore >= 80 
      ? "Clear pronunciation of numbers. Well done!" 
      : "Practice pronouncing numbers more clearly.",
    clarity: hasNumbers 
      ? "Numbers were recognized in your response." 
      : "Try to include clear digit pronunciation.",
    task_completion: transcript && transcript.length > 5
      ? "Task completed appropriately."
      : "Response could be more complete."
  };
  
  return {
    score: finalScore,
    cefrLevel,
    detailedScores,
    feedback
  };
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
