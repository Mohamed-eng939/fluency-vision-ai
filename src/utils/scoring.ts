
import { AssessmentMetrics, CEFRLevel, AssessmentResult, AssessmentFeedback } from '../types/assessment';

/**
 * Calculate rubric score based on provided answers and questions
 */
export const calculateRubricScore = (
  answers: Record<string, any>, 
  questions: any[]
): { score: number; criteriaScores: Record<string, number> } => {
  // Implementation of rubric scoring
  const criteriaScores: Record<string, number> = {};
  let totalScore = 0;
  let maxPossibleScore = 0;
  
  questions.forEach(question => {
    if (!question.rubric || !question.rubric.criteria) {
      return;
    }
    
    const answer = answers[question.id];
    if (answer === undefined) return;
    
    // For each criterion, calculate score (simplified)
    question.rubric.criteria.forEach((criterion: string) => {
      // Simple mock score between 60-100%
      const criterionScore = Math.floor(Math.random() * 40) + 60;
      criteriaScores[criterion] = criterionScore;
      
      totalScore += criterionScore;
      maxPossibleScore += 100;
    });
  });
  
  // Calculate percentage
  const finalScore = maxPossibleScore > 0 ? Math.round((totalScore / maxPossibleScore) * 100) : 0;
  
  return {
    score: finalScore,
    criteriaScores
  };
};

/**
 * Determine CEFR level based on total score
 */
export const determineCEFRLevel = (score: number): CEFRLevel => {
  if (score >= 95) return 'C2';
  if (score >= 85) return 'C1+';
  if (score >= 80) return 'C1';
  if (score >= 75) return 'B2+';
  if (score >= 65) return 'B2';
  if (score >= 55) return 'B1+';
  if (score >= 50) return 'B1';
  if (score >= 45) return 'A2+';
  if (score >= 35) return 'A2';
  if (score >= 25) return 'A1+';
  if (score >= 15) return 'A1';
  return 'Pre-A1';
};

/**
 * Generate assessment result with detailed metrics and feedback
 */
export const generateAssessmentResult = (
  criteriaScores: Record<string, number>,
  totalScore: number
): AssessmentResult => {
  // Map criteria scores to metrics
  const metrics: AssessmentMetrics = {
    fluency: criteriaScores['Fluency'] || criteriaScores['Fluency & Coherence'] || 7,
    grammar: criteriaScores['Grammar'] || criteriaScores['Grammatical Range and Accuracy'] || 7,
    pronunciation: criteriaScores['Pronunciation'] || 7,
    prosody: criteriaScores['Prosody'] || criteriaScores['Intonation'] || 7,
    vocabulary: criteriaScores['Vocabulary'] || criteriaScores['Lexical Resource'] || 7,
    syntax: criteriaScores['Syntax'] || 7,
    coherence: criteriaScores['Coherence'] || 7
  };
  
  // Determine CEFR level
  const cefrLevel = determineCEFRLevel(totalScore);
  
  // Generate feedback
  const feedback: AssessmentFeedback = {
    fluency: generateFeedback('fluency', metrics.fluency, cefrLevel),
    grammar: generateFeedback('grammar', metrics.grammar, cefrLevel),
    pronunciation: generateFeedback('pronunciation', metrics.pronunciation, cefrLevel),
    prosody: generateFeedback('prosody', metrics.prosody, cefrLevel),
    vocabulary: generateFeedback('vocabulary', metrics.vocabulary, cefrLevel),
    syntax: generateFeedback('syntax', metrics.syntax, cefrLevel),
    coherence: generateFeedback('coherence', metrics.coherence, cefrLevel),
    overall: `Your overall performance is at ${cefrLevel} level.`
  };
  
  return {
    metrics,
    totalScore,
    cefrLevel,
    feedback
  };
};

/**
 * Generate feedback for a specific metric
 */
const generateFeedback = (metric: string, score: number, level: CEFRLevel): string => {
  if (score > 8) {
    return `Your ${metric} is excellent and exceeds the requirements for ${level}.`;
  } else if (score > 6) {
    return `Your ${metric} is good and meets the requirements for ${level}.`;
  } else if (score > 4) {
    return `Your ${metric} is adequate but needs improvement to fully meet ${level} standards.`;
  } else {
    return `Your ${metric} needs significant improvement to meet ${level} standards.`;
  }
};
