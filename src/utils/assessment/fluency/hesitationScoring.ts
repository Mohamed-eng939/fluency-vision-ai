
import { detectHesitationMarkers } from "../../audio/hesitationDetector";

/**
 * Apply penalties based on hesitation markers/filler words
 * Updated to be more forgiving for natural ESL learner speech
 */
export const applyHesitationPenalties = (baseScore: number, transcript: string): number => {
  // Get hesitation markers from transcript
  const hesitationAnalysis = detectHesitationMarkers(transcript);
  const markerCount = hesitationAnalysis.count;
  
  let penaltyScore = baseScore;
  
  // Apply penalties based on marker count - CEFR-aligned thresholds
  if (markerCount >= 6 && markerCount <= 7) {
    // 6-7 markers: -0.5 penalty
    penaltyScore -= 0.5;
  } else if (markerCount >= 8 && markerCount <= 12) {
    // 8-12 markers: -1.0 penalty
    penaltyScore -= 1.0;
  } else if (markerCount >= 13) {
    // 13+ markers: -1.5 penalty
    penaltyScore -= 1.5;
    // Note: Capping is now handled in main function with smart logic
  }
  
  // Ensure score doesn't go below 1.0
  return Math.max(1.0, penaltyScore);
};
