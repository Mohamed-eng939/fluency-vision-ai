
import { AssessmentResult, CEFRLevel } from '@/types/assessment';
import { generateSmartFeedback } from './feedbackGeneration';

/**
 * Skill weights for CEFR-aligned assessment
 * Reflects human examiner priorities across proficiency levels
 */
const SKILL_WEIGHTS = {
  fluency: 1.4,      // foundational for spoken proficiency
  grammar: 1.3,      // critical for intelligibility  
  vocabulary: 1.2,   // range and appropriacy matter
  coherence: 1.0,    // logical progression of ideas
  pronunciation: 0.6, // read-aloud only, limited data
  syntax: 0.7,       // accuracy and sentence control
  prosody: 0.8       // secondary to fluency
} as const;

const TOTAL_WEIGHT = Object.values(SKILL_WEIGHTS).reduce((sum, weight) => sum + weight, 0);

/**
 * Detect fallback usage across all results
 */
const detectFallbackUsage = (results: AssessmentResult[]) => {
  const fallbacks = {
    prosodyFallback: false,
    coherenceFallback: false,
    pronunciationFallback: false
  };

  results.forEach(result => {
    if (result.fallbackInfo?.prosodyFallback) {
      fallbacks.prosodyFallback = true;
    }
    if (result.fallbackInfo?.coherenceFallback) {
      fallbacks.coherenceFallback = true;
    }
    // Check if pronunciation scores are missing/defaulted (simplified check)
    if (result.metrics.pronunciation <= 5) {
      fallbacks.pronunciationFallback = true;
    }
  });

  return fallbacks;
};

/**
 * Calculate aggregated result with difficulty weighting and improved feedback
 */
export const calculateAggregatedResult = (
  results: AssessmentResult[],
  sessionId: string,
  studentName?: string
): AssessmentResult | null => {
  if (results.length === 0) return null;

  console.log(`Aggregating ${results.length} results for comprehensive assessment`);

  // Calculate difficulty-weighted metrics
  const skillSums = {
    fluency: 0, grammar: 0, vocabulary: 0, pronunciation: 0,
    prosody: 0, coherence: 0, syntax: 0
  };
  let totalWeight = 0;

  // Apply difficulty weighting for each response
  results.forEach(result => {
    // Get difficulty weight (default to 1.0 if not provided)
    const difficultyWeight = getDifficultyWeight(result);
    
    // Add weighted scores
    skillSums.fluency += result.metrics.fluency * difficultyWeight;
    skillSums.grammar += result.metrics.grammar * difficultyWeight;
    skillSums.vocabulary += result.metrics.vocabulary * difficultyWeight;
    skillSums.pronunciation += result.metrics.pronunciation * difficultyWeight;
    skillSums.prosody += result.metrics.prosody * difficultyWeight;
    skillSums.coherence += result.metrics.coherence * difficultyWeight;
    skillSums.syntax += result.metrics.syntax * difficultyWeight;
    
    totalWeight += difficultyWeight;
  });

  // Calculate difficulty-weighted averages
  const aggregatedMetrics = {
    fluency: skillSums.fluency / totalWeight,
    grammar: skillSums.grammar / totalWeight,
    vocabulary: skillSums.vocabulary / totalWeight,
    pronunciation: skillSums.pronunciation / totalWeight,
    prosody: skillSums.prosody / totalWeight,
    coherence: skillSums.coherence / totalWeight,
    syntax: skillSums.syntax / totalWeight
  };

  // Apply final skill importance weights
  const weightedScore = (
    aggregatedMetrics.fluency * SKILL_WEIGHTS.fluency +
    aggregatedMetrics.grammar * SKILL_WEIGHTS.grammar +
    aggregatedMetrics.vocabulary * SKILL_WEIGHTS.vocabulary +
    aggregatedMetrics.pronunciation * SKILL_WEIGHTS.pronunciation +
    aggregatedMetrics.prosody * SKILL_WEIGHTS.prosody +
    aggregatedMetrics.coherence * SKILL_WEIGHTS.coherence +
    aggregatedMetrics.syntax * SKILL_WEIGHTS.syntax
  ) / TOTAL_WEIGHT;

  // Convert to percentage scale for precise CEFR mapping
  const totalScore = Math.round(weightedScore * 10);

  // Detect fallback usage for transparency
  const fallbackFlags = detectFallbackUsage(results);

  // Aggregate audio analysis data
  const aggregatedAudioAnalysis = aggregateAudioAnalysis(results);
  
  // Determine CEFR level from weighted score using enhanced thresholds
  const cefrLevel = determineCEFRFromScore(totalScore);

  // Generate smart feedback based on actual performance metrics
  const aggregatedFeedback = generateSmartFeedback(aggregatedMetrics, aggregatedAudioAnalysis, cefrLevel, results.length);

  console.log("Aggregated metrics:", aggregatedMetrics);
  console.log("Difficulty-weighted aggregation:", {
    individual: aggregatedMetrics,
    skillWeights: SKILL_WEIGHTS,
    totalDifficultyWeight: totalWeight,
    finalWeightedScore: weightedScore,
    totalScore,
    fallbackFlags
  });
  console.log("Final CEFR level:", cefrLevel);

  return {
    sessionId,
    learnerName: studentName,
    metrics: aggregatedMetrics,
    totalScore,
    cefrLevel,
    feedback: aggregatedFeedback,
    audioAnalysis: aggregatedAudioAnalysis,
    transcript: results.map(r => r.transcript).filter(Boolean).join(' '),
    duration: results.reduce((sum, r) => sum + (r.duration || 0), 0),
    // Include fallback information for transparency
    fallbackInfo: Object.keys(fallbackFlags).some(key => fallbackFlags[key as keyof typeof fallbackFlags]) 
      ? fallbackFlags 
      : undefined
  };
};

