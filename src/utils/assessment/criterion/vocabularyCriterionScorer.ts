
import { analyzeCefrVocabulary } from "../vocabulary/cefrVocabularyAnalyzer";

/**
 * Calculate the vocabulary criterion - CEFR mapping only, NO numeric score
 * Returns the CEFR level as the result, stores full analysis in audioMetrics
 */
export const calculateVocabularyCriterion = (
  audioMetrics: any,
  transcript: string
): string => {
  if (!transcript || transcript.trim().length === 0) {
    audioMetrics.cefrVocabularyLevel = 'A1';
    audioMetrics.vocabularyJustification = 'No transcript provided';
    audioMetrics.vocabularyDistribution = {};
    audioMetrics.lexicalDiversity = 0;
    audioMetrics.recognizedWords = {};
    audioMetrics.unrecognizedWords = [];
    return 'A1';
  }

  // Use the enhanced CEFR vocabulary analyzer - NO numeric scoring
  const analysis = analyzeCefrVocabulary(transcript);
  
  // Store vocabulary analysis results in audioMetrics for UI display
  audioMetrics.cefrVocabularyLevel = analysis.cefrVocabularyLevel;
  audioMetrics.vocabularyJustification = analysis.vocabularyJustification;
  audioMetrics.vocabularyDistribution = analysis.wordDistribution;
  audioMetrics.lexicalDiversity = analysis.lexicalDiversity;
  audioMetrics.recognizedWords = analysis.recognizedWords;
  audioMetrics.unrecognizedWords = analysis.unrecognizedWords;
  audioMetrics.recognizedWordCount = analysis.recognizedWordCount;
  audioMetrics.unrecognizedWordCount = analysis.unrecognizedWordCount;
  audioMetrics.totalWordCount = analysis.totalWordCount;
  audioMetrics.uniqueWordCount = analysis.uniqueWordCount;
  
  // Return CEFR level only - NO numeric score
  return analysis.cefrVocabularyLevel;
};
