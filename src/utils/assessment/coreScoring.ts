
import { AssessmentMetrics, CEFRLevel } from "../../types/assessment";

/**
 * Calculate total score from metrics
 */
export const calculateTotalScore = (metrics: AssessmentMetrics): number => {
  const { fluency, grammar, pronunciation, prosody, vocabulary, syntax, coherence } = metrics;
  const sum = fluency + grammar + pronunciation + prosody + vocabulary + syntax + coherence;
  // Convert to a score out of 100
  return Math.round((sum / 70) * 100);
};

/**
 * Determine CEFR level based on total score
 */
export const determineCEFRLevel = (score: number): CEFRLevel => {
  if (score >= 95) return 'C2';
  if (score >= 85) return 'C1+';
  if (score >= 80) return 'C1';
  if (score >= 75) return 'B2+';
  if (score >= 65) return 'B2';
  if (score >= 55) return 'B1+';
  if (score >= 50) return 'B1';
  if (score >= 45) return 'A2+';
  if (score >= 35) return 'A2';
  if (score >= 25) return 'A1+';
  if (score >= 15) return 'A1';
  return 'Pre-A1';
};
