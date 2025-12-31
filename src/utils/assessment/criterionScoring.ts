import { 
  calculateFluencyCriterion,
  calculateGrammarCriterion,
  calculateVocabularyCriterion,
} from './criterion';

/**
 * Calculate a criterion score based on audio metrics and transcript
 * Grammar and Fluency use external APIs only (returns null if fails)
 * Vocabulary returns CEFR level from local mapping
 */
export const calculateCriterionScore = async (
  criterion: string,
  audioMetrics: any,
  transcript: string,
  _promptText?: string
): Promise<string | null> => {
  switch (criterion) {
    case 'Fluency & Coherence':
    case 'Fluency':
      return await calculateFluencyCriterion(audioMetrics, transcript);
    case 'Grammar':
    case 'Grammatical Range and Accuracy':
      return await calculateGrammarCriterion(audioMetrics, transcript);
    case 'Vocabulary':
    case 'Lexical Resource':
      return calculateVocabularyCriterion(audioMetrics, transcript);
    default:
      return null;
  }
};
