
import { calculatePronunciationScore } from "../pronunciationScoring";

/**
 * Calculate the pronunciation criterion score based on audio metrics and transcript
 * NOTE: This is now replaced by the Read Aloud task system for pronunciation assessment
 */
export const calculatePronunciationCriterion = (
  audioMetrics: any,
  transcript: string
): number => {
  // Use enhanced pronunciation score if available
  if (audioMetrics.pronunciationScore !== undefined) {
    return audioMetrics.pronunciationScore;
  }
  
  // Fallback to original scoring
  return calculatePronunciationScore(audioMetrics, transcript);
};
