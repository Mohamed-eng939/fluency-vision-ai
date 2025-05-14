
/**
 * Options for audio analysis
 */
export interface AudioAnalysisOptions {
  sampleRate?: number;
  fftSize?: number;
}

/**
 * Pronunciation details from API
 */
export interface PronunciationDetails {
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

/**
 * Results from audio analysis
 */
export interface AudioAnalysisResult {
  wpm: number;           // Words per minute
  totalWords: number;    // Total word count
  pauseCount: number;    // Number of pauses detected
  pauseDuration: number; // Total pause duration in seconds
  pauseRatio: number;    // Ratio of pause time to total time
  speakingDuration: number; // Duration of actual speech in seconds
  totalDuration: number; // Total duration in seconds
  pronunciationScore?: number; // Enhanced pronunciation score (1-10)
  cefrLevel?: string;    // CEFR level from pronunciation analysis
  pronunciationDetails?: PronunciationDetails; // Detailed pronunciation analysis
  syllableCount?: number; // Total syllable count
  syllablesPerMinute?: number; // Speaking rate in syllables per minute
}
