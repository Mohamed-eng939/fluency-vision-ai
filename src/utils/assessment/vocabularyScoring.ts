
/**
 * Vocabulary scoring - CEFR word list mapping ONLY
 * NO numeric scores, NO fallbacks
 */
import { analyzeCefrVocabulary } from './vocabulary/cefrVocabularyAnalyzer';

/**
 * Analyze vocabulary and return CEFR level - NO numeric score
 */
export const analyzeVocabulary = (transcript: string): {
  cefrLevel: string;
  distribution: Record<string, number>;
  justification: string;
  lexicalDiversity: number;
  recognizedWords: Record<string, string[]>;
  unrecognizedWords: string[];
} => {
  const analysis = analyzeCefrVocabulary(transcript);
  
  return {
    cefrLevel: analysis.cefrVocabularyLevel,
    distribution: analysis.wordDistribution,
    justification: analysis.vocabularyJustification,
    lexicalDiversity: analysis.lexicalDiversity,
    recognizedWords: analysis.recognizedWords,
    unrecognizedWords: analysis.unrecognizedWords
  };
};

/**
 * @deprecated - Use analyzeVocabulary instead. Kept for backward compatibility.
 * Returns a dummy value - actual CEFR level is in audioMetrics.cefrVocabularyLevel
 */
export const calculateVocabularyScore = (
  audioMetrics: any,
  transcript: string,
  promptId?: string
): number => {
  // This function is deprecated - vocabulary is now CEFR-only
  // Return 0 to indicate no numeric score is used
  console.warn('calculateVocabularyScore is deprecated - use CEFR level from audioMetrics.cefrVocabularyLevel');
  return 0;
};
