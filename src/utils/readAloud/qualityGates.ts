import { PronunciationAnalysis } from './types';

export interface QualityGateResult {
  shouldReject: boolean;
  rejectionReason?: string;
  fallbackScore?: number;
  requiresPractice?: boolean;
}

export interface ReadAloudMetrics {
  speakingTime: number;
  totalDuration: number;
  alignedWords: number;
  totalWords: number;
  phonemeAccuracy: number;
  asrConfidence: number;
  transcriptLength: number;
}

/**
 * Apply quality gates to determine if recording should be rejected or flagged
 */
export const applyQualityGates = (
  metrics: ReadAloudMetrics,
  band: string
): QualityGateResult => {
  const {
    speakingTime,
    alignedWords,
    totalWords,
    phonemeAccuracy,
    asrConfidence,
    transcriptLength
  } = metrics;

  // Gate 1: Recording too short or unclear
  if (speakingTime < 1.5 || (alignedWords / totalWords) < 0.6) {
    return {
      shouldReject: true,
      rejectionReason: "Recording too short/unclear — please re-record."
    };
  }

  // Gate 2: Insufficient data for complex prompts
  const isComplexPrompt = band === 'B2' || band === 'C1';
  if (asrConfidence < 0.7 || (isComplexPrompt && transcriptLength < 8)) {
    return {
      shouldReject: true,
      rejectionReason: "Insufficient data for reliable scoring."
    };
  }

  // Gate 3: Very poor pronunciation - don't tank completely but flag for practice
  if (phonemeAccuracy < 0.65) {
    return {
      shouldReject: false,
      fallbackScore: 3.0,
      requiresPractice: true
    };
  }

  return { shouldReject: false };
};