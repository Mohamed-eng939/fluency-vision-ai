
/**
 * Calculate fluency score based on syllables per minute (SPM)
 * Maintains the established SPM ranges but with more balanced fallback logic
 */
export const calculateFluencyScoreFromSyllables = (spm: number, pauseRatio: number): number => {
  // Base score based on syllables per minute - keeping existing ranges
  let score = 0;
  
  // Apply the updated CEFR-aligned scoring criteria
  if (spm >= 160) {
    score = 9.0;
  } else if (spm >= 150) {
    score = 8.5;
  } else if (spm >= 140) {
    score = 8.0;
  } else if (spm >= 130) {
    score = 7.5;
  } else if (spm >= 120) {
    score = 7.0;
  } else if (spm >= 110) {
    score = 6.5;
  } else if (spm >= 100) {
    score = 6.0;
  } else if (spm >= 90) {
    score = 5.5; // Updated from 5.0
  } else if (spm >= 80) {
    score = 5.0; // Updated from 4.0
  } else if (spm >= 70) {
    score = 4.0; // Updated from 3.5
  } else {
    score = 3.5; // Updated from 3.0 - minimum raised
  }
  
  // Apply penalties for excessive pausing more selectively
  // Only penalize if pause ratio is very high (suggesting flow disruption)
  if (pauseRatio > 0.35) {
    score -= 0.5; // Deduction for excessive long pauses
  }
  
  // Ensure score is between 1-10
  return Math.max(1, Math.min(10, score));
};
