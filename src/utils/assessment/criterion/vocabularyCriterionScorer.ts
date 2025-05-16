
import { calculateVocabularyScore } from "../vocabularyScoring";
import { analyzeCefrVocabulary } from "../vocabulary/cefrVocabularyAnalyzer";

/**
 * Calculate the vocabulary criterion score based on audio metrics and transcript
 */
export const calculateVocabularyCriterion = (
  audioMetrics: any,
  transcript: string
): number => {
  // If vocabulary score already available, use it
  if (audioMetrics.vocabularyScore !== undefined) {
    return audioMetrics.vocabularyScore;
  }
  
  // If transcript is available, use the enhanced CEFR vocabulary analyzer
  // and also store additional vocabulary metrics in audioMetrics for later use
  if (transcript) {
    const analysis = analyzeCefrVocabulary(transcript);
    
    // Add vocabulary analysis results to audioMetrics for use in feedback generation
    if (audioMetrics) {
      audioMetrics.cefrVocabularyLevel = analysis.cefrVocabularyLevel;
      audioMetrics.vocabularyJustification = analysis.vocabularyJustification;
      audioMetrics.vocabularyDistribution = analysis.wordDistribution;
      audioMetrics.lexicalDiversity = analysis.lexicalDiversity;
    }
    
    return analysis.vocabularyScore;
  }
  
  return calculateVocabularyScore(audioMetrics, transcript);
};
