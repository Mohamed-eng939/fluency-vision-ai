import { ReadAloudError, ReadAloudResult } from '@/data/readAloud/sentenceBank';
import { calculateDeterministicScore, determineBandFromSentence } from './deterministicScoring';
import { aggregateReadAloudScores as aggregateWithBandWeights } from './aggregationSystem';
import { IPAError } from './types';

export interface PronunciationAnalysis {
  words: string[];
  confidenceScores: number[];
  speechRate: number;
  pauseCount: number;
  totalDuration: number;
  speakingDuration: number;
}

export interface ScoringConfig {
  hesitationThreshold: number; // milliseconds
  minConfidenceThreshold: number;
  substitutionPenalty: number;
  omissionPenalty: number;
  insertionPenalty: number;
  hesitationPenalty: number;
}

export interface RegionalErrorPattern {
  pattern: RegExp;
  errorType: string;
  feedback: string;
}

const DEFAULT_SCORING_CONFIG: ScoringConfig = {
  hesitationThreshold: 800, // 800ms pause threshold
  minConfidenceThreshold: 0.6,
  substitutionPenalty: 0.5,
  omissionPenalty: 0.7,
  insertionPenalty: 0.3,
  hesitationPenalty: 0.2
};

// Regional error patterns for Middle East/GCC learners
const REGIONAL_ERROR_PATTERNS: RegionalErrorPattern[] = [
  {
    pattern: /\b(sink|sank|srough|sree|sank|sought)\b/g,
    errorType: 'th_voiceless_substitution',
    feedback: "Practice the /θ/ sound — it's often confused with /s/ in words like 'think' or 'through'."
  },
  {
    pattern: /\b(zat|zis|zose|zen|zere)\b/g,
    errorType: 'th_voiced_substitution',
    feedback: "The voiced /ð/ sound is often replaced by /z/ — focus on 'this', 'that', and 'those'."
  },
  {
    pattern: /\b(beople|bebble|baper|bopcorn)\b/g,
    errorType: 'p_to_b_substitution',
    feedback: "The /p/ sound should be voiceless. Watch for substitutions like 'beople' instead of 'people'."
  },
  {
    pattern: /\b\w+(e|u|i|o|a)$/g,
    errorType: 'vowel_insertion',
    feedback: "Avoid adding extra vowels at the end of words — say 'friend', not 'friende'."
  },
  {
    pattern: /\b(fery|bery|fideo|bideo|fital)\b/g,
    errorType: 'v_substitution',
    feedback: "Practice the voiced /v/ sound. Common errors include 'fery' or 'bery' for 'very'."
  },
  {
    pattern: /\b(sinificant|arument|recornize|sinle)\b/g,
    errorType: 'g_dropping',
    feedback: "Make sure to pronounce the /g/ sound clearly in words like 'significant' or 'argue'."
  },
  {
    pattern: /\b(sochial|fashchion|nachional|stachion)\b/g,
    errorType: 'sh_ch_confusion',
    feedback: "The /ʃ/ sound ('sh') should not become 'ch' — say 'social', not 'sochial'."
  },
  {
    pattern: /\b(im|por|tant|com|pu|ter|de|ve|lop)\b/g,
    errorType: 'stress_misplacement',
    feedback: "Be aware of word stress — it's IM-portant, not im-POR-tant."
  },
  {
    pattern: /(um|uh|er|ah|mm|hmm)/g,
    errorType: 'excessive_hesitation',
    feedback: "Minimize filler sounds like 'um' — try to keep fluency smooth and confident."
  }
];

/**
 * New deterministic IPA-based pronunciation scoring (preferred method)
 */
