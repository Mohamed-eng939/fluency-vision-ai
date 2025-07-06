
import { analyzePauseQuality } from "./pauseQualityAnalyzer";

/**
 * Apply penalties based on pause quality analysis
 * Updated to require both high pause ratio AND multiple long pauses
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
  const pauseRatio = audioMetrics.pauseRatio || 0;
  
  // Apply penalties based on disfluent pause count AND pause ratio
  let penalty = 0;
  let justification = "";
  
  // More stringent criteria: require BOTH high pause ratio AND multiple disfluent pauses
  const hasHighPauseRatio = pauseRatio > 0.3;
  const hasMultipleLongPauses = disfluent_pauses >= 3;
  
  if (hasHighPauseRatio && hasMultipleLongPauses) {
    if (disfluent_pauses >= 3 && disfluent_pauses < 6) {
      // 3-5 disfluent pauses + high pause ratio: -0.5 penalty
      penalty = 0.5;
      justification = `High pause ratio (${(pauseRatio * 100).toFixed(1)}%) with ${disfluent_pauses} disfluent pauses, reducing fluency score by 0.5 points.`;
    } else if (disfluent_pauses >= 6) {
      // ≥6 disfluent pauses + high pause ratio: -1.0 penalty
      penalty = 1.0;
      justification = `High pause ratio (${(pauseRatio * 100).toFixed(1)}%) with ${disfluent_pauses} disfluent pauses, reducing fluency score by 1.0 point.`;
    }
  } else if (hasHighPauseRatio && !hasMultipleLongPauses) {
    // High pause ratio alone (might be natural pacing) - lighter penalty
    penalty = 0.25;
    justification = `High pause ratio (${(pauseRatio * 100).toFixed(1)}%) detected, minor fluency adjustment of 0.25 points.`;
  }
  
  // Apply penalty
  penaltyScore -= penalty;
  
  // Cap at B2+ level (7.5) only if significant pause issues dominate
  if (penalty >= 1.0 || (hasHighPauseRatio && audioMetrics.pauseAnalysis && audioMetrics.pauseAnalysis.disfluent_ratio > 0.5)) {
    penaltyScore = Math.min(penaltyScore, 7.5);
    justification += " Due to significant pause-related disfluency, fluency score capped at 7.5 (B2+ level).";
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
