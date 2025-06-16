
/**
 * Local prosody analysis fallback system
 */

import { ProsodyAnalysisResult } from '@/types/assessment/audio';

export interface LocalProsodyEstimate {
  pitch_mean: number;
  pitch_std_dev: number;
  tempo_bpm: number;
  opensmile_features: string;
  cefr_level: string;
  analysisTimestamp: number;
  isFallback: true;
  fallbackReason: string;
}

/**
 * Generate local prosody estimate based on audio characteristics
 */
export const generateLocalProsodyEstimate = (
  audioBlob: Blob,
  transcript?: string,
  failureReason: string = 'External API unavailable'
): LocalProsodyEstimate => {
  // Basic heuristics based on transcript length and audio duration
  const transcriptLength = transcript?.length || 0;
  const estimatedWords = transcript ? transcript.split(/\s+/).length : 0;
  
  // Estimate tempo based on transcript characteristics
  let estimatedTempo = 120; // Default moderate tempo
  if (transcriptLength > 200) {
    estimatedTempo = 140; // Faster for longer responses
  } else if (transcriptLength < 50) {
    estimatedTempo = 100; // Slower for shorter responses
  }
  
  // Estimate pitch variation based on complexity
  let pitchVariation = 25; // Default moderate variation
  if (estimatedWords > 50) {
    pitchVariation = 30; // More variation for complex speech
  } else if (estimatedWords < 20) {
    pitchVariation = 15; // Less variation for simple speech
  }
  
  // Estimate CEFR level based on transcript complexity
  let estimatedCEFR = 'B1';
  if (estimatedWords > 80 && transcriptLength > 300) {
    estimatedCEFR = 'B2';
  } else if (estimatedWords < 30 || transcriptLength < 100) {
    estimatedCEFR = 'A2';
  }
  
  return {
    pitch_mean: 150 + (Math.random() * 40 - 20), // 130-170 Hz range
    pitch_std_dev: pitchVariation + (Math.random() * 10 - 5),
    tempo_bpm: estimatedTempo + (Math.random() * 20 - 10),
    opensmile_features: `Local estimate - ${failureReason}`,
    cefr_level: estimatedCEFR,
    analysisTimestamp: Date.now(),
    isFallback: true,
    fallbackReason
  };
};

/**
 * Check if prosody result is from fallback
 */
export const isProsodyFallback = (result: any): result is LocalProsodyEstimate => {
  return result && result.isFallback === true;
};
