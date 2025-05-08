
import { AssessmentMetrics, AssessmentResult, CEFRLevel, AssessmentFeedback } from "../types/assessment";

// Mock implementation for demo purposes
// In a real app, this would connect to a backend AI service
export const analyzeAudio = (audioBlob: Blob): Promise<AssessmentResult> => {
  return new Promise((resolve) => {
    // Simulate processing time
    setTimeout(() => {
      const metrics: AssessmentMetrics = {
        fluency: Math.random() * 5 + 5, // 5-10
        grammar: Math.random() * 5 + 5,
        pronunciation: Math.random() * 5 + 5,
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

export const calculateTotalScore = (metrics: AssessmentMetrics): number => {
  const { fluency, grammar, pronunciation, prosody, vocabulary, syntax, coherence } = metrics;
  const sum = fluency + grammar + pronunciation + prosody + vocabulary + syntax + coherence;
  // Convert to a score out of 100
  return Math.round((sum / 70) * 100);
};

export const determineCEFRLevel = (score: number): CEFRLevel => {
  if (score >= 95) return 'C2';
  if (score >= 80) return 'C1';
  if (score >= 65) return 'B2';
  if (score >= 50) return 'B1';
  if (score >= 35) return 'A2';
  return 'A1';
};

export const generateFeedback = (metrics: AssessmentMetrics, cefrLevel: CEFRLevel): AssessmentFeedback => {
  // This would typically involve more sophisticated logic based on actual speech analysis
  // For now, we'll return templated feedback based on score ranges
  
  return {
    fluency: getFeedbackForMetric('fluency', metrics.fluency),
    grammar: getFeedbackForMetric('grammar', metrics.grammar),
    pronunciation: getFeedbackForMetric('pronunciation', metrics.pronunciation),
    prosody: getFeedbackForMetric('prosody', metrics.prosody),
    vocabulary: getFeedbackForMetric('vocabulary', metrics.vocabulary),
    syntax: getFeedbackForMetric('syntax', metrics.syntax),
    coherence: getFeedbackForMetric('coherence', metrics.coherence),
    overall: getOverallFeedback(cefrLevel)
  };
};

const getFeedbackForMetric = (metric: string, score: number): string => {
  if (score > 8) {
    return `Your ${metric} is excellent. You demonstrate native-like proficiency in this area.`;
  } else if (score > 6) {
    return `Your ${metric} is good. You demonstrate clear competence with minor areas for improvement.`;
  } else if (score > 4) {
    return `Your ${metric} is adequate. There are several areas where you could improve.`;
  } else {
    return `Your ${metric} needs significant improvement. Focus on developing basic skills in this area.`;
  }
};

const getOverallFeedback = (cefrLevel: CEFRLevel): string => {
  switch(cefrLevel) {
    case 'C2':
      return 'You demonstrate mastery of the language at a professional level. Your speech is fluent, precise, and nuanced.';
    case 'C1':
      return 'You can use the language flexibly and effectively for social, academic, and professional purposes.';
    case 'B2':
      return 'You can interact with a degree of fluency and spontaneity that makes regular interaction with native speakers possible without strain.';
    case 'B1':
      return 'You can deal with most situations likely to arise while traveling in an area where the language is spoken.';
    case 'A2':
      return 'You can communicate in simple and routine tasks requiring a simple and direct exchange of information.';
    case 'A1':
      return 'You can interact in a simple way provided the other person talks slowly and clearly and is prepared to help.';
    default:
      return 'Your language proficiency has been assessed.';
  }
};

export const mockPrompts = [
  {
    id: '1',
    text: 'Describe your favorite place to visit and explain why it is special to you.',
    category: 'describe',
    difficulty: 'beginner',
    timeLimit: 60
  },
  {
    id: '2',
    text: 'Do you think technology has had a positive or negative impact on education? Support your opinion with examples.',
    category: 'argue',
    difficulty: 'intermediate',
    timeLimit: 90
  },
  {
    id: '3',
    text: 'Explain the process of learning a new language. What steps would you recommend to someone who wants to become fluent?',
    category: 'explain',
    difficulty: 'intermediate',
    timeLimit: 90
  },
  {
    id: '4',
    text: 'Tell a story about a time when you overcame a significant challenge in your life.',
    category: 'narrate',
    difficulty: 'advanced',
    timeLimit: 120
  }
] as const;
