export interface BandResult {
  band: 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
  scores: number[];
  averageScore: number;
}

export interface AggregatedPronunciationResult {
  finalScore: number;
  bandResults: BandResult[];
  totalItems: number;
  cefrLevel: string;
}

// Difficulty weights for each band
const BAND_WEIGHTS = {
  A1: 0.10,
  A2: 0.15,
  B1: 0.20,
  B2: 0.25,
  C1: 0.30
} as const;

/**
 * Aggregate pronunciation scores across 15 Read Aloud items with difficulty weighting
 */
export const aggregateReadAloudScores = (
  results: Array<{ band: 'A1' | 'A2' | 'B1' | 'B2' | 'C1'; score: number }>
): AggregatedPronunciationResult => {
  // Group results by band
  const bandGroups: Record<string, number[]> = {
    A1: [],
    A2: [],
    B1: [],
    B2: [],
    C1: []
  };

  results.forEach(result => {
    bandGroups[result.band].push(result.score);
  });

  // Calculate band averages
  const bandResults: BandResult[] = [];
  let weightedSum = 0;
  let totalWeight = 0;

  Object.entries(bandGroups).forEach(([band, scores]) => {
    if (scores.length > 0) {
      const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      const weight = BAND_WEIGHTS[band as keyof typeof BAND_WEIGHTS];
      
      bandResults.push({
        band: band as 'A1' | 'A2' | 'B1' | 'B2' | 'C1',
        scores,
        averageScore
      });

      weightedSum += weight * averageScore;
      totalWeight += weight;
    }
  });

  // Calculate final weighted average
  const finalScore = totalWeight > 0 ? weightedSum / totalWeight : 0;

  // Determine CEFR level from final score
  const cefrLevel = determineCEFRFromPronunciationScore(finalScore);

  return {
    finalScore,
    bandResults,
    totalItems: results.length,
    cefrLevel
  };
};

/**
 * Map pronunciation score to CEFR level using pronunciation-specific ranges
 */
const determineCEFRFromPronunciationScore = (score: number): string => {
  if (score >= 7.5) return 'C1';
  if (score >= 6.5) return 'B2';
  if (score >= 5.5) return 'B1';
  if (score >= 4.5) return 'A2';
  if (score >= 3.0) return 'A1';
  return 'Pre-A1';
};

/**
 * Calculate expected number of items per band for a 15-item assessment
 */
export const getExpectedBandDistribution = (): Record<string, number> => {
  return {
    A1: 3,
    A2: 3,
    B1: 3,
    B2: 3,
    C1: 3
  };
};