
import { calculateFluencyScore } from "./fluencyScoring";
import { calculatePronunciationScore } from "./pronunciationScoring";
import { calculateGrammarScore } from "./grammarScoring";
import { calculateVocabularyScore } from "./vocabularyScoring";
import { calculateSyntaxScore } from "./syntaxScoring";
import { calculateCoherenceScore } from "./coherenceScoring";
import { analyzeCefrVocabulary } from "./vocabulary/cefrVocabularyAnalyzer";

/**
 * Calculate a criterion score based on audio metrics and transcript
 */
export const calculateCriterionScore = (
  criterion: string,
  audioMetrics: any,
  transcript: string
): number => {
  switch (criterion) {
    case 'Fluency & Coherence':
    case 'Fluency':
      // Use syllables per minute for fluency if available
      return calculateFluencyScore(audioMetrics, transcript);
    case 'Pronunciation':
      // Use enhanced pronunciation score if available
      if (audioMetrics.pronunciationScore !== undefined) {
        return audioMetrics.pronunciationScore;
      }
      return calculatePronunciationScore(audioMetrics, transcript);
    case 'Grammar':
    case 'Grammatical Range and Accuracy':
      return calculateGrammarScore(audioMetrics, transcript);
    case 'Vocabulary':
    case 'Lexical Resource':
      // Enhanced vocabulary scoring using CEFR standards
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
    case 'Syntax':
      return calculateSyntaxScore(audioMetrics, transcript);
    case 'Prosody':
      return audioMetrics.pausePattern || 7;
    case 'Coherence':
      return calculateCoherenceScore(audioMetrics, transcript);
    // For other criteria, we'd need deeper text analysis
    default:
      // Return a value between 6-9 for now
      return Math.random() * 3 + 6;
  }
};
