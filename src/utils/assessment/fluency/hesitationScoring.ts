
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
  
  // Apply penalties based on marker count - more forgiving thresholds
  if (markerCount >= 6 && markerCount <= 7) {
    // 6-7 markers: -0.5 penalty (was 3-5)
    penaltyScore -= 0.5;
  } else if (markerCount >= 8 && markerCount <= 12) {
    // 8-12 markers: -1.0 penalty (was 6-10)
    penaltyScore -= 1.0;
  } else if (markerCount >= 13) {
    // 13+ markers: -1.5 penalty (was >10)
    penaltyScore -= 1.5;
    
    // Apply CEFR alignment ceiling: cap at 7.5 (B2+ level) for excessive hesitation
    // Only cap if combined with high pause ratio
    penaltyScore = Math.min(penaltyScore, 7.5);
  }
  
  // Ensure score doesn't go below 1.0
  return Math.max(1.0, penaltyScore);
};
