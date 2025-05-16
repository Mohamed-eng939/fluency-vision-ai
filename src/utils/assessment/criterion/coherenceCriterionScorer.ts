
import { calculateCoherenceScore } from "../coherenceScoring";

/**
 * Calculate the coherence criterion score based on audio metrics and transcript
 */
export const calculateCoherenceCriterion = (
  audioMetrics: any,
  transcript: string
): number => {
  return calculateCoherenceScore(audioMetrics, transcript);
};
