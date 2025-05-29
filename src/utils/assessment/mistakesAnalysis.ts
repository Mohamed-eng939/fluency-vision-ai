import React from 'react';
import { AssessmentResult } from '@/types/assessment';
import { detectRepetitions } from './fluency/repetitionDetector';
import { detectHesitationMarkers } from '../audio/hesitationDetector';
import { splitIntoSentences } from './coherence/sentenceAnalysis';

interface MistakeItem {
  original: string;
  correction: string;
  suggestion: string;
  cefrLevel?: string;
  context?: string;
  phoneme?: string;
  issue?: string;
  startTime?: number;
  endTime?: number;
}

interface MistakeCategory {
  name: string;
  mistakes: MistakeItem[];
  icon: React.ReactNode;
  color: string;
  summaryStats?: {
    wordAccuracy?: number;
    phonemeAccuracy?: number;
    speechRate?: number;
    targetSpeechRate?: string;
    overallScore?: number;
    cefrLevel?: string;
  };
}

/**
 * Analyze mistakes from assessment result using current detection capabilities
 */
export const analyzeMistakes = (result: AssessmentResult): MistakeCategory[] => {
  const categories: MistakeCategory[] = [];
  const transcript = result.transcript || '';
  
  if (!transcript) return categories;

  // Pronunciation mistakes (MFA-powered)
  const pronunciationMistakes = analyzePronunciationMistakes(result);
  if (pronunciationMistakes.mistakes.length > 0 || pronunciationMistakes.summaryStats) {
    categories.push({
      name: 'Pronunciation Issues',
      mistakes: pronunciationMistakes.mistakes,
      icon: React.createElement('div', { className: 'w-4 h-4 bg-pink-500 rounded' }),
      color: 'bg-pink-100 text-pink-800',
      summaryStats: pronunciationMistakes.summaryStats
    });
  }

  // Grammar mistakes
  const grammarMistakes = analyzeGrammarMistakes(transcript);
  if (grammarMistakes.length > 0) {
    categories.push({
      name: 'Grammar',
      mistakes: grammarMistakes,
      icon: React.createElement('div', { className: 'w-4 h-4 bg-red-500 rounded' }),
      color: 'bg-red-100 text-red-800'
    });
  }

  // Fluency issues
  const fluencyMistakes = analyzeFluencyMistakes(transcript);
  if (fluencyMistakes.length > 0) {
    categories.push({
      name: 'Fluency & Speech Flow',
      mistakes: fluencyMistakes,
      icon: React.createElement('div', { className: 'w-4 h-4 bg-orange-500 rounded' }),
      color: 'bg-orange-100 text-orange-800'
    });
  }

  // Structure and coherence
  const structureMistakes = analyzeStructureMistakes(transcript, result);
  if (structureMistakes.length > 0) {
    categories.push({
      name: 'Sentence Structure & Coherence',
      mistakes: structureMistakes,
      icon: React.createElement('div', { className: 'w-4 h-4 bg-blue-500 rounded' }),
      color: 'bg-blue-100 text-blue-800'
    });
  }

  // Vocabulary issues (basic analysis)
  const vocabularyMistakes = analyzeVocabularyMistakes(transcript);
  if (vocabularyMistakes.length > 0) {
    categories.push({
      name: 'Vocabulary & Word Choice',
      mistakes: vocabularyMistakes,
      icon: React.createElement('div', { className: 'w-4 h-4 bg-purple-500 rounded' }),
      color: 'bg-purple-100 text-purple-800'
    });
  }

  return categories;
};

/**
 * Analyze pronunciation mistakes using MFA results
 */
