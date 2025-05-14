
// Re-export all scoring functions from their respective modules
import { calculateTotalScore, determineCEFRLevel } from './coreScoring';
import { calculateCriterionScore } from './criterionScoring';
import { calculateFluencyScore, calculateFluencyScoreFromSyllables, estimateSyllableCount } from './fluencyScoring';
import { calculatePronunciationScore } from './pronunciationScoring';
import { calculateGrammarScore, calculateGrammarScoreFromErrors, calculateBasicGrammarScore, countPattern, countTenseMixing, detectTense, countArticleErrors, calculateSentenceVariety } from './grammarScoring';
import { calculateSyntaxScore, calculateSyntaxScoreFromComplexity, calculateBasicSyntaxScore } from './syntaxScoring';
import { calculateVocabularyScore, checkAdvancedVocabulary } from './vocabularyScoring';
import { calculateCoherenceScore } from './coherenceScoring';
import { getCriterionFeedback } from './feedbackScoring';

// Export everything for backwards compatibility
export {
  // Core scoring
  calculateTotalScore,
  determineCEFRLevel,
  calculateCriterionScore,
  // Fluency scoring
  calculateFluencyScore,
  calculateFluencyScoreFromSyllables,
  estimateSyllableCount,
  // Pronunciation scoring
  calculatePronunciationScore,
  // Grammar scoring
  calculateGrammarScore,
  calculateGrammarScoreFromErrors,
  calculateBasicGrammarScore,
  countPattern,
  countTenseMixing,
  detectTense,
  countArticleErrors,
  calculateSentenceVariety,
  // Syntax scoring
  calculateSyntaxScore,
  calculateSyntaxScoreFromComplexity,
  calculateBasicSyntaxScore,
  // Vocabulary scoring
  calculateVocabularyScore,
  checkAdvancedVocabulary,
  // Coherence scoring
  calculateCoherenceScore,
  // Feedback scoring
  getCriterionFeedback
};
