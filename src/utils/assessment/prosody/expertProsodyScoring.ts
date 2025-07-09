/**
 * Expert-aligned prosody scoring based on IELTS/PTE band descriptors
 * Measures pitch range, rhythm regularity, and stress placement
 */

export interface ProsodyAnalysis {
  pitchRange: number; // 0-100%
  rhythmRegularity: number; // 0-100%
  stressPlacement: number; // 0-100%
  naturalness: number; // 1-5 scale
  bandScore: number;
  fallbackUsed: boolean;
  bandJustification: string;
  prosodyFeatures: {
    isMonotone: boolean;
    hasUnaturalTiming: boolean;
    hasGoodStressVariation: boolean;
  };
}

/**
 * Calculate expert-aligned prosody score using IELTS/PTE descriptors
 */
export const calculateExpertProsodyScore = (
  audioMetrics: any,
  transcript?: string
): ProsodyAnalysis => {
  
  // Extract prosodic features from audio metrics
  const prosodyData = extractProsodyFeatures(audioMetrics);
  
  // Calculate component scores
  const pitchRange = calculatePitchRange(prosodyData);
  const rhythmRegularity = calculateRhythmRegularity(prosodyData);
  const stressPlacement = calculateStressPlacement(prosodyData, transcript);
  
  // Assess overall naturalness
  const naturalness = assessNaturalness(pitchRange, rhythmRegularity, stressPlacement);
  
  // Detect problematic features
  const prosodyFeatures = {
    isMonotone: pitchRange < 30,
    hasUnaturalTiming: rhythmRegularity < 40,
    hasGoodStressVariation: stressPlacement > 70
  };
  
  // Determine band score
  const baseScore = getBandFromProsodyProfile(
    pitchRange,
    rhythmRegularity,
    stressPlacement,
    naturalness
  );
  
  const justification = createProsodyJustification(
    pitchRange,
    rhythmRegularity,
    stressPlacement,
    prosodyFeatures
  );
  
  let finalScore = baseScore;
  
  // Apply penalties and caps
  if (prosodyFeatures.isMonotone || prosodyFeatures.hasUnaturalTiming) {
    finalScore = Math.min(finalScore, 6.0); // Cap for monotone or unnatural timing
  }
  
  if (prosodyFeatures.hasGoodStressVariation && rhythmRegularity > 70) {
    finalScore += 0.5; // Bonus for excellent prosody
  }
  
  // Ensure score is within valid band range
  finalScore = Math.max(1.0, Math.min(9.0, finalScore));
  
  return {
    pitchRange,
    rhythmRegularity,
    stressPlacement,
    naturalness,
    bandScore: Math.round(finalScore * 2) / 2, // Round to nearest 0.5
    fallbackUsed: prosodyData.fallbackUsed,
    bandJustification: justification,
    prosodyFeatures
  };
};

/**
 * Extract prosody features from audio metrics
 */
function extractProsodyFeatures(audioMetrics: any): {
  pitchVariance: number;
  pausePattern: number;
  speechRate: number;
  energyVariance: number;
  fallbackUsed: boolean;
} {
  // Try to use openSMILE or similar audio analysis features
  if (audioMetrics.prosodyAnalysis) {
    return {
      pitchVariance: audioMetrics.prosodyAnalysis.pitch_variance || 0,
      pausePattern: audioMetrics.prosodyAnalysis.pause_pattern || 0,
      speechRate: audioMetrics.prosodyAnalysis.speech_rate || 0,
      energyVariance: audioMetrics.prosodyAnalysis.energy_variance || 0,
      fallbackUsed: false
    };
  }
  
  // Fallback to existing metrics
  return {
    pitchVariance: audioMetrics.prosody || 50, // Use existing prosody score as pitch variance
    pausePattern: audioMetrics.pausePattern || 50,
    speechRate: audioMetrics.speechRate || audioMetrics.wpm || 120,
    energyVariance: audioMetrics.energyVariance || 50,
    fallbackUsed: true
  };
}

/**
 * Calculate pitch range score (0-100%)
 */
function calculatePitchRange(prosodyData: any): number {
  // Convert pitch variance to percentage
  const pitchRange = Math.min(100, Math.max(0, prosodyData.pitchVariance));
  
  // Normalize if it seems to be on a different scale
  if (pitchRange <= 10) {
    return pitchRange * 10; // Scale up if it's on 0-10 scale
  }
  
  return pitchRange;
}

