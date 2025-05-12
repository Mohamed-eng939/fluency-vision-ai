
import { CEFRLevel } from '../../types/assessment';

/**
 * Get CEFR-specific feedback phrases for a specific skill metric
 */
export const getCEFRSpecificFeedback = (metric: string, level: CEFRLevel): Record<string, string> => {
  const feedbackMap: Record<string, Record<CEFRLevel, Record<string, string>>> = {
    'fluency': {
      'C2': {
        excellent: 'You express yourself spontaneously, very fluently and precisely.',
        good: 'You can express yourself fluently with only occasional hesitation.',
        adequate: 'You can maintain fluent speech but with some noticeable effort.',
        needs_improvement: 'Your speech shows frequent hesitation and reformulation.'
      },
      'C1': {
        excellent: 'You can express yourself fluently and spontaneously without much obvious searching for expressions.',
        good: 'You can produce stretches of language with a fairly even tempo with few noticeably long pauses.',
        adequate: 'You can keep going comprehensibly, even though pausing for grammatical and lexical planning is evident.',
        needs_improvement: 'Your speech contains many hesitations and interruptions.'
      },
      'B2': {
        excellent: 'You can produce stretches of language with a fairly even tempo with few noticeably long pauses.',
        good: 'You can communicate with a degree of fluency and spontaneity.',
        adequate: 'You can speak with reasonable fluency despite some formulation problems.',
        needs_improvement: 'Your speech is often hesitant with frequent pauses.'
      },
      'B1': {
        excellent: 'You can express yourself with relative ease despite some pauses.',
        good: 'You can keep going comprehensibly, even though pausing is evident.',
        adequate: 'You can make yourself understood with some effort.',
        needs_improvement: 'Your speech is characterized by frequent pauses and reformulations.'
      },
      'A2': {
        excellent: 'You can make yourself understood in short contributions.',
        good: 'You can construct phrases on familiar topics with sufficient ease.',
        adequate: 'You can manage short, isolated utterances with pauses.',
        needs_improvement: 'Your speech consists of very short, isolated utterances with frequent pauses.'
      },
      'A1': {
        excellent: 'You can manage very short, isolated, rehearsed utterances.',
        good: 'You can produce basic phrases with some effort.',
        adequate: 'You can produce simple sentences with significant pauses.',
        needs_improvement: 'You can only produce words and very simple phrases with difficulty.'
      },
      'Pre-A1': {
        excellent: 'You can say some isolated words related to personal information.',
        good: 'You can produce a few basic words with support.',
        adequate: 'You can repeat some basic words when prompted.',
        needs_improvement: 'You are still developing the ability to produce basic words.'
      },
      'A1+': { 
        excellent: 'You can manage short utterances with minimal hesitation.',
        good: 'You can produce simple phrases with reasonable ease.',
        adequate: 'You can produce basic utterances with some pausing.',
        needs_improvement: 'You struggle to produce complete utterances.'
      },
      'A2+': { 
        excellent: 'You can express yourself on familiar topics with reasonable fluency.',
        good: 'You can make yourself understood with some confidence.',
        adequate: 'You can speak with some fluency on familiar topics.',
        needs_improvement: 'Your speech is hesitant even on familiar topics.'
      },
      'B1+': { 
        excellent: 'You can communicate with good fluency on familiar topics.',
        good: 'You can express yourself with relatively few pauses.',
        adequate: 'You can maintain conversation with some pauses.',
        needs_improvement: 'Your speech contains frequent hesitation.'
      },
      'B2+': { 
        excellent: 'You communicate with good fluency and spontaneity.',
        good: 'You can interact with a good degree of fluency.',
        adequate: 'You can maintain conversation with reasonable fluency.',
        needs_improvement: 'Your speech lacks the fluency expected at this level.'
      },
      'C1+': { 
        excellent: 'You express yourself fluently and spontaneously with ease.',
        good: 'You can communicate very fluently with minimal hesitation.',
        adequate: 'You can express yourself with good fluency.',
        needs_improvement: 'Your fluency is inconsistent for this level.'
      },
      'Below Pre-A1': {
        excellent: 'You can produce a few isolated words related to basic needs.',
        good: 'You can repeat some basic words with support.',
        adequate: 'You can use a few memorized words or phrases.',
        needs_improvement: 'You are at the beginning stages of developing oral language ability.'
      },
      'N/A': {
        excellent: 'Your fluency cannot be assessed within standard CEFR frameworks.',
        good: 'Your fluency shows good qualities outside standard frameworks.',
        adequate: 'Your fluency demonstrates basic competence outside standard frameworks.',
        needs_improvement: 'Your fluency needs development outside standard assessment frameworks.'
      }
    },
    // Add other metrics with their level-specific feedback...
  };

  // Default feedback if specific metric/level combination not found
  return feedbackMap[metric]?.[level] || {
    excellent: 'Excellent work!',
    good: 'Good effort.',
    adequate: 'Adequate performance.',
    needs_improvement: 'This area needs improvement.'
  };
};

/**
 * Get overall feedback based on CEFR level
 */
export const getOverallFeedback = (cefrLevel: CEFRLevel): string => {
  const feedbackMap: Record<CEFRLevel, string> = {
    'C2': 'You demonstrate mastery of the language at a professional level. Your speech is fluent, precise, and nuanced.',
    'C1': 'You can use the language flexibly and effectively for social, academic, and professional purposes.',
    'B2': 'You can interact with a degree of fluency and spontaneity that makes regular interaction with native speakers possible without strain.',
    'B1': 'You can deal with most situations likely to arise while traveling in an area where the language is spoken.',
    'A2': 'You can communicate in simple and routine tasks requiring a simple and direct exchange of information.',
    'A1': 'You can interact in a simple way provided the other person talks slowly and clearly and is prepared to help.',
    'Pre-A1': 'You are beginning to develop basic language skills and can use a few isolated words and phrases.',
    'A1+': 'You can communicate at a basic level about personal information and immediate needs.',
    'A2+': 'You can handle social exchanges with confidence, going beyond basic routine exchanges.',
    'B1+': 'You can communicate with some confidence on familiar matters and maintain conversation on a fairly wide range of topics.',
    'B2+': 'You can communicate effectively and connect ideas fluently across a range of topics.',
    'C1+': 'You have near-native fluency and can engage in extended, sophisticated discourse.',
    'Below Pre-A1': 'You are at the very initial stages of language learning, beginning to recognize and use a few isolated words.',
    'N/A': 'Your language proficiency falls outside the standard CEFR framework.'
  };

  return feedbackMap[cefrLevel] || 'Your language proficiency has been assessed.';
};

/**
 * Generate metric-specific feedback
 */
export const getFeedbackForMetric = (metric: string, score: number, cefrLevel: CEFRLevel): string => {
  const cefrSpecificFeedback = getCEFRSpecificFeedback(metric, cefrLevel);
  
  if (score > 8) {
    return `${cefrSpecificFeedback.excellent} Your ${metric} is excellent and exceeds ${cefrLevel} level expectations.`;
  } else if (score > 6) {
    return `${cefrSpecificFeedback.good} Your ${metric} is good for ${cefrLevel} level, with some areas for improvement.`;
  } else if (score > 4) {
    return `${cefrSpecificFeedback.adequate} Your ${metric} meets basic ${cefrLevel} level requirements, but needs development.`;
  } else {
    return `${cefrSpecificFeedback.needs_improvement} Your ${metric} needs significant improvement to reach ${cefrLevel} level standards.`;
  }
};
