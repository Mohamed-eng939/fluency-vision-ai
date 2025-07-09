/**
 * Expert-aligned fluency scoring based on IELTS/PTE band descriptors
 * Uses SPM (Syllables per Minute) with human examiner-like thresholds
 */

export interface FluencyAnalysis {
  spm: number;
  pauseRatio: number;
  repetitionCount: number;
  hesitationCount: number;
  bandScore: number;
  fallbackUsed: boolean;
  bandJustification: string;
}

/**
 * Calculate expert-aligned fluency score using IELTS/PTE band descriptors
 */
export const calculateExpertFluencyScore = (
  spm: number, 
  pauseRatio: number, 
  repetitionCount: number = 0, 
  hesitationCount: number = 0
): FluencyAnalysis => {
  let baseScore = getBandFromSPM(spm);
  let justification = `SPM: ${spm}`;
  
  // Apply repetition modifiers (IELTS-aligned)
  if (repetitionCount >= 8) {
    // Major disruption - cap at Band 6.5 per IELTS descriptors
    baseScore = Math.min(baseScore, 6.5);
    justification += `, repetitions: ${repetitionCount} (major disruption)`;
  } else if (repetitionCount >= 4) {
    // Minor disfluencies - subtract 0.5
    baseScore -= 0.5;
    justification += `, repetitions: ${repetitionCount} (minor disfluency)`;
  }
  
  // Apply hesitation modifiers
  if (hesitationCount >= 6) {
    // Frequent hesitation - cap at Band 6.5
    baseScore = Math.min(baseScore, 6.5);
    justification += `, hesitations: ${hesitationCount} (frequent)`;
  } else if (hesitationCount >= 3) {
    // Some hesitation - subtract 0.5
    baseScore -= 0.5;
    justification += `, hesitations: ${hesitationCount} (noticeable)`;
  }
  
  // Apply pause ratio penalty (excessive pausing)
  if (pauseRatio > 0.4) {
    baseScore = Math.min(baseScore, 6.0); // Cap for excessive pausing
    justification += `, pause ratio: ${pauseRatio.toFixed(2)} (excessive)`;
  } else if (pauseRatio > 0.3) {
    baseScore -= 0.5;
    justification += `, pause ratio: ${pauseRatio.toFixed(2)} (noticeable)`;
  }
  
  // Ensure score is within valid band range
  const finalScore = Math.max(1.0, Math.min(9.0, baseScore));
  
  return {
    spm,
    pauseRatio,
    repetitionCount,
    hesitationCount,
    bandScore: Math.round(finalScore * 2) / 2, // Round to nearest 0.5
    fallbackUsed: false,
    bandJustification: justification
  };
};

/**
 * Map SPM to IELTS band scores using expert examiner thresholds
 */
function getBandFromSPM(spm: number): number {
  if (spm >= 150) {
    return spm >= 160 ? 9.0 : 8.5; // >150 SPM → Band 8.5–9.0 (if intelligible)
  } else if (spm >= 121) {
    return 7.0 + ((spm - 121) / 29) * 1.0; // 121–150 SPM → Band 7.0–8.0
  } else if (spm >= 90) {
    return 5.5 + ((spm - 90) / 30) * 1.0; // 90–120 SPM → Band 5.5–6.5
  } else {
    return Math.max(4.0, 4.0 + (spm - 60) / 30); // <90 SPM → Band 4.0–5.0 (slow, hesitant)
  }
}

/**
 * Convert band score to 1-10 scale for system compatibility
 */
export const convertBandToTenScale = (bandScore: number): number => {
  return Math.round(((bandScore - 1) / 8) * 9 + 1);
};

/**
 * Convert 1-10 scale back to band score
 */
export const convertTenScaleToBand = (tenScore: number): number => {
  return Math.round((((tenScore - 1) / 9) * 8 + 1) * 2) / 2;
};