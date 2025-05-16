
import { 
  calculateFluencyCriterion,
  calculatePronunciationCriterion,
  calculateGrammarCriterion,
  calculateVocabularyCriterion,
  calculateSyntaxCriterion,
  calculateProsodyCriterion,
  calculateCoherenceCriterion,
  calculateDefaultCriterion
} from './criterion';

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
      return calculateFluencyCriterion(audioMetrics, transcript);
    case 'Pronunciation':
      return calculatePronunciationCriterion(audioMetrics, transcript);
    case 'Grammar':
    case 'Grammatical Range and Accuracy':
      return calculateGrammarCriterion(audioMetrics, transcript);
    case 'Vocabulary':
    case 'Lexical Resource':
      return calculateVocabularyCriterion(audioMetrics, transcript);
    case 'Syntax':
      return calculateSyntaxCriterion(audioMetrics, transcript);
    case 'Prosody':
      return calculateProsodyCriterion(audioMetrics);
    case 'Coherence':
      return calculateCoherenceCriterion(audioMetrics, transcript);
    default:
      // For other criteria, use the default scorer
      return calculateDefaultCriterion();
  }
};
