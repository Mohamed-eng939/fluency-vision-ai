
import { AssessmentResult } from '@/types/assessment';
import { MistakeItem } from '@/components/assessment/mistakes/types';

/**
 * Analyze pronunciation mistakes using MFA results
 */
export const analyzePronunciationMistakes = (result: AssessmentResult): {
  mistakes: MistakeItem[];
  summaryStats?: any;
} => {
  const mistakes: MistakeItem[] = [];
  let summaryStats = undefined;

  // Check if we have detailed pronunciation analysis from MFA
  const pronunciationDetails = result.audioAnalysis?.pronunciationDetails;
  
  if (pronunciationDetails) {
    // Add summary statistics
    const cefrLevel = pronunciationDetails.cefr_level;
    const overallScore = pronunciationDetails.pronunciation_score;
    
    // Determine target speech rate based on CEFR level
    const getTargetSpeechRate = (cefr: string) => {
      switch (cefr) {
        case 'A1': case 'A2': return '80-120 wpm';
        case 'B1': return '120-150 wpm';
        case 'B2': return '140-170 wpm';
        case 'C1': case 'C2': return '160-200 wpm';
        default: return '120-150 wpm';
      }
    };

    summaryStats = {
      wordAccuracy: pronunciationDetails.word_accuracy,
      phonemeAccuracy: pronunciationDetails.phoneme_accuracy,
      speechRate: pronunciationDetails.speech_rate,
      targetSpeechRate: getTargetSpeechRate(cefrLevel),
      overallScore,
      cefrLevel
    };

    // Process problematic phonemes
    if (pronunciationDetails.problematic_phonemes?.length > 0) {
      pronunciationDetails.problematic_phonemes.forEach(phoneme => {
        const practiceExamples = getPracticeExamples(phoneme.phone);
        
        mistakes.push({
          original: phoneme.phone,
          correction: '',
          suggestion: `Practice the /${phoneme.phone}/ sound with words like: ${practiceExamples.join(', ')}. ${getPhonemeAdvice(phoneme.phone, phoneme.issue)}`,
          cefrLevel: cefrLevel,
          context: `Pronunciation difficulty`,
          phoneme: phoneme.phone,
          issue: phoneme.issue,
          startTime: phoneme.start,
          endTime: phoneme.end
        });
      });
    }

    // Add general pronunciation feedback if score is below expectations
    if (overallScore < 6.0) {
      mistakes.push({
        original: 'Overall pronunciation',
        correction: '',
        suggestion: `Your pronunciation score of ${overallScore.toFixed(1)} suggests ${cefrLevel}-level clarity. Focus on clear articulation and consistent speech rhythm.`,
        cefrLevel: cefrLevel,
        context: 'General pronunciation feedback'
      });
    }
  }

  return { mistakes, summaryStats };
};

/**
 * Get practice examples for specific phonemes
 */
export const getPracticeExamples = (phoneme: string): string[] => {
  const examples: Record<string, string[]> = {
    'θ': ['think', 'path', 'math', 'thank'],
    'ð': ['this', 'that', 'mother', 'weather'],
    'r': ['red', 'car', 'right', 'room'],
    'l': ['light', 'call', 'ball', 'letter'],
    'w': ['water', 'window', 'work', 'warm'],
    'v': ['very', 'have', 'voice', 'seven'],
    'f': ['first', 'coffee', 'phone', 'laugh'],
    'ʃ': ['ship', 'fish', 'wash', 'sure'],
    'ʒ': ['measure', 'vision', 'garage', 'usual'],
    'tʃ': ['chair', 'watch', 'teacher', 'much'],
    'dʒ': ['jump', 'orange', 'age', 'bridge'],
    'ŋ': ['ring', 'song', 'thing', 'morning']
  };
  
  return examples[phoneme] || ['practice', 'repeat', 'listen', 'focus'];
};

/**
 * Get specific advice for phoneme issues
 */
export const getPhonemeAdvice = (phoneme: string, issue: string): string => {
  const advice: Record<string, Record<string, string>> = {
    'θ': {
      'too_short': 'Place your tongue between your teeth and blow air gently.',
      'unclear': 'Make sure your tongue tip touches your upper teeth.',
      'default': 'This is the "th" sound in "think" - tongue between teeth.'
    },
    'ð': {
      'too_short': 'Use your voice while placing tongue between teeth.',
      'unclear': 'This is the voiced "th" sound - feel the vibration.',
      'default': 'This is the "th" sound in "this" - voiced, tongue between teeth.'
    },
    'r': {
      'too_short': 'Curl your tongue tip slightly back and hold the position.',
      'unclear': 'Don\'t let your tongue touch the roof of your mouth.',
      'default': 'Keep your tongue curved and lips slightly rounded.'
    }
  };

  return advice[phoneme]?.[issue] || advice[phoneme]?.['default'] || 'Practice this sound slowly and clearly.';
};
