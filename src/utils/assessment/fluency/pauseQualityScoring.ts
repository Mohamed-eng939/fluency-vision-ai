
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
  
  // Apply CEFR-aligned penalties for pause quality
  let penalty = 0;
  let justification = "";
  
  // Updated penalty structure: 3-4 disfluent pauses = -0.5, 5+ = -1.0
  if (disfluent_pauses >= 3 && disfluent_pauses <= 4) {
    penalty = 0.5;
    justification = `Detected ${disfluent_pauses} disfluent pauses, reducing fluency by 0.5 points.`;
  } else if (disfluent_pauses >= 5) {
    penalty = 1.0;
    justification = `Detected ${disfluent_pauses} disfluent pauses, reducing fluency by 1.0 point.`;
  }
  
  // Additional penalty for high pause ratio (threshold raised to 0.35)
  if (pauseRatio > 0.35) {
    penalty += 0.5;
    justification += ` High pause ratio (${(pauseRatio * 100).toFixed(1)}%) adds additional -0.5 penalty.`;
  }
  
  // Apply penalty
  penaltyScore -= penalty;
  
  // Note: Capping is now handled in main function with smart logic
  
  // Add pause quality justification to fluency justification
  if (penalty > 0 && audioMetrics) {
    audioMetrics.fluencyJustification = audioMetrics.fluencyJustification
      ? `${audioMetrics.fluencyJustification} ${justification}`
      : justification;
  }
  
  // Ensure score doesn't go below 3.0 (updated minimum)
  return Math.max(3.0, penaltyScore);
};
