
import { analyzePauseQuality } from "./pauseQualityAnalyzer";

/**
 * Apply penalties based on pause quality analysis
 * This function analyzes pauses for quality/appropriateness
 */
export const applyPauseQualityPenalties = (baseScore: number, audioMetrics: any, transcript: string): number => {
  // Analyze transcript for pause locations and quality if we have pause timestamps
  let penaltyScore = baseScore;
  
  // Initialize or use existing pause analysis
  if (!audioMetrics.pauseAnalysis) {
    const pauseAnalysis = analyzePauseQuality(transcript, audioMetrics);
    audioMetrics.pauseAnalysis = pauseAnalysis;
  }
  
  const disfluent_pauses = audioMetrics.pauseAnalysis?.disfluent_pauses || 0;
  
  // Apply penalties based on disfluent pause count
  let penalty = 0;
  let justification = "";
  
  if (disfluent_pauses >= 3 && disfluent_pauses < 6) {
    // 3-5 disfluent pauses: -0.5 penalty
    penalty = 0.5;
    justification = `Detected ${disfluent_pauses} disfluent pauses within phrases, reducing fluency score by 0.5 points.`;
  } else if (disfluent_pauses >= 6) {
    // ≥6 disfluent pauses: -1.0 penalty
    penalty = 1.0;
    justification = `Detected ${disfluent_pauses} disfluent pauses within phrases, reducing fluency score by 1.0 point.`;
  }
  
  // Apply penalty
  penaltyScore -= penalty;
  
  // Cap at B2 level (7.0) if disfluent pauses dominate
  if (disfluent_pauses >= 6 || (audioMetrics.pauseAnalysis && audioMetrics.pauseAnalysis.disfluent_ratio > 0.5)) {
    penaltyScore = Math.min(penaltyScore, 7.0);
    justification += " Due to significant disfluent pausing, fluency score capped at 7.0 (B2 level).";
  }
  
  // Add pause quality justification to fluency justification
  if (penalty > 0 && audioMetrics) {
    audioMetrics.fluencyJustification = audioMetrics.fluencyJustification
      ? `${audioMetrics.fluencyJustification} ${justification}`
      : justification;
  }
  
  // Ensure score doesn't go below 1.0
  return Math.max(1.0, penaltyScore);
};
