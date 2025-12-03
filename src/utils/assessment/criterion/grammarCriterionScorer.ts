import { analyzeGrammarWithApi, GrammarApiResponse } from "@/services/grammarApiService";

/**
 * Grammar API analysis result stored in audioMetrics
 */
export interface GrammarApiAnalysisResult {
  accuracy: number;
  range: number;
  cefr: string;
  errorCount: number;
  comments: string[];
  detailedErrors: Array<{
    type: string;
    bad: string;
    better: string[];
    description: string;
    offset: number;
    length: number;
  }>;
  apiUsed: true;
}

/**
 * Result when API fails - no fallback
 */
export interface GrammarApiNotAvailable {
  apiUsed: false;
  error: string;
}

/**
 * Calculate the grammar criterion score based on external API ONLY
 * NO FALLBACK to local scoring - if API fails, return null
 */
export const calculateGrammarCriterion = async (
  audioMetrics: any,
  transcript: string
): Promise<number | null> => {
  if (!transcript || transcript.trim().length === 0) {
    audioMetrics.grammarApiAnalysis = { apiUsed: false, error: 'No transcript provided' };
    return null;
  }

  try {
    const apiResult = await analyzeGrammarWithApi(transcript);
    
    // Store API analysis in audioMetrics for later use - direct mapping only
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
    
    // Return accuracy score directly from API (already 0-10 scale)
    return apiResult.accuracy;
  } catch (error) {
    console.error('Grammar API failed - NO FALLBACK:', error);
    
    // Mark that API was not available - NO local scoring fallback
    audioMetrics.grammarApiAnalysis = { 
      apiUsed: false, 
      error: error instanceof Error ? error.message : 'Grammar API unavailable'
    };
    
    // Return null to indicate grammar analysis not available
    return null;
  }
};