const analyzePronunciationMistakes = (result: AssessmentResult): {
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
const getPracticeExamples = (phoneme: string): string[] => {
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
const getPhonemeAdvice = (phoneme: string, issue: string): string => {
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

/**
 * Analyze grammar mistakes using current detection methods
 */
const analyzeGrammarMistakes = (transcript: string): MistakeItem[] => {
  const mistakes: MistakeItem[] = [];
  
  // Detect subject-verb agreement errors
  const svAgreementErrors = [
    { pattern: /\b(he|she|it)\s+(go|come|do|have)\b/gi, correction: (match: string) => match.replace(/(go|come|do|have)/, m => m + 's') },
    { pattern: /\b(I|you|we|they)\s+(goes|comes|does|has)\b/gi, correction: (match: string) => match.replace(/(goes|comes|does|has)/, m => m.slice(0, -1)) }
  ];

  svAgreementErrors.forEach(({ pattern, correction }) => {
    const matches = transcript.match(pattern);
    if (matches) {
      matches.forEach(match => {
        mistakes.push({
          original: match,
          correction: correction(match),
          suggestion: 'Review subject-verb agreement rules. The verb must agree with the subject in number.',
          cefrLevel: 'A2',
          context: 'Subject-verb agreement'
        });
      });
    }
  });

  // Detect tense inconsistencies (simple patterns)
  const tenseErrors = [
    { pattern: /\beated\b/gi, correction: 'ate', suggestion: 'Learn irregular past tense verbs. "Eat" becomes "ate" in past tense.' },
    { pattern: /\bgoed\b/gi, correction: 'went', suggestion: 'Learn irregular past tense verbs. "Go" becomes "went" in past tense.' },
    { pattern: /\bcomed\b/gi, correction: 'came', suggestion: 'Learn irregular past tense verbs. "Come" becomes "came" in past tense.' }
  ];

  tenseErrors.forEach(({ pattern, correction, suggestion }) => {
    const matches = transcript.match(pattern);
    if (matches) {
      matches.forEach(match => {
        mistakes.push({
          original: match,
          correction,
          suggestion,
          cefrLevel: 'A2',
          context: 'Irregular past tense'
        });
      });
    }
  });

  // Detect missing articles (basic patterns)
  const articleErrors = [
    { pattern: /\b(go to|at|in)\s+(school|university|hospital)\b/gi, context: 'Should typically use "the" with these institutions when referring to the building' },
    { pattern: /\bI am\s+([a-z]+er|teacher|doctor|student)\b/gi, context: 'Professions usually need an article: "I am a teacher"' }
  ];

  articleErrors.forEach(({ pattern, context }) => {
    const matches = transcript.match(pattern);
    if (matches) {
      matches.forEach(match => {
        const corrected = match.replace(/\b(go to|at|in)\s+/, '$1 the ').replace(/\bI am\s+/, 'I am a ');
        mistakes.push({
          original: match,
          correction: corrected,
          suggestion: 'Review article usage (a, an, the). Articles are required before most singular countable nouns.',
          cefrLevel: 'A2',
          context
        });
      });
    }
  });

  return mistakes;
};

/**
 * Analyze fluency mistakes using repetition and hesitation detection
 */
const analyzeFluencyMistakes = (transcript: string): MistakeItem[] => {
  const mistakes: MistakeItem[] = [];
  
  // Detect repetitions
  const repetitions = detectRepetitions(transcript);
  repetitions.examples.forEach(repetition => {
    mistakes.push({
      original: repetition,
      correction: repetition.split(' ')[0], // Just the word once
      suggestion: 'Practice speaking more slowly to avoid repetitions. Pause and think before speaking.',
      cefrLevel: 'B1',
      context: 'Speech fluency'
    });
  });

  // Detect hesitation markers
  const hesitations = detectHesitationMarkers(transcript);
  if (hesitations.count > 2) { // Only flag if excessive
    hesitations.markers.slice(0, 3).forEach(marker => { // Limit to first 3 examples
      mistakes.push({
        original: marker,
        correction: '[pause]',
        suggestion: 'Replace hesitation words with brief pauses. Practice speaking with confidence.',
        cefrLevel: 'B1',
        context: 'Hesitation markers'
      });
    });
  }

  return mistakes;
};

/**
 * Analyze structure and coherence mistakes
 */
const analyzeStructureMistakes = (transcript: string, result: AssessmentResult): MistakeItem[] => {
  const mistakes: MistakeItem[] = [];
  const sentences = splitIntoSentences(transcript);
  
  // Check for very short sentences (potential lack of development)
  const shortSentences = sentences.filter(s => s.split(' ').length < 4);
  if (shortSentences.length > sentences.length * 0.5) {
    mistakes.push({
      original: shortSentences[0] || 'Short sentences',
      correction: 'Try combining ideas: "When I was young, I enjoyed playing in the garden with my friends."',
      suggestion: 'Practice connecting ideas with conjunctions (and, but, because, when) to create more complex sentences.',
      cefrLevel: 'B1',
      context: 'Sentence development'
    });
  }

  // Check for lack of discourse markers
  const discourseMarkers = ['first', 'then', 'however', 'because', 'although', 'finally'];
  const hasMarkers = discourseMarkers.some(marker => 
    transcript.toLowerCase().includes(marker)
  );
  
  if (!hasMarkers && sentences.length > 2) {
    mistakes.push({
      original: 'Ideas not connected',
      correction: 'First, I go to school. Then, I play with friends. Finally, I go home.',
      suggestion: 'Use linking words (first, then, because, however) to connect your ideas and improve coherence.',
      cefrLevel: 'B1',
      context: 'Discourse markers'
    });
  }

  return mistakes;
};

/**
 * Analyze basic vocabulary mistakes
 */
const analyzeVocabularyMistakes = (transcript: string): MistakeItem[] => {
  const mistakes: MistakeItem[] = [];
  
  // Check for overuse of basic adjectives
  const basicAdjectives = ['good', 'bad', 'big', 'small', 'nice', 'fun'];
  const words = transcript.toLowerCase().split(/\s+/);
  
  basicAdjectives.forEach(adj => {
    const count = words.filter(word => word.includes(adj)).length;
    if (count > 1) {
      const alternatives = {
        'good': 'excellent, wonderful, fantastic',
        'bad': 'terrible, awful, disappointing',
        'big': 'huge, enormous, massive',
        'small': 'tiny, little, compact',
        'nice': 'pleasant, lovely, delightful',
        'fun': 'enjoyable, entertaining, exciting'
      };
      
      mistakes.push({
        original: `"${adj}" (used ${count} times)`,
        correction: alternatives[adj as keyof typeof alternatives],
        suggestion: `Vary your vocabulary. Instead of repeating "${adj}", try: ${alternatives[adj as keyof typeof alternatives]}`,
        cefrLevel: 'B2',
        context: 'Vocabulary range'
      });
    }
  });

  return mistakes;
};
