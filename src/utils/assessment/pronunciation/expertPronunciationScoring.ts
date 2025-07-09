/**
 * Expert-aligned pronunciation scoring based on IELTS/PTE band descriptors
 * Uses phoneme alignment accuracy and prosodic features
 */

export interface PronunciationAnalysis {
  phonemeAccuracy: number;
  stressAccuracy: number;
  intonationQuality: number;
  intelligibilityScore: number;
  bandScore: number;
  fallbackUsed: boolean;
  bandJustification: string;
}

/**
 * Calculate expert-aligned pronunciation score using IELTS/PTE descriptors
 */
export const calculateExpertPronunciationScore = (
  phonemeAccuracy: number, // 0-100%
  stressAccuracy?: number, // 0-100%
  intonationQuality?: number, // 0-100%
  hasSignificantL1Transfer?: boolean
): PronunciationAnalysis => {
  
  let baseScore = getBandFromPhonemeAccuracy(phonemeAccuracy);
  let justification = `Phoneme accuracy: ${phonemeAccuracy.toFixed(1)}%`;
  
  // Apply stress pattern modifiers
  if (stressAccuracy !== undefined) {
    if (stressAccuracy < 60) {
      baseScore = Math.min(baseScore, 6.5); // Cap for poor stress patterns
      justification += `, stress issues`;
    } else if (stressAccuracy >= 85) {
      baseScore += 0.5; // Bonus for excellent stress
      justification += `, good stress`;
    }
  }
  
  // Apply intonation modifiers
  if (intonationQuality !== undefined) {
    if (intonationQuality < 50) {
      baseScore = Math.min(baseScore, 6.0); // Cap for monotone/unnatural intonation
      justification += `, intonation issues`;
    } else if (intonationQuality >= 80) {
      baseScore += 0.5; // Bonus for natural intonation
      justification += `, natural intonation`;
    }
  }
  
  // Apply L1 transfer penalty
  if (hasSignificantL1Transfer) {
    baseScore = Math.min(baseScore, 7.0); // Cap for significant L1 interference
    justification += `, L1 transfer effects`;
  }
  
  // Ensure score is within valid band range
  const finalScore = Math.max(1.0, Math.min(9.0, baseScore));
  
  return {
    phonemeAccuracy,
    stressAccuracy: stressAccuracy || 0,
    intonationQuality: intonationQuality || 0,
    intelligibilityScore: phonemeAccuracy,
    bandScore: Math.round(finalScore * 2) / 2, // Round to nearest 0.5
    fallbackUsed: false,
    bandJustification: justification
  };
};

/**
 * Map phoneme accuracy percentage to IELTS band scores
 */
function getBandFromPhonemeAccuracy(accuracy: number): number {
  if (accuracy >= 85) {
    return 8.0 + ((accuracy - 85) / 15) * 1.0; // >85% → Band 8–9
  } else if (accuracy >= 75) {
    return 7.0 + ((accuracy - 75) / 10) * 1.0; // 75–85% → Band 7
  } else if (accuracy >= 60) {
    return 6.0 + ((accuracy - 60) / 15) * 1.0; // 60–74% → Band 6
  } else {
    return Math.max(4.0, 4.0 + ((accuracy - 40) / 20) * 1.0); // <60% → Band 4–5
  }
}

/**
 * Calculate pronunciation score from existing audioMetrics (backward compatibility)
 */
export const calculateEnhancedPronunciationScore = (
  audioMetrics: any,
  transcript: string
): number => {
  // If we have MFA pronunciation details, use enhanced scoring
  if (audioMetrics.pronunciationDetails?.phoneme_accuracy) {
    const analysis = calculateExpertPronunciationScore(
      audioMetrics.pronunciationDetails.phoneme_accuracy * 100,
      audioMetrics.pronunciationDetails.stress_accuracy * 100,
      audioMetrics.prosody ? audioMetrics.prosody * 10 : undefined,
      audioMetrics.hasL1Transfer
    );
    
    // Store analysis for feedback
    audioMetrics.pronunciationAnalysis = analysis;
    
    // Convert band to 10-scale for system compatibility
    return Math.round(((analysis.bandScore - 1) / 8) * 9 + 1);
  }
  
  // Fallback to existing logic with improved mapping
  const confidenceScore = audioMetrics.confidenceScore || 0.7;
  const phonemeAccuracy = confidenceScore * 100;
  
  const analysis = calculateExpertPronunciationScore(
    phonemeAccuracy,
    undefined,
    audioMetrics.prosody ? audioMetrics.prosody * 10 : undefined
  );
  
  analysis.fallbackUsed = true;
  audioMetrics.pronunciationAnalysis = analysis;
  
  return Math.round(((analysis.bandScore - 1) / 8) * 9 + 1);
};