
import { calculateGrammarScore } from "../grammarScoring";

/**
 * Calculate the grammar criterion score based on audio metrics and transcript
 */
export const calculateGrammarCriterion = (
  audioMetrics: any,
  transcript: string
): number => {
  return calculateGrammarScore(audioMetrics, transcript);
};
