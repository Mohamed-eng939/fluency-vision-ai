
/**
 * Apply penalties based on repetition count
 * Updated thresholds to be more forgiving for ESL learners
 */
export const applyRepetitionPenalties = (baseScore: number, repetitionCount: number): number => {
  let penaltyScore = baseScore;
  
  // Calculate penalty using the helper function
  const penalty = calculateRepetitionPenalty(repetitionCount);
  
  // Apply penalty
  penaltyScore -= penalty;
  
  // Note: Capping is now handled in main function with smart logic
  
  // Ensure score doesn't go below 1.0
  return Math.max(1.0, penaltyScore);
};

/**
 * Calculate repetition penalty based on count
 * Updated to be more forgiving for natural learner speech patterns
 */
export const calculateRepetitionPenalty = (repetitionCount: number): number => {
  if (repetitionCount <= 4) {
    return 0; // No penalty for 1-4 repetitions (natural self-correction)
  } else if (repetitionCount <= 7) {
    return 0.5; // -0.5 for 5-7 repetitions (moderate self-correction)
  } else if (repetitionCount <= 11) {
    return 1.0; // -1.0 for 8-11 repetitions (noticeable disfluency)
  } else {
    return 1.5; // -1.5 for 12+ repetitions (significant flow disruption)
  }
};
