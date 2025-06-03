// Re-export all audio analysis utilities from their respective modules
export * from './audio/types';
export * from './audio/analyzer';
export * from './audio/speechRate';
export * from './audio/hesitationDetector';

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
  grammaticalErrors?: any[];
  syntaxComplexity?: any;
  grammarScore?: number;
  syntaxScore?: number;
  cefrGrammarLevel?: string;
  cefrSyntaxLevel?: string;
  grammarJustification?: string;
  syntaxJustification?: string;
  promptCEFRLevel?: string;
  levelDiscrepancy?: number;
  needsReview?: boolean;
  // Pronunciation data
  pronunciationScore?: number;
  cefrLevel?: string;
  pronunciationDetails?: any;
  // Vocabulary analysis
  vocabularyScore?: number;
  cefrVocabularyLevel?: string;
  vocabularyJustification?: string;
  vocabularyDistribution?: Record<string, number>;
  // Pause quality analysis
  pauseAnalysis?: any;
  fluencyScore?: number;
  cefrFluencyLevel?: string;
  // Prosody analysis
  prosodyAnalysis?: {
    pitch_mean: number;
    pitch_std_dev: number;
    tempo_bpm: number;
    opensmile_features: string;
    cefr_level?: string;
    analysisTimestamp?: number;
  };
}
