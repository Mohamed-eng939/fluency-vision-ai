
import { AssessmentResult, CEFRLevel } from '@/types/assessment';
import { generateSmartFeedback } from './feedbackGeneration';

/**
 * Calculate aggregated result from all individual results with improved feedback
 */
export const calculateAggregatedResult = (
  results: AssessmentResult[],
  sessionId: string,
  studentName?: string
): AssessmentResult | null => {
  if (results.length === 0) return null;

  console.log(`Aggregating ${results.length} results for comprehensive assessment`);

  // Aggregate metrics by averaging
  const aggregatedMetrics = {
    fluency: results.reduce((sum, r) => sum + r.metrics.fluency, 0) / results.length,
    grammar: results.reduce((sum, r) => sum + r.metrics.grammar, 0) / results.length,
    vocabulary: results.reduce((sum, r) => sum + r.metrics.vocabulary, 0) / results.length,
    pronunciation: results.reduce((sum, r) => sum + r.metrics.pronunciation, 0) / results.length,
    prosody: results.reduce((sum, r) => sum + r.metrics.prosody, 0) / results.length,
    coherence: results.reduce((sum, r) => sum + r.metrics.coherence, 0) / results.length,
    syntax: results.reduce((sum, r) => sum + r.metrics.syntax, 0) / results.length
  };

  // Aggregate audio analysis data
  const aggregatedAudioAnalysis = aggregateAudioAnalysis(results);

  // Calculate total score and CEFR level
  const totalScore = Object.values(aggregatedMetrics).reduce((sum, score) => sum + score, 0) / Object.keys(aggregatedMetrics).length;
  
  // Determine CEFR level from aggregated score
  const cefrLevel = determineCEFRFromScore(totalScore);

  // Generate smart feedback based on actual performance metrics
  const aggregatedFeedback = generateSmartFeedback(aggregatedMetrics, aggregatedAudioAnalysis, cefrLevel, results.length);

  console.log("Aggregated metrics:", aggregatedMetrics);
  console.log("Aggregated total score:", totalScore);
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
    duration: results.reduce((sum, r) => sum + (r.duration || 0), 0)
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
 * Determine CEFR level from numerical score
 */
export const determineCEFRFromScore = (score: number): CEFRLevel => {
  if (score >= 9) return 'C2';
  if (score >= 8) return 'C1';
  if (score >= 7) return 'B2';
  if (score >= 6) return 'B1';
  if (score >= 5) return 'A2';
  return 'A1';
};
