
/**
 * Calculate fluency score based on syllables per minute (SPM)
 * 
 * New scoring criteria:
 * - <90 SPM → 3.0 (slow, hesitant)
 * - 90–120 SPM → 5.0–6.5 (moderate)
 * - 120–160 SPM → 7.0–8.5 (conversational)
 * - >160 SPM → 9.0+ (fast, possibly too fast)
 * 
 * With penalties:
 * - Deduct 1.0 if more than 2 repetitions detected
 * - Deduct 0.5 for 2+ pause segments > 800ms
 */
export const calculateFluencyScoreFromSyllables = (spm: number, pauseRatio: number): number => {
  // Base score based on syllables per minute
  let score = 0;
  
  // Apply the new scoring criteria
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
    score = 5.0;
  } else if (spm >= 80) {
    score = 4.0;
  } else if (spm >= 70) {
    score = 3.5;
  } else {
    score = 3.0; // Default for slow, hesitant speech
  }
  
  // Apply penalties for excessive pausing (high pause ratio)
  // This serves as a proxy for detecting repeated pause segments > 800ms
  if (pauseRatio > 0.3) {
    score -= 0.5; // Deduction for multiple long pauses
  }
  
  // In a production system, we would implement repetition detection
  // For now, we're assuming we don't have that data
  
  // Ensure score is between 1-10
  return Math.max(1, Math.min(10, score));
};
