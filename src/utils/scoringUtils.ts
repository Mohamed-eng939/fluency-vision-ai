
import { 
  AssessmentQuestion, 
  AssessmentResult,
  CEFRLevel,
  AssessmentMetrics,
  AssessmentFeedback
} from '../types/assessment';

/**
 * Calculate score based on rubric criteria
 * @param userAnswers User's answers to the questions
 * @param questions Questions with their rubrics
 */
export const calculateRubricScore = (
  userAnswers: Record<string, any>,
  questions: AssessmentQuestion[]
): { score: number; criteriaScores: Record<string, number> } => {
  // Initialize scores object
  const criteriaScores: Record<string, number> = {};
  let totalAvailablePoints = 0;
  let totalEarnedPoints = 0;
  
  // Process each question with a rubric
  questions.forEach(question => {
    if (!question.rubric) return;
    
    const answer = userAnswers[question.id];
    if (!answer) return;
    
    // Evaluate each criterion in the rubric
    question.rubric.criteria.forEach(criterion => {
      // For this mock implementation, we assign a score between 1-5 based on pre-defined logic
      // In a real app, this would use AI or more complex evaluation
      const score = getScoreForCriterion(criterion, answer, question);
      
      // Add to criteria scores
      if (!criteriaScores[criterion]) {
        criteriaScores[criterion] = 0;
      }
      criteriaScores[criterion] += score;
      
      // Add to totals
      totalAvailablePoints += 5; // Maximum score per criterion is 5
      totalEarnedPoints += score;
    });
  });
  
  // Calculate percentage score (0-100)
  const score = totalAvailablePoints > 0 
    ? (totalEarnedPoints / totalAvailablePoints) * 100 
    : 0;
  
  return { score, criteriaScores };
};

/**
 * Mock function to calculate a score for a specific criterion
 * In a real app, this would use AI or more complex evaluation
 */
const getScoreForCriterion = (
  criterionName: string, 
  userAnswer: any, 
  question: AssessmentQuestion
): number => {
  // Mock evaluation logic - in a real app, this would be more sophisticated
  if (typeof userAnswer === 'string') {
    // For text answers, evaluate based on length and complexity
    if (userAnswer.length > 100) return 4; // Good length
    if (userAnswer.length > 50) return 3; // Moderate length
    if (userAnswer.length > 20) return 2; // Short but acceptable
    return 1; // Too short
  }
  
  // For multiple choice or matching questions
  if (question.correctAnswer) {
    if (Array.isArray(question.correctAnswer)) {
      // For multiple correct answers
      if (Array.isArray(userAnswer)) {
        const correctCount = userAnswer.filter(ans => 
          question.correctAnswer!.includes(ans)
        ).length;
        const totalCorrect = question.correctAnswer.length;
        return Math.ceil((correctCount / totalCorrect) * 5);
      }
    } else {
      // Single correct answer
      return userAnswer === question.correctAnswer ? 5 : 1;
    }
  }
  
  // Default score for other types
  return 3;
};

/**
 * Generate a comprehensive assessment result
 */
export const generateAssessmentResult = (
  criteriaScores: Record<string, number>,
  totalScore: number
): AssessmentResult => {
  const metrics = mapCriteriaToMetrics(criteriaScores);
  const cefrLevel = determineCEFRLevel(totalScore);
  const feedback = generateDetailedFeedback(metrics, cefrLevel);
  
  return {
    metrics,
    totalScore,
    cefrLevel,
    feedback
  };
};

/**
 * Map criteria scores to standard assessment metrics
 */
const mapCriteriaToMetrics = (criteriaScores: Record<string, number>): AssessmentMetrics => {
  // Initialize with default values
  const metrics: AssessmentMetrics = {
    fluency: 5,
    grammar: 5,
    pronunciation: 5,
    prosody: 5,
    vocabulary: 5,
    syntax: 5,
    coherence: 5
  };
  
  // Map criteria scores to metrics
  // This is a simplified mapping - in a real app, would be more sophisticated
  if (criteriaScores['Fluency & Coherence']) {
    metrics.fluency = criteriaScores['Fluency & Coherence'];
    metrics.coherence = criteriaScores['Fluency & Coherence'];
  }
  
  if (criteriaScores['Lexical Resource']) {
    metrics.vocabulary = criteriaScores['Lexical Resource'];
  }
  
  if (criteriaScores['Grammatical Range']) {
    metrics.grammar = criteriaScores['Grammatical Range'];
    metrics.syntax = criteriaScores['Grammatical Range'];
  }
  
  if (criteriaScores['Pronunciation']) {
    metrics.pronunciation = criteriaScores['Pronunciation'];
    metrics.prosody = criteriaScores['Pronunciation'];
  }
  
  return metrics;
};

/**
 * Determine CEFR level based on total score
 */