export const scoreReadAloudWithIPA = (
  referenceSentence: string,
  transcription: string,
  ipaErrors: IPAError[],
  phonemeAccuracy: number,
  wordAccuracy: number,
  stressAccuracy: number = 0.5,
  articulationRate: number,
  pauseRatio: number,
  speakingTime: number,
  asrConfidence: number,
  audioAnalysis?: PronunciationAnalysis
): ReadAloudResult => {
  const totalPhones = referenceSentence.length * 2.5; // Rough estimate
  const band = determineBandFromSentence(referenceSentence.length);
  
  const analysis = calculateDeterministicScore(
    phonemeAccuracy,
    wordAccuracy,
    stressAccuracy,
    articulationRate,
    pauseRatio,
    ipaErrors,
    totalPhones,
    band,
    speakingTime,
    asrConfidence,
    transcription.split(/\s+/).length
  );
  
  // Convert IPA errors to ReadAloud errors format
  const errors: ReadAloudError[] = ipaErrors.map(error => ({
    type: error.type as any,
    position: error.position,
    expected: error.expected,
    actual: error.actual,
    description: `${error.type}: ${error.phoneme} (severity: ${error.severity.toFixed(2)})`
  }));
  
  return {
    sentenceId: '',
    score: analysis.adjustedScore / 2, // Convert from 0-10 to 0-5 scale
    errors,
    transcription,
    confidence: asrConfidence
  };
};

/**
 * Export the new band-weighted aggregation system
 */
export { aggregateWithBandWeights };

/**
 * Legacy scoring function (maintained for backwards compatibility)
 */
export const scoreReadAloudSentence = (
  referenceSentence: string,
  transcription: string,
  audioAnalysis?: PronunciationAnalysis,
  config: ScoringConfig = DEFAULT_SCORING_CONFIG
): ReadAloudResult => {
  const sentenceId = ''; // Will be set by caller
  const errors: ReadAloudError[] = [];
  
  // Normalize for comparison (preserve original for error detection)
  const normalizedReference = referenceSentence.toLowerCase().replace(/[^\\w\\s]/g, '').trim();
  const normalizedTranscription = transcription.toLowerCase().replace(/[^\\w\\s]/g, '').trim();
  
  const referenceWords = normalizedReference.split(/\s+/);
  const transcriptionWords = normalizedTranscription.split(/\s+/);
  
  let score = 5; // Start with perfect score and deduct
  
  // 1. Check for major structural issues
  if (transcriptionWords.length === 0) {
    return {
      sentenceId,
      score: 0,
      errors: [{ type: 'omission', description: 'No speech detected' }],
      transcription,
      confidence: 0
    };
  }
  
  // 2. Word-level analysis using simple string matching
  const { matchedWords, substitutions, omissions, insertions } = analyzeWordAlignment(
    referenceWords, 
    transcriptionWords
  );
  
  // 3. Apply penalties for different error types
  const substitutionCount = substitutions.length;
  const omissionCount = omissions.length;
  const insertionCount = insertions.length;
  
  // Calculate penalties
  const substitutionPenalty = substitutionCount * config.substitutionPenalty;
  const omissionPenalty = omissionCount * config.omissionPenalty;
  const insertionPenalty = insertionCount * config.insertionPenalty;
  
  score -= substitutionPenalty + omissionPenalty + insertionPenalty;
  
  // Add errors to list
  substitutions.forEach(sub => {
    errors.push({
      type: 'substitution',
      position: sub.position,
      expected: sub.expected,
      actual: sub.actual,
      description: `Expected \"${sub.expected}\" but heard \"${sub.actual}\"`
    });
  });
  
  omissions.forEach(omission => {
    errors.push({
      type: 'omission',
      position: omission.position,
      expected: omission.word,
      description: `Missing word: \"${omission.word}\"`
    });
  });
  
  insertions.forEach(insertion => {
    errors.push({
      type: 'insertion',
      position: insertion.position,
      actual: insertion.word,
      description: `Extra word: \"${insertion.word}\"`
    });
  });
  
  // 4. Detect regional pronunciation patterns
  const regionalErrors = detectRegionalErrors(transcription, referenceSentence);
  regionalErrors.forEach(error => {
    errors.push(error);
    score -= 0.3; // Penalty for each regional error
  });

  // 5. Analyze hesitations and fluency
  if (audioAnalysis) {
    const hesitationCount = analyzeHesitations(transcription, audioAnalysis, config);
    const hesitationPenalty = hesitationCount * config.hesitationPenalty;
    score -= hesitationPenalty;
    
    if (hesitationCount > 0) {
      errors.push({
        type: 'hesitation',
        description: `${hesitationCount} hesitation(s) detected (pauses > ${config.hesitationThreshold}ms or filler words)`
      });
    }
  }

  // 6. Check for robotic/flat delivery (word-by-word spacing)
  if (isRoboticDelivery(transcription)) {
    errors.push({
      type: 'rhythm',
      description: "Use natural intonation and connect words — avoid reading word-by-word in a robotic tone."
    });
    score -= 0.2;
  }
  
  // 5. Apply confidence-based adjustments
  const avgConfidence = audioAnalysis?.confidenceScores.reduce((sum, conf) => sum + conf, 0) / (audioAnalysis?.confidenceScores.length || 1) || 0.8;
  
  if (avgConfidence < config.minConfidenceThreshold) {
    score -= 0.5; // Penalty for low confidence
    errors.push({
      type: 'hesitation',
      description: `Low recognition confidence: ${(avgConfidence * 100).toFixed(1)}%`
    });
  }
  
  // 6. Ensure score is within bounds
  score = Math.max(0, Math.min(5, score));
  
  // 7. Round to nearest 0.1
  score = Math.round(score * 10) / 10;
  
  return {
    sentenceId,
    score,
    errors,
    transcription,
    confidence: avgConfidence
  };
};

