
/**
 * Advanced fluency scoring system that combines multiple metrics
 * to provide a comprehensive fluency assessment
 */

import { AudioAnalysisResult } from '../../audio/types';
import { analyzePauseQuality } from './pauseQualityAnalyzer';

export interface FluencyAssessmentResult {
  fluencyScore: number;
  cefrFluencyLevel: string;
  fluencyJustification: string;
}

/**
 * Calculate composite fluency score from audio metrics
 * Returns a score on a scale of 1.0-10.0
 */
export function calculateCompositeFluencyScore(audioMetrics: AudioAnalysisResult): FluencyAssessmentResult {
  // Extract required metrics, providing fallbacks if not available
  const syllablesPerMinute = audioMetrics.syllablesPerMinute || 
    estimateSyllablesPerMinuteFromWPM(audioMetrics.wpm);
  const pauseDurations = audioMetrics.pauseDurations || [];
  const mlr = audioMetrics.mlrScore || estimateMLRFromPauses(pauseDurations.length, audioMetrics.totalWords);
  const articulationRate = audioMetrics.articulationRate || 
    estimateArticulationRate(syllablesPerMinute, audioMetrics.pauseRatio || 0);
  const hesitationCount = audioMetrics.hesitationCount || 0;
  const repetitionCount = audioMetrics.repetitionCount || 0;
  
  // Step 1: Calculate base score from syllables per minute
  let baseScore = getBaseScoreFromSPM(syllablesPerMinute);
  let justification = `Base fluency score: ${baseScore.toFixed(1)} based on speech rate of ${syllablesPerMinute.toFixed(1)} syllables per minute. `;
  
  // Track penalties for justification
  const penalties = [];
  
  // Step 2: Apply pause ratio penalty
  if (audioMetrics.pauseRatio && audioMetrics.pauseRatio > 0.3) {
    baseScore -= 0.5;
    penalties.push(`-0.5 for high pause ratio (${(audioMetrics.pauseRatio * 100).toFixed(1)}%)`);
  }
  
  // Step 3: Apply disfluent pauses penalty
  // Check for disfluent pauses that are close together (<2s apart)
  const closeDisfluentPauses = countCloseDisfluentPauses(pauseDurations);
  if (closeDisfluentPauses >= 3) {
    baseScore -= 0.5;
    penalties.push(`-0.5 for ${closeDisfluentPauses} closely spaced disfluent pauses`);
  }
  
  // Step 4: Apply hesitation markers penalty
  if (hesitationCount >= 6) {
    baseScore -= 1.0;
    penalties.push(`-1.0 for high hesitation marker count (${hesitationCount})`);
  }
  
  // Step 5: Apply repetition count penalty
  if (repetitionCount >= 6) {
    baseScore -= 1.0;
    penalties.push(`-1.0 for high repetition count (${repetitionCount})`);
  }
  
  // Step 6: Apply Mean Length of Runs (MLR) penalty
  if (mlr < 4.0) {
    baseScore -= 0.5;
    penalties.push(`-0.5 for low Mean Length of Runs (${mlr.toFixed(1)})`);
  }
  
  // Step 7: Apply articulation rate penalty
  if (articulationRate < 3.0) {
    baseScore -= 0.5;
    penalties.push(`-0.5 for low articulation rate (${articulationRate.toFixed(1)} syllables/second)`);
  }
  
  // Cap score between 1.0 and 10.0
  const finalScore = Math.min(10.0, Math.max(1.0, baseScore));
  
  // Map score to CEFR level
  const cefrLevel = mapFluencyScoreToCEFR(finalScore);
  
  // Build final justification string
  if (penalties.length > 0) {
    justification += `Penalties applied: ${penalties.join(', ')}. `;
  }
  justification += `Final fluency score: ${finalScore.toFixed(1)} (${cefrLevel}).`;
  
  return {
    fluencyScore: finalScore,
    cefrFluencyLevel: cefrLevel,
    fluencyJustification: justification
  };
}

/**
 * Get base fluency score from syllables per minute (SPM)
 */
function getBaseScoreFromSPM(spm: number): number {
  // <90 → 3.0
  if (spm < 90) return 3.0;
  
  // 90–120 → 5.0–6.5
  if (spm < 120) {
    // Linear interpolation between 5.0 and 6.5
    return 5.0 + ((spm - 90) / 30) * 1.5;
  }
  
  // 120–160 → 7.0–8.5
  if (spm < 160) {
    // Linear interpolation between 7.0 and 8.5
    return 7.0 + ((spm - 120) / 40) * 1.5;
  }
  
  // >160 → 9.0+
  return 9.0;
}

/**
 * Map fluency score to CEFR level
 */
function mapFluencyScoreToCEFR(score: number): string {
  if (score <= 2.0) return 'A1';
  if (score <= 4.0) return 'A2';
  if (score <= 5.5) return 'B1';
  if (score <= 7.0) return 'B2';
  if (score <= 8.5) return 'C1';
  return 'C2';
}

/**
 * Count closely spaced disfluent pauses (<2s apart)
 */
function countCloseDisfluentPauses(pauseDurations: any[]): number {
  if (!pauseDurations || pauseDurations.length === 0) return 0;
  
  let closeDisfluentCount = 0;
  
  for (let i = 1; i < pauseDurations.length; i++) {
    const currentPause = pauseDurations[i];
    const previousPause = pauseDurations[i - 1];
    
    // If we have start times for both pauses
    if (currentPause.position && previousPause.position) {
      const timeBetweenPauses = currentPause.position - previousPause.position;
      if (timeBetweenPauses < 2.0) {
        closeDisfluentCount++;
      }
    }
  }
  
  return closeDisfluentCount;
}

/**
 * Estimate syllables per minute from words per minute
 * Average English word is ~1.5 syllables
 */
function estimateSyllablesPerMinuteFromWPM(wpm: number): number {
  return wpm * 1.5;
}

/**
 * Estimate MLR from pause count and total words
 */
function estimateMLRFromPauses(pauseCount: number, totalWords: number): number {
  // Add 1 to pause count to get run count
  const runCount = pauseCount + 1 || 1; // Avoid division by zero
  
  // Assume average of 1.5 syllables per word
  const estimatedSyllables = totalWords * 1.5;
  
  return estimatedSyllables / runCount;
}

/**
 * Estimate articulation rate from SPM and pause ratio
 */
function estimateArticulationRate(spm: number, pauseRatio: number): number {
  // Convert SPM to syllables per second
  const sps = spm / 60;
  
  // Adjust for pause ratio (higher pause ratio means more speech compression)
  const adjustedSPS = pauseRatio > 0 ? sps / (1 - pauseRatio) : sps;
  
  return adjustedSPS;
}
