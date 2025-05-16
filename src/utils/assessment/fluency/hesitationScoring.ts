
import { detectHesitationMarkers } from "../../audio/hesitationDetector";

/**
 * Apply penalties based on hesitation markers/filler words
 */
export const applyHesitationPenalties = (baseScore: number, transcript: string): number => {
  // Get hesitation markers from transcript
  const hesitationAnalysis = detectHesitationMarkers(transcript);
  const markerCount = hesitationAnalysis.count;
  
  let penaltyScore = baseScore;
  
  // Apply penalties based on marker count
  if (markerCount >= 3 && markerCount <= 5) {
    // 3-5 markers: -0.5 penalty
    penaltyScore -= 0.5;
  } else if (markerCount >= 6 && markerCount <= 10) {
    // 6-10 markers: -1.0 penalty
    penaltyScore -= 1.0;
  } else if (markerCount > 10) {
    // >10 markers: -1.5 penalty
    penaltyScore -= 1.5;
    
    // Apply CEFR alignment ceiling: cap at 7.0 (B2 level) for high hesitation
    penaltyScore = Math.min(penaltyScore, 7.0);
  }
  
  // Ensure score doesn't go below 1.0
  return Math.max(1.0, penaltyScore);
};
