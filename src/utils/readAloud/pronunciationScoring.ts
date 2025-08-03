import { ReadAloudError, ReadAloudResult } from '@/data/readAloud/sentenceBank';

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

const DEFAULT_SCORING_CONFIG: ScoringConfig = {
  hesitationThreshold: 800, // 800ms pause threshold
  minConfidenceThreshold: 0.6,
  substitutionPenalty: 0.5,
  omissionPenalty: 0.7,
  insertionPenalty: 0.3,
  hesitationPenalty: 0.2
};

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
  
  // 4. Analyze hesitations and fluency
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
