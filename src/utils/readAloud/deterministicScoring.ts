import { PronunciationAnalysis, IPAError, BandTargets, DeterministicScoringConfig } from './types';
import { applyQualityGates, ReadAloudMetrics } from './qualityGates';

// Band-specific targets and leniency factors
const BAND_TARGETS: Record<string, BandTargets> = {
  A1: {
    phonesRange: [18, 28],
    targetPA: 0.92,
    targetWA: 0.95,
    arTarget: [8, 13],
    pauseRatioTarget: 0.18,
    leniency: 0.00
  },
  A2: {
    phonesRange: [28, 40],
    targetPA: 0.90,
    targetWA: 0.93,
    arTarget: [8, 13],
    pauseRatioTarget: 0.20,
    leniency: 0.02
  },
  B1: {
    phonesRange: [40, 60],
    targetPA: 0.88,
    targetWA: 0.92,
    arTarget: [8, 13],
    pauseRatioTarget: 0.22,
    leniency: 0.05
  },
  B2: {
    phonesRange: [60, 85],
    targetPA: 0.86,
    targetWA: 0.90,
    arTarget: [8, 13],
    pauseRatioTarget: 0.24,
    leniency: 0.08
  },
  C1: {
    phonesRange: [85, 120],
    targetPA: 0.84,
    targetWA: 0.88,
    arTarget: [8, 13],
    pauseRatioTarget: 0.26,
    leniency: 0.10
  }
};

// Phoneme criticality weights
const PHONEME_CRITICALITY: Record<string, number> = {
  'θ': 1.25,  // voiceless th
  'ð': 1.25,  // voiced th
  'r': 1.15,  // r/l confusion
  'l': 1.15,
  'v': 1.10,
  'w': 1.10,
  'p': 1.10,
  'b': 1.10,
  't': 1.10,
  'd': 1.10,
  'k': 1.10,
  'g': 1.10
};

// Error base costs
const ERROR_BASE_COSTS = {
  substitution: 1.0,
  deletion: 1.2,
  insertion: 0.8,
  stressError: 0.6,
  finalConsonantDeletion: 0.2
};

const DEFAULT_CONFIG: DeterministicScoringConfig = {
  bandTargets: BAND_TARGETS,
  phonemeCriticality: PHONEME_CRITICALITY,
  errorBaseCosts: ERROR_BASE_COSTS,
  featureWeights: {
    basePronWeight: 0.85,
    timingWeight: 0.15
  },
  basePronWeights: {
    phonemeAccuracy: 0.60,
    wordAccuracy: 0.30,
    stressAccuracy: 0.10
  }
};

/**
 * Calculate Mispronunciation Severity Index (MSI) from IPA errors
 */
export const calculateMSI = (
  errors: IPAError[],
  totalPhones: number,
  config: DeterministicScoringConfig = DEFAULT_CONFIG
): number => {
  let totalSeverity = 0;

  errors.forEach(error => {
    let baseCost = config.errorBaseCosts[error.type] || 1.0;
    
    // Apply phoneme criticality weight
    const criticalityWeight = config.phonemeCriticality[error.phoneme] || 1.0;
    
    // Add extra penalty for final consonant deletion
    if (error.type === 'deletion' && error.position > 0.8 * totalPhones) {
      baseCost += config.errorBaseCosts.finalConsonantDeletion;
    }
    
    totalSeverity += baseCost * criticalityWeight;
  });

  // Normalize by total phones and clamp
  const msi = totalSeverity / totalPhones;
  return Math.min(msi, 0.30); // Clamp to avoid outliers
};

/**
 * Calculate timing score (0-10) based on articulation rate and pause ratio
 */
