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
        metrics[metricKey] = (metrics[metricKey] + transcriptAnalysis[metricKey]) / 2;
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

/**
 * Analyze transcript for linguistic features
 */
const analyzeTranscript = (transcript: string): Partial<AssessmentMetrics> => {
  const metrics: Partial<AssessmentMetrics> = {};
  const wordCount = transcript.split(/\s+/).length;
  
  // Basic fluency analysis
  metrics.fluency = calculateFluencyScore(transcript);
  
  // Vocabulary analysis
  metrics.vocabulary = calculateVocabularyScore(transcript);
  
  // Grammar analysis
  metrics.grammar = calculateGrammarScore(transcript);
  
  // Coherence analysis
  metrics.coherence = calculateCoherenceScore(transcript);
  
  // Syntax complexity
  metrics.syntax = calculateSyntaxScore(transcript);
  
  return metrics;
};

/**
 * Calculate fluency score based on transcript features
 */
const calculateFluencyScore = (transcript: string): number => {
  const words = transcript.split(/\s+/);
  const wordCount = words.length;
  const uniqueWords = new Set(words.map(w => w.toLowerCase())).size;
  
  // Analyze for hesitations and fillers
  const fillerWords = ['um', 'uh', 'like', 'you know', 'well', 'so'];
  const fillerCount = words.filter(w => 
    fillerWords.includes(w.toLowerCase())
  ).length;
  
  // Calculate type-token ratio (lexical diversity)
  const ttr = uniqueWords / wordCount;
  
  // Calculate filler ratio
  const fillerRatio = fillerCount / wordCount;
  
  // Base score from 1-10
  let score = 7; // Default middle-high score
  
  // Adjust for lexical diversity
  if (ttr > 0.7) score += 1.5;
  else if (ttr > 0.6) score += 1;
  else if (ttr > 0.5) score += 0.5;
  else if (ttr < 0.4) score -= 1;
  
  // Adjust for fillers
  if (fillerRatio < 0.02) score += 1;
  else if (fillerRatio > 0.05) score -= 1;
  else if (fillerRatio > 0.1) score -= 2;
  
  // Ensure score is between 1-10
  return Math.max(1, Math.min(10, score));
};

/**
 * Calculate vocabulary score based on transcript content
 */
const calculateVocabularyScore = (transcript: string): number => {
  const text = transcript.toLowerCase();
  const words = text.split(/\s+/);
  
  // Advanced vocabulary markers
  const advancedWords = [
    'therefore', 'however', 'furthermore', 'consequently', 'nevertheless',
    'despite', 'although', 'nonetheless', 'moreover', 'subsequently',
    'particularly', 'significant', 'fundamental', 'essential', 'crucial',
    'perspective', 'substantial', 'demonstrate', 'establish', 'consider'
  ];
  
  // Count advanced words
  const advancedWordCount = words.filter(w => 
    advancedWords.includes(w.toLowerCase())
  ).length;
  
  // Calculate average word length
  const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
  
  // Base score
  let score = 6; // Default middle score
  
  // Adjust for advanced vocabulary
  const advancedRatio = advancedWordCount / words.length;
  if (advancedRatio > 0.1) score += 2;
  else if (advancedRatio > 0.05) score += 1;
  
  // Adjust for word length
  if (avgWordLength > 5.5) score += 1;
  else if (avgWordLength < 4) score -= 1;
  
  // Ensure score is between 1-10
  return Math.max(1, Math.min(10, score));
};

/**
 * Calculate grammar score based on transcript content
 */
const calculateGrammarScore = (transcript: string): number => {
  // Basic grammar patterns to check
  const text = transcript.toLowerCase();
  
  // Check for complex grammar structures
  const complexStructures = [
    /if.*would/,
    /had been/,
    /should have/,
    /might have/,
    /were to/,
    /not only.*but also/,
    /despite/,
    /nevertheless/,
    /whereas/
  ];
  
  const complexCount = complexStructures.filter(pattern => pattern.test(text)).length;
  
  // Check for common errors
  const commonErrors = [
    /he have/,
    /she have/,
    /it have/,
    /they is/,
    /we is/,
    /i is/
  ];
  
  const errorCount = commonErrors.filter(pattern => pattern.test(text)).length;
  
  // Base score
  let score = 7; // Default score
  
  // Adjust for complex structures
  score += complexCount * 0.5;
  
  // Adjust for errors
  score -= errorCount * 1.5;
  
  // Ensure score is between 1-10
  return Math.max(1, Math.min(10, score));
};

