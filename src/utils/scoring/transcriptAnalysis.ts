
import { AssessmentMetrics } from '../../types/assessment';
import { calculateIELTSSpeakingScore } from './ieltsScoringUtils';
import { mapBandToCEFR, mapIELTSto5Point } from '../rubricLoaderUtils';
import { analyzeAudioFeatures, AudioAnalysisResult } from '../audioAnalysisUtils';

/**
 * Analyze transcript and audio for linguistic features and calculate scores
 */
export const analyzeTranscript = async (
  transcript: string, 
  audioBlob?: Blob
): Promise<Partial<AssessmentMetrics> & { audioAnalysis?: AudioAnalysisResult }> => {
  // Get the IELTS scores
  const ieltsScores = await calculateIELTSSpeakingScore(transcript, audioBlob);
  
  // Map IELTS bands to the 1-10 scale used in the app
  const metrics: Partial<AssessmentMetrics> = {
    fluency: mapIELTSBandToScale(ieltsScores["Fluency and Coherence"] as number),
    vocabulary: mapIELTSBandToScale(ieltsScores["Lexical Resource"] as number),
    grammar: mapIELTSBandToScale(ieltsScores["Grammatical Range and Accuracy"] as number),
    pronunciation: mapIELTSBandToScale(ieltsScores["Pronunciation"] as number),
  };
  
  // Calculate derived metrics
  metrics.coherence = metrics.fluency; // Coherence is part of the fluency score in IELTS
  metrics.syntax = metrics.grammar; // Syntax is part of grammatical range
  metrics.prosody = metrics.pronunciation; // Prosody is part of pronunciation
  
  // Additional audio analysis if available
  let audioAnalysis: AudioAnalysisResult | undefined;
  
  if (audioBlob) {
    try {
      audioAnalysis = await analyzeAudioFeatures(audioBlob, transcript);
    } catch (error) {
      console.error("Error analyzing audio features:", error);
    }
  }
  
  return {
    ...metrics,
    audioAnalysis
  };
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
export const calculateFluencyScore = async (transcript: string): Promise<number> => {
  const ieltsScores = await calculateIELTSSpeakingScore(transcript);
  return mapIELTSBandToScale(ieltsScores["Fluency and Coherence"] as number);
};

/**
 * Calculate vocabulary score based on transcript content
 * Note: This function is kept for backward compatibility
 */
export const calculateVocabularyScore = async (transcript: string): Promise<number> => {
  const ieltsScores = await calculateIELTSSpeakingScore(transcript);
  return mapIELTSBandToScale(ieltsScores["Lexical Resource"] as number);
};

/**
 * Calculate grammar score based on transcript content
 * Note: This function is kept for backward compatibility
 */
export const calculateGrammarScore = async (transcript: string): Promise<number> => {
  const ieltsScores = await calculateIELTSSpeakingScore(transcript);
  return mapIELTSBandToScale(ieltsScores["Grammatical Range and Accuracy"] as number);
};

/**
 * Calculate coherence score based on transcript content
 * Note: This function is kept for backward compatibility
 */
export const calculateCoherenceScore = async (transcript: string): Promise<number> => {
  const ieltsScores = await calculateIELTSSpeakingScore(transcript);
  return mapIELTSBandToScale(ieltsScores["Fluency and Coherence"] as number);
};

/**
 * Calculate syntax score based on transcript content
 * Note: This function is kept for backward compatibility
 */
export const calculateSyntaxScore = async (transcript: string): Promise<number> => {
  const ieltsScores = await calculateIELTSSpeakingScore(transcript);
  return mapIELTSBandToScale(ieltsScores["Grammatical Range and Accuracy"] as number);
};