/**
 * Aggregate audio analysis data from all results
 */
export const aggregateAudioAnalysis = (results: AssessmentResult[]) => {
  const validAnalyses = results.filter(r => r.audioAnalysis).map(r => r.audioAnalysis!);
  
  if (validAnalyses.length === 0) {
    return {
      wpm: 0,
      totalWords: 0,
      pauseCount: 0,
      pauseDuration: 0,
      pauseRatio: 0,
      speakingDuration: 0,
      totalDuration: 0
    };
  }

  // Sum up all the metrics across responses
  const totalWords = validAnalyses.reduce((sum, a) => sum + (a.totalWords || 0), 0);
  const totalSpeakingDuration = validAnalyses.reduce((sum, a) => sum + (a.speakingDuration || 0), 0);
  const totalDuration = validAnalyses.reduce((sum, a) => sum + (a.totalDuration || 0), 0);
  const totalPauseCount = validAnalyses.reduce((sum, a) => sum + (a.pauseCount || 0), 0);
  const totalPauseDuration = validAnalyses.reduce((sum, a) => sum + (a.pauseDuration || 0), 0);

  // Calculate aggregated metrics
  const wpm = totalSpeakingDuration > 0 ? (totalWords / totalSpeakingDuration) * 60 : 0;
  const syllableCount = validAnalyses.reduce((sum, a) => sum + (a.syllableCount || 0), 0);
  const syllablesPerMinute = totalSpeakingDuration > 0 ? (syllableCount / totalSpeakingDuration) * 60 : 0;

  console.log("Aggregated audio metrics:", {
    totalWords,
    totalSpeakingDuration,
    wpm,
    syllablesPerMinute
  });

  return {
    wpm,
    totalWords,
    pauseCount: totalPauseCount,
    pauseDuration: totalPauseDuration,
    pauseRatio: totalDuration > 0 ? totalPauseDuration / totalDuration : 0,
    speakingDuration: totalSpeakingDuration,
    totalDuration,
    syllableCount,
    syllablesPerMinute,
    fluencyScore: validAnalyses.reduce((sum, a) => sum + (a.fluencyScore || 0), 0) / validAnalyses.length
  };
};

/**
 * Determine CEFR level from percentage-based score (0-100)
 * Enhanced thresholds for more precise assessment
 */
export const determineCEFRFromScore = (score: number): CEFRLevel => {
  if (score >= 95) return 'C2';
  if (score >= 85) return 'C1+';
  if (score >= 80) return 'C1';
  if (score >= 75) return 'B2+';
  if (score >= 65) return 'B2';
  if (score >= 55) return 'B1+';
  if (score >= 50) return 'B1';
  if (score >= 45) return 'A2+';
  if (score >= 35) return 'A2';
  if (score >= 25) return 'A1+';
  if (score >= 15) return 'A1';
  return 'Pre-A1';
};

/**
 * Get difficulty weight based on prompt CEFR level or response metadata
 */
const getDifficultyWeight = (result: AssessmentResult): number => {
  // Try to get CEFR level from the result metadata
  const cefrLevel = result.cefrLevel || 'B1'; // Default to B1 if not specified
  
  // Map CEFR levels to difficulty weights
  const difficultyWeights: Record<string, number> = {
    'A1': 0.8,
    'A2': 0.9, 
    'B1': 1.0,
    'B2': 1.1,
    'C1': 1.2,
    'C2': 1.2 // Treat C2 same as C1
  };
  
  return difficultyWeights[cefrLevel] || 1.0;
};