export const calculateTimingScore = (
  articulationRate: number,
  pauseRatio: number,
  band: string,
  config: DeterministicScoringConfig = DEFAULT_CONFIG
): number => {
  let score = 10;
  const bandTargets = config.bandTargets[band];
  
  if (!bandTargets) return score;
  
  // Articulation rate penalty (outside 8-13 phones/sec)
  const [minAR, maxAR] = bandTargets.arTarget;
  if (articulationRate < minAR || articulationRate > maxAR) {
    const distance = Math.min(Math.abs(articulationRate - minAR), Math.abs(articulationRate - maxAR));
    const penalty = Math.min(distance / 5, 1.0); // Linear penalty up to 1.0
    score -= penalty;
  }
  
  // Pause ratio penalty (above band target)
  if (pauseRatio > bandTargets.pauseRatioTarget) {
    const excess = pauseRatio - bandTargets.pauseRatioTarget;
    const penalty = Math.min(excess * 5, 1.0); // Linear penalty up to 1.0
    score -= penalty;
  }
  
  return Math.max(0, score);
};

/**
 * Main deterministic pronunciation scoring function
 */
export const calculateDeterministicScore = (
  phonemeAccuracy: number,
  wordAccuracy: number,
  stressAccuracy: number,
  articulationRate: number,
  pauseRatio: number,
  errors: IPAError[],
  totalPhones: number,
  band: 'A1' | 'A2' | 'B1' | 'B2' | 'C1',
  speakingTime: number,
  asrConfidence: number,
  transcriptLength: number,
  config: DeterministicScoringConfig = DEFAULT_CONFIG
): PronunciationAnalysis => {
  
  // Apply quality gates first
  const qualityMetrics: ReadAloudMetrics = {
    speakingTime,
    totalDuration: speakingTime / (1 - pauseRatio), // Approximate total duration
    alignedWords: Math.round(wordAccuracy * transcriptLength),
    totalWords: transcriptLength,
    phonemeAccuracy,
    asrConfidence,
    transcriptLength
  };
  
  const qualityResult = applyQualityGates(qualityMetrics, band);
  
  if (qualityResult.shouldReject) {
    return {
      phonemeAccuracy,
      wordAccuracy,
      stressAccuracy,
      articulationRate,
      pauseRatio,
      msiScore: 0,
      basePronScore: 0,
      timingScore: 0,
      msiPenalty: 0,
      rawScore: qualityResult.fallbackScore || 0,
      adjustedScore: qualityResult.fallbackScore || 0,
      band,
      leniency: config.bandTargets[band]?.leniency || 0
    };
  }

  // Calculate MSI
  const msiScore = calculateMSI(errors, totalPhones, config);
  
  // Calculate base pronunciation score (0-10)
  const weights = config.basePronWeights;
  const basePronScore = 10 * (
    weights.phonemeAccuracy * phonemeAccuracy +
    weights.wordAccuracy * wordAccuracy +
    weights.stressAccuracy * stressAccuracy
  );
  
  // Calculate timing score
  const timingScore = calculateTimingScore(articulationRate, pauseRatio, band, config);
  
  // Calculate MSI penalty (0-2.5 scale)
  const msiPenalty = 25 * msiScore;
  
  // Calculate raw score
  const rawScore = Math.max(0, Math.min(10,
    (config.featureWeights.basePronWeight * basePronScore) +
    (config.featureWeights.timingWeight * timingScore) -
    msiPenalty
  ));
  
  // Apply difficulty adjustment (leniency)
  const leniency = config.bandTargets[band]?.leniency || 0;
  const adjustedScore = rawScore + leniency * (10 - rawScore);
  
  // Apply fallback score if needed
  const finalScore = qualityResult.fallbackScore ? 
    Math.max(qualityResult.fallbackScore, adjustedScore) : 
    adjustedScore;
  
  return {
    phonemeAccuracy,
    wordAccuracy,
    stressAccuracy,
    articulationRate,
    pauseRatio,
    msiScore,
    basePronScore,
    timingScore,
    msiPenalty,
    rawScore,
    adjustedScore: finalScore,
    band,
    leniency
  };
};

/**
 * Helper function to extract band from sentence or default assignment
 */
export const determineBandFromSentence = (
  sentenceLength: number,
  complexity: number = 1
): 'A1' | 'A2' | 'B1' | 'B2' | 'C1' => {
  const phoneCount = sentenceLength * 2.5; // Rough estimate
  
  if (phoneCount <= 28) return 'A1';
  if (phoneCount <= 40) return 'A2';
  if (phoneCount <= 60) return 'B1';
  if (phoneCount <= 85) return 'B2';
  return 'C1';
};