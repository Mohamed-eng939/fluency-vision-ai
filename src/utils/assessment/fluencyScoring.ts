import { AudioAnalysisResult } from "../../types/assessment";
import { detectHesitationMarkers } from "../audio/hesitationDetector";

/**
 * Calculate fluency score based on syllables per minute instead of WPM
 */
export const calculateFluencyScore = (
  audioMetrics: any,
  transcript: string
): number => {
  // If we have syllables per minute data, use it
  if (audioMetrics.syllablesPerMinute !== undefined) {
    // Get base score from SPM
    let score = calculateFluencyScoreFromSyllables(audioMetrics.syllablesPerMinute, audioMetrics.pauseRatio || 0.2);
    
    // Apply hesitation marker penalties if transcript is available
    if (transcript) {
      score = applyHesitationPenalties(score, transcript);
      
      // Store the hesitation analysis in audioMetrics for feedback generation
      const hesitationAnalysis = detectHesitationMarkers(transcript);
      if (audioMetrics) {
        audioMetrics.hesitationCount = hesitationAnalysis.count;
        audioMetrics.hesitationRatio = hesitationAnalysis.ratio;
        audioMetrics.hesitationMarkers = hesitationAnalysis.markers;
      }
    }
    
    return score;
  }
  
  // Otherwise, estimate syllable count from transcript and calculate SPM
  const syllableCount = estimateSyllableCount(transcript);
  const durationInMinutes = audioMetrics.totalDuration ? audioMetrics.totalDuration / 60 : 1;
  const estimatedSyllablesPerMinute = syllableCount / durationInMinutes;
  
  // Get base score using estimated syllables per minute
  let score = calculateFluencyScoreFromSyllables(estimatedSyllablesPerMinute, audioMetrics.pauseRatio || 0.2);
  
  // Apply hesitation marker penalties
  if (transcript) {
    score = applyHesitationPenalties(score, transcript);
    
    // Store the hesitation analysis in audioMetrics for feedback generation
    const hesitationAnalysis = detectHesitationMarkers(transcript);
    if (audioMetrics) {
      audioMetrics.hesitationCount = hesitationAnalysis.count;
      audioMetrics.hesitationRatio = hesitationAnalysis.ratio;
      audioMetrics.hesitationMarkers = hesitationAnalysis.markers;
    }
  }
  
  return score;
};

/**
 * Apply penalties based on hesitation markers/filler words
 */
export const applyHesitationPenalties = (baseScore: number, transcript: string): number => {
  // Get hesitation markers from transcript
  const hesitationAnalysis = detectHesitationMarkers(transcript);
  const markerCount = hesitationAnalysis.count;
  
  let penaltyScore = baseScore;
  
  // Apply penalties based on marker count
  if (markerCount >= 3 && markerCount <= 5) {
    // 3-5 markers: -0.5 penalty
    penaltyScore -= 0.5;
  } else if (markerCount >= 6 && markerCount <= 10) {
    // 6-10 markers: -1.0 penalty
    penaltyScore -= 1.0;
  } else if (markerCount > 10) {
    // >10 markers: -1.5 penalty
    penaltyScore -= 1.5;
    
    // Apply CEFR alignment ceiling: cap at 7.0 (B2 level) for high hesitation
    penaltyScore = Math.min(penaltyScore, 7.0);
  }
  
  // Ensure score doesn't go below 1.0
  return Math.max(1.0, penaltyScore);
};

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

/**
 * Estimate syllable count from English text
 * This is a simplified algorithm - a more accurate algorithm would use a dictionary
 */
export const estimateSyllableCount = (text: string): number => {
  if (!text) return 0;
  
  const words = text.toLowerCase().split(/\s+/);
  let count = 0;
  
  for (const word of words) {
    if (word.length <= 3) {
      // Short words generally have 1 syllable
      count += 1;
      continue;
    }
    
    // Count vowel groups as syllables
    const vowelGroups = word.match(/[aeiouy]+/g);
    if (!vowelGroups) {
      count += 1;
      continue;
    }
    
    let syllables = vowelGroups.length;
    
    // Subtract silent 'e' at the end
    if (word.endsWith('e') && syllables > 1) {
      syllables--;
    }
    
    // Add the syllables for this word
    count += syllables || 1;
  }
  
  return Math.max(count, 1);
};
