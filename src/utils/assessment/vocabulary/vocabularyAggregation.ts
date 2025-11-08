/**
 * Vocabulary Aggregation with Difficulty-Based Weighting
 * Computes overall vocabulary score across multiple responses using CEFR difficulty weights
 */

import { CEFRLevel } from '@/types/assessment';

/**
 * Custom weighting table based on CEFR difficulty
 * A1 (Questions 1-4): weight = 1.0
 * A2 (Questions 5-6): weight = 1.2
 * B1 (Questions 7-11): weight = 1.5
 * B2 (Questions 12-16): weight = 1.8
 * C1 (Questions 17-23): weight = 2.0
 */
const DIFFICULTY_WEIGHTS: Record<string, number> = {
  'Pre-A1': 1.0,
  'A1': 1.0,
  'A1+': 1.0,
  'A2': 1.2,
  'A2+': 1.2,
  'B1': 1.5,
  'B1+': 1.5,
  'B2': 1.8,
  'B2+': 1.8,
  'C1': 2.0,
  'C1+': 2.0,
  'C2': 2.0
};

/**
 * Per-question vocabulary details
 */
export interface QuestionVocabularyDetail {
  questionIndex: number;
  vocabularyScore: number; // 0-10 scale from analyzer
  cefrLevel: CEFRLevel; // Determined CEFR level for this response
  promptDifficulty: CEFRLevel; // Original question difficulty
  weight: number; // Applied difficulty weight
  weightedScore: number; // score × weight
  recognitionRate: number; // % of words found in CEFR list
  justification: string;
}

/**
 * Aggregated vocabulary result
 */
export interface AggregatedVocabularyResult {
  perQuestionDetails: QuestionVocabularyDetail[];
  totalWeightedScore: number;
  totalWeight: number;
  overallVocabularyScore: number; // 0-10 scale
  overallVocabularyPercentage: number; // 0-100 scale
  overallCEFRBand: CEFRLevel;
  summary: string;
}

/**
 * Get difficulty weight for a CEFR level
 */
export const getDifficultyWeight = (cefrLevel: CEFRLevel): number => {
  return DIFFICULTY_WEIGHTS[cefrLevel] || 1.5; // Default to B1 weight
};

/**
 * Map vocabulary score (0-10) to CEFR level
 */
export const mapVocabularyScoreToCEFR = (score: number): CEFRLevel => {
  if (score >= 9.5) return 'C2';
  if (score >= 8.5) return 'C1+';
  if (score >= 8.0) return 'C1';
  if (score >= 7.5) return 'B2+';
  if (score >= 6.5) return 'B2';
  if (score >= 5.5) return 'B1+';
  if (score >= 5.0) return 'B1';
  if (score >= 4.5) return 'A2+';
  if (score >= 3.5) return 'A2';
  if (score >= 2.5) return 'A1+';
  if (score >= 1.5) return 'A1';
  return 'Pre-A1';
};

/**
 * Aggregate vocabulary scores across all responses with difficulty weighting
 */
export const aggregateVocabularyScores = (
  vocabularyDetails: QuestionVocabularyDetail[]
): AggregatedVocabularyResult => {
  if (vocabularyDetails.length === 0) {
    return {
      perQuestionDetails: [],
      totalWeightedScore: 0,
      totalWeight: 0,
      overallVocabularyScore: 0,
      overallVocabularyPercentage: 0,
      overallCEFRBand: 'A1',
      summary: 'No vocabulary data available.'
    };
  }

  // Calculate weighted average: Σ(score_i × weight_i) / Σ(weight_i)
  const totalWeightedScore = vocabularyDetails.reduce(
    (sum, detail) => sum + detail.weightedScore,
    0
  );
  
  const totalWeight = vocabularyDetails.reduce(
    (sum, detail) => sum + detail.weight,
    0
  );

  const overallVocabularyScore = totalWeight > 0 
    ? totalWeightedScore / totalWeight 
    : 0;

  // Convert to percentage scale (0-100)
  const overallVocabularyPercentage = (overallVocabularyScore / 10) * 100;

  // Determine overall CEFR band
  const overallCEFRBand = mapVocabularyScoreToCEFR(overallVocabularyScore);

  // Generate summary
  const summary = generateVocabularySummary(
    vocabularyDetails,
    overallVocabularyScore,
    overallCEFRBand
  );

  console.log('📊 Vocabulary Aggregation:', {
    totalResponses: vocabularyDetails.length,
    totalWeightedScore: totalWeightedScore.toFixed(2),
    totalWeight: totalWeight.toFixed(2),
    overallScore: overallVocabularyScore.toFixed(2),
    overallPercentage: overallVocabularyPercentage.toFixed(1),
    overallCEFRBand
  });

  return {
    perQuestionDetails: vocabularyDetails,
    totalWeightedScore,
    totalWeight,
    overallVocabularyScore,
    overallVocabularyPercentage,
    overallCEFRBand,
    summary
  };
};

/**
 * Generate human-readable summary of vocabulary performance
 */
const generateVocabularySummary = (
  details: QuestionVocabularyDetail[],
  overallScore: number,
  cefrBand: CEFRLevel
): string => {
  const avgRecognitionRate = details.reduce((sum, d) => sum + d.recognitionRate, 0) / details.length;
  
  // Count responses by difficulty
  const difficultyCount = details.reduce((acc, d) => {
    const key = d.promptDifficulty;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  let summary = `**Overall Vocabulary Level: ${cefrBand}**\n\n`;
  summary += `**Weighted Average Score:** ${overallScore.toFixed(2)}/10 (${((overallScore / 10) * 100).toFixed(1)}%)\n\n`;
  summary += `**Recognition Rate:** ${avgRecognitionRate.toFixed(1)}% average across all responses\n\n`;
  
  summary += `**Question Distribution:**\n`;
  Object.entries(difficultyCount)
    .sort(([a], [b]) => {
      const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
      return levels.indexOf(a) - levels.indexOf(b);
    })
    .forEach(([level, count]) => {
      const weight = DIFFICULTY_WEIGHTS[level] || 1.0;
      summary += `- ${level}: ${count} questions (weight: ${weight})\n`;
    });

  return summary;
};

/**
 * Create vocabulary detail from individual response data
 */
export const createVocabularyDetail = (
  questionIndex: number,
  vocabularyScore: number,
  cefrLevel: CEFRLevel,
  promptDifficulty: CEFRLevel,
  recognitionRate: number,
  justification: string
): QuestionVocabularyDetail => {
  const weight = getDifficultyWeight(promptDifficulty);
  const weightedScore = vocabularyScore * weight;

  return {
    questionIndex,
    vocabularyScore,
    cefrLevel,
    promptDifficulty,
    weight,
    weightedScore,
    recognitionRate,
    justification
  };
};
