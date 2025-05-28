
import { calculateCoherenceScore } from "../coherenceScoring";

/**
 * Calculate the coherence criterion score based on audio metrics and transcript
 */
export const calculateCoherenceCriterion = async (
  audioMetrics: any,
  transcript: string,
  promptText?: string
): Promise<number> => {
  return await calculateCoherenceScore(audioMetrics, transcript, promptText);
};
