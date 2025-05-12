
import { AssessmentMetrics } from '../../types/assessment';
import { calculateIELTSSpeakingScore, mapIELTSto5Point } from './ieltsScoringUtils';

/**
 * Analyze transcript for linguistic features and calculate scores
 */
export const analyzeTranscript = (transcript: string): Partial<AssessmentMetrics> => {
  // Get the IELTS scores
  const ieltsScores = calculateIELTSSpeakingScore(transcript);
  
  // Map IELTS bands to the 1-10 scale used in the app
  const metrics: Partial<AssessmentMetrics> = {
    fluency: mapIELTSBandToScale(ieltsScores["Fluency and Coherence"]),
    vocabulary: mapIELTSBandToScale(ieltsScores["Lexical Resource"]),
    grammar: mapIELTSBandToScale(ieltsScores["Grammatical Range and Accuracy"]),
    pronunciation: mapIELTSBandToScale(ieltsScores["Pronunciation"]),
  };
  
  // Calculate derived metrics
  metrics.coherence = metrics.fluency; // Coherence is part of the fluency score in IELTS
  metrics.syntax = metrics.grammar; // Syntax is part of grammatical range
  metrics.prosody = metrics.pronunciation; // Prosody is part of pronunciation
  
  return metrics;
};

/**
 * Map IELTS band (0-9) to the application's 1-10 scale
 */
const mapIELTSBandToScale = (band: number): number => {
  // Simple linear mapping: IELTS 0-9 → App scale 1-10
  return 1 + (band / 9) * 9;
};

/**
 * Calculate fluency score based on transcript features
 * Note: This function is kept for backward compatibility
 */
export const calculateFluencyScore = (transcript: string): number => {
  const ieltsScores = calculateIELTSSpeakingScore(transcript);
  return mapIELTSBandToScale(ieltsScores["Fluency and Coherence"]);
};

/**
 * Calculate vocabulary score based on transcript content
 * Note: This function is kept for backward compatibility
 */
export const calculateVocabularyScore = (transcript: string): number => {
  const ieltsScores = calculateIELTSSpeakingScore(transcript);
  return mapIELTSBandToScale(ieltsScores["Lexical Resource"]);
};

/**
 * Calculate grammar score based on transcript content
 * Note: This function is kept for backward compatibility
 */
export const calculateGrammarScore = (transcript: string): number => {
  const ieltsScores = calculateIELTSSpeakingScore(transcript);
  return mapIELTSBandToScale(ieltsScores["Grammatical Range and Accuracy"]);
};

/**
 * Calculate coherence score based on transcript content
 * Note: This function is kept for backward compatibility
 */
export const calculateCoherenceScore = (transcript: string): number => {
  const ieltsScores = calculateIELTSSpeakingScore(transcript);
  return mapIELTSBandToScale(ieltsScores["Fluency and Coherence"]);
};

/**
 * Calculate syntax score based on transcript content
 * Note: This function is kept for backward compatibility
 */
export const calculateSyntaxScore = (transcript: string): number => {
  const ieltsScores = calculateIELTSSpeakingScore(transcript);
  return mapIELTSBandToScale(ieltsScores["Grammatical Range and Accuracy"]);
};
