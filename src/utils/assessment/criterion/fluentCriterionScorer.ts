
import { calculateFluencyScore } from "../fluency";

/**
 * Calculate the fluency criterion score based on audio metrics and transcript
 */
export const calculateFluencyCriterion = (
  audioMetrics: any,
  transcript: string
): number => {
  return calculateFluencyScore(audioMetrics, transcript);
};
