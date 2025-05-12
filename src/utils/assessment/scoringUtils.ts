
import { AssessmentMetrics, CEFRLevel } from '../../types/assessment';

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

/**
 * Calculate a criterion score based on audio metrics and transcript
 */
export const calculateCriterionScore = (
  criterion: string,
  audioMetrics: any,
  transcript: string
): number => {
  // In a real implementation, this would use sophisticated analysis
  // For now, we'll use a simplified mapping
  switch (criterion) {
    case 'Fluency & Coherence':
    case 'Fluency':
      return audioMetrics.fluency;
    case 'Pronunciation':
      return audioMetrics.pronunciation;
    case 'Prosody':
      return audioMetrics.pausePattern;
    // For other criteria, we'd need deeper text analysis
    // This is a placeholder implementation
    default:
      // Return a value between 6-9 for now
      return Math.random() * 3 + 6;
  }
};

/**
 * Get specific feedback for a criterion based on score and level
 */
export const getCriterionFeedback = (criterion: string, score: number, level: string): string => {
  // This would be expanded with much more detailed, criterion-specific feedback
  if (score > 8) {
    return `Your ${criterion} shows excellent mastery at ${level} level. Keep up the great work!`;
  } else if (score > 6) {
    return `Your ${criterion} is good for ${level} level, showing solid competence with minor areas to improve.`;
  } else if (score > 4) {
    return `Your ${criterion} is adequate for ${level} level, but shows several areas where focused practice would help.`;
  } else {
    return `Your ${criterion} needs significant improvement to meet ${level} level standards. Consider focused practice.`;
  }
};
