import { AssessmentMetrics, CEFRLevel, AssessmentFeedback } from '../../types/assessment';

/**
 * Generate detailed feedback based on metrics and CEFR level
 */
export const generateDetailedFeedback = (metrics: AssessmentMetrics, cefrLevel: CEFRLevel): AssessmentFeedback => {
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

export const getFeedbackForMetric = (metricName: string, score: number, cefrLevel: CEFRLevel): string => {
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

export const getOverallFeedback = (cefrLevel: CEFRLevel): string => {
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
    'C2': 'You can express yourself spontaneously, very fluently and precisely, differentiating finer shades of meaning even in more complex situations.',
    'Below Pre-A1': 'You are at the very beginning of your language learning journey and can recognize or use a few isolated words and phrases.',
    'N/A': 'Your language proficiency falls outside the standard CEFR framework assessment.'
  };
  
  // Return the feedback for the level, or a default message if not found
  return feedbackMap[cefrLevel] || `You are at the ${cefrLevel} proficiency level according to the CEFR framework.`;
};
