
/**
 * Utilities for detecting and handling level-specific coherence requirements
 */

/**
 * Attempt to determine if the response is likely from a lower level (A1-A2) speaker
 * This is a simplified approach - in a real system, this would use more sophisticated heuristics
 */
export const determineIfLowerLevel = (audioMetrics: any): boolean => {
  // Check if we have level information directly in the audioMetrics
  if (audioMetrics && audioMetrics.level) {
    const level = audioMetrics.level.toLowerCase();
    return level.includes('a1') || level.includes('a2');
  }
  
  // If no direct level information, try to infer from other metrics
  if (audioMetrics) {
    // Simple heuristic: if multiple metrics are low, likely a lower level speaker
    let lowMetricsCount = 0;
    
    // Check pronunciation score if available (typical indicator)
    if (audioMetrics.pronunciationScore !== undefined && audioMetrics.pronunciationScore < 6) {
      lowMetricsCount++;
    }
    
    // Check speech rate if available (typical indicator)
    if (audioMetrics.wordsPerMinute !== undefined && audioMetrics.wordsPerMinute < 80) {
      lowMetricsCount++;
    }
    
    // Check pause ratio if available (typical indicator)
    if (audioMetrics.pauseRatio !== undefined && audioMetrics.pauseRatio > 0.4) {
      lowMetricsCount++;
    }
    
    // If multiple metrics indicate lower level, return true
    return lowMetricsCount >= 2;
  }
  
  // Default to false if no useful information is available
  return false;
};

/**
 * Get level-appropriate thresholds for coherence scoring
 */
export const getLevelThresholds = (isLowerLevel: boolean) => {
  if (isLowerLevel) {
    return {
      maxCoherenceScore: 7.0,     // Cap for A1-A2 responses
      minHighSimilarity: 0.65,    // Min similarity for high similarity pairs
      requiredHighSimilarity: true // Require high similarity for scores > 6
    };
  }
  
  return {
    maxCoherenceScore: 10.0,     // No cap for B1+ responses
    minHighSimilarity: 0.65,     // Same threshold, but not strictly required
    requiredHighSimilarity: false // Don't require high similarity
  };
};

/**
 * Apply level-specific adjustments to coherence score
 */
export const applyLevelAdjustments = (
  score: number,
  isLowerLevel: boolean,
  highSimilarityPairFound: boolean,
  avgWordsPerSentence: number
): number => {
  // Get appropriate thresholds based on level
  const thresholds = getLevelThresholds(isLowerLevel);
  
  // Apply caps and adjustments based on level
  let adjustedScore = score;
  
  // Cap score based on level
  adjustedScore = Math.min(adjustedScore, thresholds.maxCoherenceScore);
  
  // For lower levels, apply stricter requirements
  if (isLowerLevel && thresholds.requiredHighSimilarity) {
    // Require high similarity pair for scores > 6
    if (!highSimilarityPairFound && adjustedScore > 6) {
      adjustedScore = 6;
    }
  }
  
  // If the average sentence length is too low, cap the score
  if (avgWordsPerSentence < 4) {
    adjustedScore = Math.min(adjustedScore, 5.0);
  }
  
  return adjustedScore;
};
