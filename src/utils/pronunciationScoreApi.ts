
import { AudioAnalysisResult } from './audioAnalysisUtils';
import config from '../config';

export interface PronunciationResponse {
  session_id: string;
  pronunciation_score: number;
  cefr_level: string;
  word_accuracy: number;
  phoneme_accuracy: number;
  problematic_phonemes: Array<{
    phone: string;
    issue: string;
    start: number;
    end: number;
  }>;
  problematic_ratio: number;
  speech_rate: number;
  total_words: number;
  aligned_words: number;
  total_phones: number;
  aligned_phones: number;
  duration_seconds: number;
}

// Configuration object for the API
const API_CONFIG = {
  // Use the configuration value
  BASE_URL: config.PRONUNCIATION_API_URL,
  ENDPOINTS: {
    ANALYZE: '/analyze/'
  }
};

/**
 * Send audio data and transcript to the pronunciation scoring API
 */
export const analyzePronunciation = async (
  audioBlob: Blob,
  transcript: string
): Promise<PronunciationResponse> => {
  try {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.wav');
    formData.append('transcript', transcript);
    
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ANALYZE}`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to analyze pronunciation');
    }
    
    const data: PronunciationResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Pronunciation analysis failed:', error);
    throw error;
  }
};

/**
 * Map IELTS pronunciation score to our internal scale (1-10)
 */
export const mapPronunciationScoreToScale = (ieltsScore: number): number => {
  // Convert IELTS 1-9 scale to our internal 1-10 scale
  return Math.min(10, 1 + (ieltsScore / 9) * 9);
};

/**
 * Analyze audio and fallback to internal analysis if API fails
 */
export const getPronunciationScore = async (
  audioBlob: Blob,
  transcript: string,
  fallbackAnalysis: AudioAnalysisResult
): Promise<{
  score: number;
  cefrLevel: string;
  details?: PronunciationResponse;
}> => {
  try {
    // Try to get detailed pronunciation analysis from API
    const analysis = await analyzePronunciation(audioBlob, transcript);
    
    return {
      score: mapPronunciationScoreToScale(analysis.pronunciation_score),
      cefrLevel: analysis.cefr_level,
      details: analysis
    };
  } catch (error) {
    console.warn('Falling back to internal pronunciation analysis:', error);
    
    // Use our existing pronunciation score calculation as fallback
    const { calculatePronunciationScore } = await import('./assessment/scoringUtils');
    const score = calculatePronunciationScore(fallbackAnalysis, transcript);
    
    // Map score to CEFR level using existing utility
    const { determineCEFRLevel } = await import('./assessment/scoringUtils');
    const normalizedScore = (score / 10) * 100; // Convert to 0-100 scale for determineCEFRLevel
    const cefrLevel = determineCEFRLevel(normalizedScore);
    
    return {
      score,
      cefrLevel,
      details: undefined
    };
  }
};

/**
 * Check if the pronunciation API is available
 */
export const checkApiAvailability = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/check-mfa/`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.installed;
    }
    return false;
  } catch (error) {
    console.warn('API availability check failed:', error);
    return false;
  }
};
