export interface PronunciationAnalysis {
  phonemeAccuracy: number;
  wordAccuracy: number;
  stressAccuracy: number;
  articulationRate: number;
  pauseRatio: number;
  msiScore: number;
  basePronScore: number;
  timingScore: number;
  msiPenalty: number;
  rawScore: number;
  adjustedScore: number;
  band: 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
  leniency: number;
}

export interface IPAError {
  type: 'substitution' | 'deletion' | 'insertion' | 'stress';
  phoneme: string;
  expected?: string;
  actual?: string;
  severity: number;
  position: number;
}

export interface BandTargets {
  phonesRange: [number, number];
  targetPA: number;
  targetWA: number;
  arTarget: [number, number];
  pauseRatioTarget: number;
  leniency: number;
}

export interface DeterministicScoringConfig {
  bandTargets: Record<string, BandTargets>;
  phonemeCriticality: Record<string, number>;
  errorBaseCosts: {
    substitution: number;
    deletion: number;
    insertion: number;
    stressError: number;
    finalConsonantDeletion: number;
  };
  featureWeights: {
    basePronWeight: number;
    timingWeight: number;
  };
  basePronWeights: {
    phonemeAccuracy: number;
    wordAccuracy: number;
    stressAccuracy: number;
  };
}