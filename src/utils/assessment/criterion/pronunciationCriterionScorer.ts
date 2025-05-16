
import { calculatePronunciationScore } from "../pronunciationScoring";

/**
 * Calculate the pronunciation criterion score based on audio metrics and transcript
 */
export const calculatePronunciationCriterion = (
  audioMetrics: any,
  transcript: string
): number => {
  // Use enhanced pronunciation score if available
  if (audioMetrics.pronunciationScore !== undefined) {
    return audioMetrics.pronunciationScore;
  }
  return calculatePronunciationScore(audioMetrics, transcript);
};
