
/**
 * Apply penalties based on repetition count
 */
export const applyRepetitionPenalties = (baseScore: number, repetitionCount: number): number => {
  let penaltyScore = baseScore;
  
  // Calculate penalty using the helper function
  const penalty = calculateRepetitionPenalty(repetitionCount);
  
  // Apply penalty
  penaltyScore -= penalty;
  
  // Apply CEFR alignment ceiling: cap at 6.5 (B1-B2 level) for high repetition
  if (repetitionCount > 10) {
    penaltyScore = Math.min(penaltyScore, 6.5);
  }
  
  // Ensure score doesn't go below 1.0
  return Math.max(1.0, penaltyScore);
};

/**
 * Calculate repetition penalty based on count
 */
export const calculateRepetitionPenalty = (repetitionCount: number): number => {
  if (repetitionCount <= 2) {
    return 0; // No penalty for 1-2 repetitions
  } else if (repetitionCount <= 5) {
    return 0.5; // -0.5 for 3-5 repetitions
  } else if (repetitionCount <= 10) {
    return 1.0; // -1.0 for 6-10 repetitions
  } else {
    return 1.5; // -1.5 for >10 repetitions (maximum penalty)
  }
};
