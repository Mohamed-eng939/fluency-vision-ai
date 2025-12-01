import { calculateGrammarScore } from "../grammarScoring";
import { analyzeGrammarWithApi, GrammarApiResponse } from "@/services/grammarApiService";

/**
 * Calculate the grammar criterion score based on audio metrics and transcript
 * Now uses external grammar API with fallback to local scoring
 */
export const calculateGrammarCriterion = async (
  audioMetrics: any,
  transcript: string
): Promise<number> => {
  // Try API first
  try {
    const apiResult = await analyzeGrammarWithApi(transcript);
    
    // Store API analysis in audioMetrics for later use
    audioMetrics.grammarApiAnalysis = {
      accuracy: apiResult.accuracy,
      range: apiResult.range,
      cefr: apiResult.cefr,
      errorCount: apiResult.errors,
      comments: apiResult.comments,
      detailedErrors: apiResult.raw.errors.map(err => ({
        type: err.type,
        bad: err.bad,
        better: err.better,
        description: err.description.en,
        offset: err.offset,
        length: err.length,
      })),
      apiUsed: true,
    };
    
    // Return accuracy score (already 0-10 scale)
    return apiResult.accuracy;
  } catch (error) {
    console.warn('Grammar API failed, using local scoring:', error);
    
    // Mark that API was not used
    audioMetrics.grammarApiAnalysis = { apiUsed: false };
    
    // Fallback to local scoring
    return calculateGrammarScore(audioMetrics, transcript);
  }
};
