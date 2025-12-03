// Grammar and syntax analysis types
export interface GrammaticalError {
  type: 'agreement' | 'tense' | 'article' | 'preposition' | 'other';
  context: string;
  suggestion?: string;
}

export interface SyntaxComplexity {
  averageSentenceLength: number;
  complexSentenceRatio: number; // Proportion of sentences with multiple clauses
  structuralVariety: number; // 1-10 score based on different sentence patterns
  subordinationIndex: number; // Average number of dependent clauses per sentence
}

// Prosody analysis interface
export interface ProsodyAnalysisResult {
  pitch_mean: number;
  pitch_std_dev: number;
  tempo_bpm: number;
  opensmile_features: string;
  cefr_level: string;
  analysisTimestamp: number;
  failureReason?: string; // Add optional failureReason property
  userFriendlyMessage?: string; // Add optional userFriendlyMessage property
}

// Full audio analysis result
export interface AudioAnalysisResult {
  wpm: number;
  totalWords: number;
  pauseCount: number;
  pauseDuration: number;
  pauseRatio: number;
  speakingDuration: number;
  totalDuration: number;
  syllableCount?: number;
  syllablesPerMinute?: number;
  // Enhanced speech analysis metrics
  mlrScore?: number;            // Mean Length of Runs score
  articulationRate?: number;    // Syllables per second of speech
  speakingTime?: number;        // Time spent speaking (excluding pauses)
  silenceTime?: number;         // Time spent in silence
  pauseDurations?: any[];       // Detailed information about pauses
  wordTimings?: any[];          // Word-level timing information
  // Fluency analysis metrics
  hesitationCount?: number;      // Number of hesitation markers detected
  hesitationRatio?: number;      // Ratio of hesitation markers to total words
  hesitationMarkers?: string[];  // List of detected hesitation markers
  repetitionCount?: number;      // Number of repetitions detected
  repetitions?: string[];        // List of detected repetitions
  fluencyJustification?: string; // Explanation of fluency assessment
  // Grammar and pronunciation analysis
  grammaticalErrors?: GrammaticalError[];
  syntaxComplexity?: SyntaxComplexity;
  grammarScore?: number;
  syntaxScore?: number;
  cefrGrammarLevel?: string;
  cefrSyntaxLevel?: string;
  grammarJustification?: string;
  syntaxJustification?: string;
  promptCEFRLevel?: string;
  levelDiscrepancy?: number;
  needsReview?: boolean;
  // Grammar API analysis results
  grammarApiAnalysis?: {
    accuracy: number;
    range: number;
    cefr: string;
    errorCount: number;
    comments: string[];
    detailedErrors: Array<{
      type: 'grammar' | 'spelling';
      bad: string;
      better: string[];
      description: string;
      offset: number;
      length: number;
    }>;
    apiUsed: boolean;
    error?: string; // Error message when API fails
  };
  // Pronunciation data
  pronunciationScore?: number;
  cefrLevel?: string;
  pronunciationDetails?: any;
  // Vocabulary analysis - CEFR mapping only, NO numeric scores
  cefrVocabularyLevel?: string;
  vocabularyJustification?: string;
  vocabularyDistribution?: Record<string, number>;
  lexicalDiversity?: number;
  recognizedWordCount?: number;
  unrecognizedWordCount?: number;
  totalWordCount?: number;
  uniqueWordCount?: number;
  recognizedWords?: Record<string, string[]>;
  unrecognizedWords?: string[];
  // Pause quality analysis
  pauseAnalysis?: any;
  fluencyScore?: number;
  cefrFluencyLevel?: string;
  // Prosody analysis
  prosodyAnalysis?: ProsodyAnalysisResult;
  // Read Aloud specific scores
  readAloudScore?: number;
  band?: string;
}

// Pronunciation details structure
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

// Word timing structure
export interface WordTiming {
  word: string;
  start: number;
  end: number;
  score?: number;
}

// Pause information structure
export interface PauseDuration {
  duration: number;
  position: number;
  before_word?: string;
  after_word?: string;
}

// Pause classification structure
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

// WhisperX transcription result
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

export interface SpeechMetrics {
  duration: number;
  speechRate: number;
  pauseCount: number;
  averagePauseDuration: number;
  silenceRatio: number;
  wordsPerMinute: number;
}

export interface PronunciationMetrics {
  overallScore: number;
  wordAccuracy: number;
  phonemeAccuracy: number;
  problematicPhonemes: string[];
}