export const determineCEFRLevel = (score: number): CEFRLevel => {
  if (score >= 95) return 'C2';
  if (score >= 80) return 'C1';
  if (score >= 65) return 'B2';
  if (score >= 50) return 'B1';
  if (score >= 35) return 'A2';
  return 'A1';
};

/**
 * Generate detailed feedback based on metrics and CEFR level
 */
const generateDetailedFeedback = (metrics: AssessmentMetrics, cefrLevel: CEFRLevel): AssessmentFeedback => {
  const feedback: AssessmentFeedback = {
    fluency: getFeedbackForMetric('fluency', metrics.fluency, cefrLevel),
    grammar: getFeedbackForMetric('grammar', metrics.grammar, cefrLevel),
    pronunciation: getFeedbackForMetric('pronunciation', metrics.pronunciation, cefrLevel),
    prosody: getFeedbackForMetric('prosody', metrics.prosody, cefrLevel),
    vocabulary: getFeedbackForMetric('vocabulary', metrics.vocabulary, cefrLevel),
    syntax: getFeedbackForMetric('syntax', metrics.syntax, cefrLevel),
    coherence: getFeedbackForMetric('coherence', metrics.coherence, cefrLevel),
    overall: getOverallFeedback(cefrLevel)
  };
  
  return feedback;
};

const getFeedbackForMetric = (metricName: string, score: number, cefrLevel: CEFRLevel): string => {
  // Feedback templates based on score and CEFR level
  const feedbackTemplates = {
    high: {
      fluency: `Your fluency is excellent for ${cefrLevel} level. You speak naturally with minimal hesitation.`,
      grammar: `Your grammar usage is very accurate for ${cefrLevel} level with minimal errors.`,
      pronunciation: `Your pronunciation is clear and natural, appropriate for ${cefrLevel} level.`,
      prosody: `Your intonation and rhythm are natural and expressive at ${cefrLevel} level.`,
      vocabulary: `You use a wide range of vocabulary appropriate for ${cefrLevel} level.`,
      syntax: `Your sentence structures are varied and complex, suitable for ${cefrLevel} level.`,
      coherence: `Your ideas are logically organized and coherently connected at ${cefrLevel} level.`
    },
    medium: {
      fluency: `Your fluency is good for ${cefrLevel} level, with some hesitations.`,
      grammar: `You demonstrate good control of grammar for ${cefrLevel} level with some errors.`,
      pronunciation: `Your pronunciation is generally clear with some inconsistencies at ${cefrLevel} level.`,
      prosody: `Your intonation is appropriate with some unnatural patterns at ${cefrLevel} level.`,
      vocabulary: `You use adequate vocabulary for ${cefrLevel} level but could expand your range.`,
      syntax: `You use a mix of simple and complex sentences appropriate for ${cefrLevel} level.`,
      coherence: `Your ideas are generally well-organized at ${cefrLevel} level with some gaps.`
    },
    low: {
      fluency: `Your fluency needs improvement for ${cefrLevel} level. Try to reduce hesitations.`,
      grammar: `Your grammar shows frequent errors for ${cefrLevel} level. Focus on accuracy.`,
      pronunciation: `Your pronunciation needs work for ${cefrLevel} level. Practice key sounds.`,
      prosody: `Your intonation and rhythm need improvement for natural speech at ${cefrLevel} level.`,
      vocabulary: `Your vocabulary range is limited for ${cefrLevel} level. Work on expanding it.`,
      syntax: `Your sentence structures are basic for ${cefrLevel} level. Practice more complex patterns.`,
      coherence: `Your ideas lack clear organization at ${cefrLevel} level. Work on logical flow.`
    }
  };

  // Determine feedback category based on score
  let category: 'high' | 'medium' | 'low';
  if (score >= 7) category = 'high';
  else if (score >= 4) category = 'medium';
  else category = 'low';

  // Return appropriate feedback
  return feedbackTemplates[category][metricName as keyof typeof feedbackTemplates.high];
};

const getOverallFeedback = (cefrLevel: CEFRLevel): string => {
  const feedbackMap: Record<CEFRLevel, string> = {
    'A1': 'You can use simple phrases and expressions related to basic personal information and concrete needs.',
    'A2': 'You can communicate in simple and routine tasks requiring a direct exchange of information on familiar topics.',
    'B1': 'You can deal with most situations likely to arise while traveling in an area where the language is spoken.',
    'B2': 'You can interact with a degree of fluency and spontaneity that makes regular interaction with native speakers possible.',
    'C1': 'You can express yourself fluently and spontaneously without much obvious searching for expressions.',
    'C2': 'You can express yourself spontaneously, very fluently and precisely, differentiating finer shades of meaning even in more complex situations.'
  };
  
  return feedbackMap[cefrLevel];
};