/**
 * Calculate coherence score based on transcript content
 */
const calculateCoherenceScore = (transcript: string): number => {
  const text = transcript.toLowerCase();
  const sentences = text.split(/[.!?]+/);
  
  // Check for discourse markers
  const discourseMarkers = [
    'first', 'second', 'third', 'finally', 'in conclusion',
    'for example', 'such as', 'similarly', 'in contrast',
    'however', 'therefore', 'thus', 'consequently'
  ];
  
  const markerCount = discourseMarkers.filter(marker => 
    text.includes(marker)
  ).length;
  
  // Base score
  let score = 6; // Default score
  
  // Adjust for discourse markers
  score += Math.min(markerCount, 4) * 0.5;
  
  // Adjust for sentence count
  if (sentences.length >= 5) score += 0.5;
  if (sentences.length >= 10) score += 0.5;
  
  // Ensure score is between 1-10
  return Math.max(1, Math.min(10, score));
};

/**
 * Calculate syntax score based on transcript content
 */
const calculateSyntaxScore = (transcript: string): number => {
  const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  // Calculate average sentence length
  const avgSentenceLength = transcript.split(/\s+/).length / sentences.length;
  
  // Check for complex syntax
  const complexSyntaxPatterns = [
    /although/,
    /despite/,
    /which/,
    /who/,
    /where/,
    /when/,
    /whose/,
    /however/
  ];
  
  let complexSyntaxCount = 0;
  sentences.forEach(sentence => {
    complexSyntaxPatterns.forEach(pattern => {
      if (pattern.test(sentence.toLowerCase())) {
        complexSyntaxCount++;
      }
    });
  });
  
  // Base score
  let score = 6; // Default score
  
  // Adjust for sentence length
  if (avgSentenceLength > 12) score += 1;
  if (avgSentenceLength > 15) score += 1;
  if (avgSentenceLength < 5) score -= 1;
  
  // Adjust for complex syntax
  score += Math.min(complexSyntaxCount / sentences.length * 4, 3);
  
  // Ensure score is between 1-10
  return Math.max(1, Math.min(10, score));
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
  if (score >= 90) return 'C1+';
  if (score >= 80) return 'C1';
  if (score >= 75) return 'B2+';
  if (score >= 65) return 'B2';
  if (score >= 60) return 'B1+';
  if (score >= 50) return 'B1';
  if (score >= 45) return 'A2+';
  if (score >= 35) return 'A2';
  if (score >= 30) return 'A1+';
  if (score >= 20) return 'A1';
  return 'Pre-A1';
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
    'Pre-A1': 'You can understand and use familiar everyday expressions aimed at satisfying basic needs.',
    'A1': 'You can use simple phrases and expressions related to basic personal information and concrete needs.',
    'A1+': 'You can engage in simple conversations on very familiar topics with additional vocabulary and understanding.',
    'A2': 'You can communicate in simple and routine tasks requiring a direct exchange of information on familiar topics.',
    'A2+': 'You can communicate with increased fluency on familiar topics and have a broader vocabulary range.',
    'B1': 'You can deal with most situations likely to arise while traveling in an area where the language is spoken.',
    'B1+': 'You can interact with a reasonable degree of fluency and spontaneity in familiar contexts.',
    'B2': 'You can interact with a degree of fluency and spontaneity that makes regular interaction with native speakers possible.',
    'B2+': 'You can express yourself fluently and effectively in most contexts with good structural control.',
    'C1': 'You can express yourself fluently and spontaneously without much obvious searching for expressions.',
    'C1+': 'You can express yourself with precision and nuance in almost all contexts.',
    'C2': 'You can express yourself spontaneously, very fluently and precisely, differentiating finer shades of meaning even in more complex situations.'
  };
  
  // Return the feedback for the level, or a default message if not found
  return feedbackMap[cefrLevel] || `You are at the ${cefrLevel} proficiency level according to the CEFR framework.`;
};
