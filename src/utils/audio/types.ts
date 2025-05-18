
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
 * Word timing from WhisperX
 */
export interface WordTiming {
  word: string;
  start: number;
  end: number;
  score?: number;
}

/**
 * Pause information between words
 */
export interface PauseDuration {
  duration: number;
  position: number;
  before_word?: string;
  after_word?: string;
}

/**
 * Pause classification types
 */
export interface PauseAnalysis {
  fluentPauses: number;       // Number of pauses at natural boundaries
  disfluent_pauses: number;   // Number of pauses mid-phrase or inappropriate locations
  pauseLocations: Array<{     // Detailed information about each pause
    position: number;         // Position in the transcript
    duration: number;         // Duration in milliseconds
    isFluent: boolean;        // Whether this is a natural/fluent pause
    context?: string;         // Surrounding text for context
  }>;
  fluent_ratio: number;       // Ratio of fluent pauses to total pauses
  disfluent_ratio: number;    // Ratio of disfluent pauses to total pauses
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
  // WhisperX enhanced data
  wordTimings?: WordTiming[];  // Word-level timing information
  pauseDurations?: PauseDuration[]; // Detailed pause information
  speakingTime?: number;      // Time spent speaking (excluding pauses)
  silenceTime?: number;       // Time spent in silence
  articulationRate?: number;  // Syllables per second of speech
  mlrScore?: number;          // Mean Length of Runs score
  syllableCount?: number; // Total syllable count
  syllablesPerMinute?: number; // Speaking rate in syllables per minute
  // Add missing vocabulary properties
  vocabularyScore?: number; // Vocabulary score based on CEFR level (1-10)
  cefrVocabularyLevel?: string; // CEFR level for vocabulary
  vocabularyJustification?: string; // Explanation of vocabulary assessment
  vocabularyDistribution?: Record<string, number>; // Distribution of words by CEFR level
  // Hesitation analysis fields
  hesitationCount?: number; // Number of hesitation markers detected
  hesitationRatio?: number; // Ratio of hesitation markers to total words
  hesitationMarkers?: string[]; // List of detected hesitation markers
  // Repetition analysis fields
  repetitionCount?: number; // Number of repetitions detected
  repetitions?: string[]; // List of detected repetitions
  fluencyJustification?: string; // Explanation of fluency assessment
  // Pause quality analysis 
  pauseAnalysis?: PauseAnalysis; // Enhanced pause quality analysis
  // New composite fluency scoring fields
  fluencyScore?: number;         // Composite fluency score (1-10)
  cefrFluencyLevel?: string;     // CEFR level for fluency
}

/**
 * WhisperX transcription result
 */
export interface WhisperXResult {
  session_id: string;
  transcript: string;
  segments: Array<{
    id: number;
    text: string;
    start: number;
    end: number;
    words: WordTiming[];
  }>;
  word_segments: WordTiming[];
  pause_durations: PauseDuration[];
  speaking_time: number;
  silence_time: number;
  total_duration: number;
  transcription_failed: boolean;
  error?: string;
}
