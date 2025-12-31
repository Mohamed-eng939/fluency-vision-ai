import { analyzeGrammarWithApi } from "@/services/grammarApiService";

/**
 * Grammar API analysis result stored in audioMetrics
 */
export interface GrammarApiAnalysisResult {
  cefr: string;
  scores: {
    accuracy: number;
    complexity: number;
    lexical: number;
    structure: number;
    final: number;
  };
  errors: number;
  comments: string[];
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
): Promise<string | null> => {
  if (!transcript || transcript.trim().length === 0) {
    audioMetrics.grammarApiAnalysis = { apiUsed: false, error: 'No transcript provided' };
    return null;
  }

  try {
    const apiResult = await analyzeGrammarWithApi(transcript);
    
    // Store API analysis in audioMetrics for later use
    audioMetrics.grammarApiAnalysis = {
      cefr: apiResult.cefr,
      scores: apiResult.scores,
      errors: apiResult.errors,
      comments: apiResult.comments,
      apiUsed: true,
    };
    
    // Return CEFR level from API
    return apiResult.cefr;
  } catch (error) {
    console.error('Grammar API failed - NO FALLBACK:', error);
    
    // Mark that API was not available - NO local scoring fallback
    audioMetrics.grammarApiAnalysis = { 
      apiUsed: false, 
      error: error instanceof Error ? error.message : 'Grammar API unavailable'
    };
    
    return null;
  }
};
