
import { calculateSyntaxScore } from "../syntaxScoring";

/**
 * Calculate the syntax criterion score based on audio metrics and transcript
 */
export const calculateSyntaxCriterion = (
  audioMetrics: any,
  transcript: string
): number => {
  return calculateSyntaxScore(audioMetrics, transcript);
};