/**
 * Calculate rhythm regularity score (0-100%)
 */
function calculateRhythmRegularity(prosodyData: any): number {
  // Use pause pattern and speech rate to assess rhythm
  const pauseScore = Math.min(100, Math.max(0, prosodyData.pausePattern));
  const rateConsistency = assessRateConsistency(prosodyData.speechRate);
  
  // Combine pause pattern and rate consistency
  return (pauseScore + rateConsistency) / 2;
}

/**
 * Assess speech rate consistency
 */
function assessRateConsistency(speechRate: number): number {
  // Ideal speech rate is around 120-150 WPM
  const idealRate = 135;
  const deviation = Math.abs(speechRate - idealRate);
  
  if (deviation <= 15) return 100; // Excellent rate
  if (deviation <= 30) return 80;  // Good rate
  if (deviation <= 50) return 60;  // Acceptable rate
  if (deviation <= 70) return 40;  // Poor rate
  return 20; // Very poor rate
}

/**
 * Calculate stress placement score (0-100%)
 */
function calculateStressPlacement(prosodyData: any, transcript?: string): number {
  // If we have energy variance data, use it
  if (prosodyData.energyVariance) {
    return Math.min(100, Math.max(0, prosodyData.energyVariance));
  }
  
  // Fallback: estimate from transcript length and complexity
  if (transcript) {
    const words = transcript.split(/\s+/).filter(w => w.length > 0);
    const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
    
    // Longer words generally require better stress placement
    if (avgWordLength > 6) return 70; // Complex vocabulary suggests good stress
    if (avgWordLength > 4) return 60; // Moderate complexity
    return 50; // Simple vocabulary, average stress
  }
  
  return 50; // Default middle score
}

/**
 * Assess overall naturalness (1-5 scale)
 */
function assessNaturalness(pitchRange: number, rhythmRegularity: number, stressPlacement: number): number {
  const average = (pitchRange + rhythmRegularity + stressPlacement) / 3;
  
  if (average >= 80) return 5; // Very natural
  if (average >= 65) return 4; // Natural
  if (average >= 50) return 3; // Somewhat natural
  if (average >= 35) return 2; // Unnatural
  return 1; // Very unnatural
}

/**
 * Determine band score from prosody profile
 */
function getBandFromProsodyProfile(
  pitchRange: number,
  rhythmRegularity: number,
  stressPlacement: number,
  naturalness: number
): number {
  
  // Natural pitch/stress variation → Band 8–9
  if (naturalness >= 4 && pitchRange > 70 && stressPlacement > 70) {
    return naturalness >= 4.5 ? 9.0 : 8.5;
  }
  
  // Some rhythm issues → Band 7
  if (naturalness >= 3 && rhythmRegularity > 60) {
    return pitchRange > 60 ? 7.5 : 7.0;
  }
  
  // Monotone or unnatural timing → cap at Band 6
  if (pitchRange < 30 || rhythmRegularity < 40) {
    return 6.0;
  }
  
  // Average prosody → Band 6-7
  if (naturalness >= 3) {
    return 6.5;
  }
  
  // Poor prosody → Band 4-5
  return naturalness >= 2 ? 5.0 : 4.5;
}

/**
 * Create justification text for prosody score
 */
function createProsodyJustification(
  pitchRange: number,
  rhythmRegularity: number,
  stressPlacement: number,
  features: any
): string {
  const pitchLevel = pitchRange > 70 ? 'varied' : pitchRange > 40 ? 'adequate' : 'limited';
  const rhythmLevel = rhythmRegularity > 70 ? 'natural' : rhythmRegularity > 40 ? 'adequate' : 'irregular';
  const stressLevel = stressPlacement > 70 ? 'appropriate' : stressPlacement > 40 ? 'adequate' : 'poor';
  
  let issues = [];
  if (features.isMonotone) issues.push('monotone');
  if (features.hasUnaturalTiming) issues.push('irregular timing');
  
  const issueText = issues.length > 0 ? `, ${issues.join(', ')}` : '';
  
  return `${pitchLevel} pitch, ${rhythmLevel} rhythm, ${stressLevel} stress${issueText}`;
}