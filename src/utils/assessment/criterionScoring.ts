
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
 * CEFR level to numeric score mapping for compatibility
 */
const cefrToNumber: Record<string, number> = { 
  'A1': 2, 'A2': 4, 'B1': 5, 'B2': 7, 'C1': 8.5, 'C2': 10 
};

/**
 * Calculate a criterion score based on audio metrics and transcript
 * Note: Grammar uses external API only (returns 0 if fails)
 * Note: Vocabulary stores CEFR in audioMetrics, returns numeric equivalent
 */
export const calculateCriterionScore = async (
  criterion: string,
  audioMetrics: any,
  transcript: string,
  promptText?: string
): Promise<number> => {
  switch (criterion) {
    case 'Fluency & Coherence':
    case 'Fluency':
      return calculateFluencyCriterion(audioMetrics, transcript);
    case 'Pronunciation':
      return calculatePronunciationCriterion(audioMetrics, transcript);
    case 'Grammar':
    case 'Grammatical Range and Accuracy': {
      // Returns null if API fails - use 0 as fallback
      const grammarResult = await calculateGrammarCriterion(audioMetrics, transcript);
      return grammarResult ?? 0;
    }
    case 'Vocabulary':
    case 'Lexical Resource': {
      // Vocabulary returns CEFR level - convert to number for compatibility
      // Actual CEFR level is stored in audioMetrics.cefrVocabularyLevel
      const cefrLevel = calculateVocabularyCriterion(audioMetrics, transcript);
      return cefrToNumber[cefrLevel] ?? 5;
    }
    case 'Syntax':
      return calculateSyntaxCriterion(audioMetrics, transcript);
    case 'Prosody':
      return calculateProsodyCriterion(audioMetrics);
    case 'Coherence':
      return await calculateCoherenceCriterion(audioMetrics, transcript, promptText);
    default:
      return calculateDefaultCriterion();
  }
};
