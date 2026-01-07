import { analyzeFluencyWithApi } from "@/services/fluencyApiService";

/**
 * Fluency API analysis result stored in audioMetrics
 */
export interface FluencyApiAnalysisResult {
  cefr: string;
  apiUsed: true;
}

/**
 * Result when API fails - no fallback
 */
export interface FluencyApiNotAvailable {
  apiUsed: false;
  error: string;
}

/**
 * Calculate the fluency criterion score based on external API ONLY
 * NO FALLBACK to local scoring - if API fails, return null
 */
export const calculateFluencyCriterion = async (
  audioMetrics: any,
  transcript: string
): Promise<string | null> => {
  if (!transcript || transcript.trim().length === 0) {
    audioMetrics.fluencyApiAnalysis = { apiUsed: false, error: 'No transcript provided' };
    return null;
  }

  // Get duration from audioMetrics - use totalDuration or default to 30 seconds
  const durationSeconds = audioMetrics.totalDuration || audioMetrics.speakingDuration || 30;

  try {
    const apiResult = await analyzeFluencyWithApi(transcript, durationSeconds);
    
    // Store API analysis in audioMetrics for later use
    audioMetrics.fluencyApiAnalysis = {
      cefr: apiResult.cefr_level,
      syllables: apiResult.syllables,
      spm: apiResult.spm,
      apiUsed: true,
    };
    
    // Return CEFR level from API
    return apiResult.cefr_level;
  } catch (error) {
    console.error('Fluency API failed - NO FALLBACK:', error);
    
    // Mark that API was not available - NO local scoring fallback
    audioMetrics.fluencyApiAnalysis = { 
      apiUsed: false, 
      error: error instanceof Error ? error.message : 'Fluency API unavailable'
    };
    
    return null;
  }
};