interface WordAlignment {
  matchedWords: number;
  substitutions: Array<{ position: number; expected: string; actual: string }>;
  omissions: Array<{ position: number; word: string }>;
  insertions: Array<{ position: number; word: string }>;
}

const analyzeWordAlignment = (referenceWords: string[], transcriptionWords: string[]): WordAlignment => {
  const result: WordAlignment = {
    matchedWords: 0,
    substitutions: [],
    omissions: [],
    insertions: []
  };
  
  // Simple alignment algorithm - can be improved with dynamic programming
  let refIndex = 0;
  let transIndex = 0;
  
  while (refIndex < referenceWords.length && transIndex < transcriptionWords.length) {
    const refWord = referenceWords[refIndex];
    const transWord = transcriptionWords[transIndex];
    
    if (refWord === transWord || isCloseMatch(refWord, transWord)) {
      result.matchedWords++;
      refIndex++;
      transIndex++;
    } else {
      // Check if next reference word matches current transcription (omission)
      if (refIndex + 1 < referenceWords.length && 
          (referenceWords[refIndex + 1] === transWord || isCloseMatch(referenceWords[refIndex + 1], transWord))) {
        result.omissions.push({ position: refIndex, word: refWord });
        refIndex++;
      }
      // Check if next transcription word matches current reference (insertion)
      else if (transIndex + 1 < transcriptionWords.length &&
               (refWord === transcriptionWords[transIndex + 1] || isCloseMatch(refWord, transcriptionWords[transIndex + 1]))) {
        result.insertions.push({ position: transIndex, word: transWord });
        transIndex++;
      }
      // Otherwise, it's a substitution
      else {
        result.substitutions.push({ position: refIndex, expected: refWord, actual: transWord });
        refIndex++;
        transIndex++;
      }
    }
  }
  
  // Handle remaining words
  while (refIndex < referenceWords.length) {
    result.omissions.push({ position: refIndex, word: referenceWords[refIndex] });
    refIndex++;
  }
  
  while (transIndex < transcriptionWords.length) {
    result.insertions.push({ position: transIndex, word: transcriptionWords[transIndex] });
    transIndex++;
  }
  
  return result;
};

const isCloseMatch = (word1: string, word2: string): boolean => {
  // Simple phonetic similarity check
  if (word1.length === 0 || word2.length === 0) return false;
  
  // Calculate Levenshtein distance
  const distance = levenshteinDistance(word1, word2);
  const maxLength = Math.max(word1.length, word2.length);
  const similarity = 1 - (distance / maxLength);
  
  // Consider words similar if they're 80% similar
  return similarity >= 0.8;
};

const levenshteinDistance = (str1: string, str2: string): number => {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
  
  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
  
  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,     // insertion
        matrix[j - 1][i] + 1,     // deletion
        matrix[j - 1][i - 1] + indicator // substitution
      );
    }
  }
  
  return matrix[str2.length][str1.length];
};

const analyzeHesitations = (
  transcription: string, 
  audioAnalysis: PronunciationAnalysis, 
  config: ScoringConfig
): number => {
  let hesitationCount = 0;
  
  // Check for filler words
  const fillerWords = ['uh', 'um', 'er', 'ah', 'mm', 'hmm'];
  const words = transcription.toLowerCase().split(/\s+/);
  
  words.forEach(word => {
    if (fillerWords.includes(word)) {
      hesitationCount++;
    }
  });
  
  // Check for long pauses (if pause data is available)
  if (audioAnalysis.pauseCount && audioAnalysis.totalDuration && audioAnalysis.speakingDuration) {
    const avgPauseDuration = (audioAnalysis.totalDuration - audioAnalysis.speakingDuration) / audioAnalysis.pauseCount;
    if (avgPauseDuration > config.hesitationThreshold) {
      hesitationCount += Math.floor(avgPauseDuration / config.hesitationThreshold);
    }
  }
  
  return hesitationCount;
};

const detectRegionalErrors = (transcription: string, referenceSentence: string): ReadAloudError[] => {
  const errors: ReadAloudError[] = [];
  const normalizedTranscription = transcription.toLowerCase();
  
  REGIONAL_ERROR_PATTERNS.forEach(pattern => {
    const matches = normalizedTranscription.match(pattern.pattern);
    if (matches) {
      matches.forEach(match => {
        errors.push({
          type: 'regional_error',
          errorType: pattern.errorType,
          description: pattern.feedback,
          feedback: pattern.feedback,
          actual: match
        });
      });
    }
  });
  
  return errors;
};

const isRoboticDelivery = (transcription: string): boolean => {
  // Check for excessive word spacing or unnatural pauses
  const words = transcription.split(/\s+/);
  const avgWordLength = words.join('').length / words.length;
  
  // If transcript has very short words on average, it might indicate robotic delivery
  // Also check for excessive punctuation or spacing markers
  const hasRoboticMarkers = /\.\.\.|…|\s{2,}/.test(transcription);
  const hasVeryShortWords = avgWordLength < 3 && words.length > 5;
  
  return hasRoboticMarkers || hasVeryShortWords;
};

export const aggregateReadAloudScores = (results: ReadAloudResult[]): {
  totalScore: number;
  averageScore: number;
  bandScores: Record<string, number>;
  cefrLevel: string;
  errorSummary: Record<string, number>;
} => {
  if (results.length === 0) {
    return {
      totalScore: 0,
      averageScore: 0,
      bandScores: {},
      cefrLevel: 'A1',
      errorSummary: {}
    };
  }
  
  const totalScore = results.reduce((sum, result) => sum + result.score, 0);
  const averageScore = totalScore / results.length;
  const maxPossibleScore = results.length * 5;
  const percentageScore = (totalScore / maxPossibleScore) * 100;
  
  // Map to CEFR level with updated thresholds
  let cefrLevel = 'A1';
  if (averageScore >= 4.3) cefrLevel = 'C1';
  else if (averageScore >= 3.6) cefrLevel = 'B2';
  else if (averageScore >= 2.6) cefrLevel = 'B1';
  else if (averageScore >= 1.6) cefrLevel = 'A2';
  else if (averageScore >= 0) cefrLevel = 'A1';
  
  // Count error types
  const errorSummary: Record<string, number> = {};
  results.forEach(result => {
    result.errors.forEach(error => {
      errorSummary[error.type] = (errorSummary[error.type] || 0) + 1;
    });
  });
  
  return {
    totalScore,
    averageScore,
    bandScores: {}, // Would need sentence band info to calculate
    cefrLevel,
    errorSummary
  };
};
