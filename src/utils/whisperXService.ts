
import { WhisperXResult, PauseDuration, WordTiming } from './audio/types';

const API_URL = import.meta.env.PROD 
  ? '/api'  // Production API path (assuming it's proxied)
  : 'http://localhost:8000'; // Development API URL

/**
 * Send audio to the WhisperX API for transcription with word-level timing
 * @param audioBlob The audio blob to transcribe
 * @param speakerId Optional speaker ID for tracking
 * @returns WhisperX transcription result with word-level timing
 */
export async function getWhisperXTranscription(
  audioBlob: Blob,
  speakerId?: string
): Promise<WhisperXResult> {
  try {
    const formData = new FormData();
    formData.append('audio', audioBlob);
    
    if (speakerId) {
      formData.append('speaker_id', speakerId);
    }
    
    const response = await fetch(`${API_URL}/whisperx/transcribe/`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`WhisperX API error: ${response.status} ${errorText}`);
    }
    
    const result = await response.json();
    
    // Post-process the WhisperX result to add fluency metrics
    const processedResult = processWhisperXResult(result);
    return processedResult;
  } catch (error) {
    console.error('WhisperX transcription failed:', error);
    // Return a failed transcription result with error details
    return {
      session_id: '',
      transcript: '',
      segments: [],
      word_segments: [],
      pause_durations: [],
      speaking_time: 0,
      silence_time: 0,
      total_duration: 0,
      transcription_failed: true,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Process raw WhisperX result to add timing metrics
 */
function processWhisperXResult(result: any): WhisperXResult {
  if (!result.word_segments || result.word_segments.length === 0) {
    return {
      ...result,
      pause_durations: [],
      speaking_time: 0,
      silence_time: 0,
      total_duration: result.segments?.[result.segments?.length - 1]?.end || 0
    };
  }

  const wordSegments = result.word_segments as WordTiming[];
  
  // 1. Calculate pause durations between words
  const pauseDurations: PauseDuration[] = [];
  let totalSilenceTime = 0;
  
  for (let i = 1; i < wordSegments.length; i++) {
    const previousWord = wordSegments[i - 1];
    const currentWord = wordSegments[i];
    const pauseDuration = currentWord.start - previousWord.end;
    
    // Only consider pauses ≥ 0.3 seconds as significant
    if (pauseDuration >= 0.3) {
      pauseDurations.push({
        duration: pauseDuration,
        position: i,
        before_word: previousWord.word,
        after_word: currentWord.word
      });
      totalSilenceTime += pauseDuration;
    }
  }
  
  // 2. Calculate speaking time and total duration
  const firstWordStart = wordSegments[0].start;
  const lastWordEnd = wordSegments[wordSegments.length - 1].end;
  const totalDuration = lastWordEnd;
  const speakingTime = lastWordEnd - firstWordStart - totalSilenceTime;
  
  // Return the processed result
  return {
    ...result,
    pause_durations: pauseDurations,
    speaking_time: speakingTime,
    silence_time: totalSilenceTime,
    total_duration: totalDuration
  };
}

/**
 * Enhanced audio processing with WhisperX
 * Calculates mean length of runs (MLR) and articulation rate
 */
export function calculateAdvancedMetrics(whisperResult: WhisperXResult): {
  mlrScore: number;
  articulationRate: number;
  pausePattern: number[];
} {
  // If transcription failed, return default values
  if (whisperResult.transcription_failed) {
    return {
      mlrScore: 0,
      articulationRate: 0,
      pausePattern: []
    };
  }
  
  // Get all words and their syllable counts
  const words = whisperResult.word_segments.map(segment => segment.word);
  const syllableCounts = words.map(word => estimateSyllableCount(word));
  const totalSyllables = syllableCounts.reduce((sum, count) => sum + count, 0);
  
  // Calculate articulation rate (syllables per second of speech)
  const articulationRate = whisperResult.speaking_time > 0 
    ? totalSyllables / whisperResult.speaking_time
    : 0;
    
  // Calculate pause positions based on significant pauses (>300ms)
  const significantPauses = whisperResult.pause_durations.filter(p => p.duration >= 0.3);
  const pausePositions = significantPauses.map(p => p.position);
  
  // Calculate MLR (Mean Length of Runs)
  // A run is a sequence of syllables between pauses
  let totalRuns = significantPauses.length + 1; // Number of runs is number of pauses + 1
  let mlrScore = totalRuns > 0 ? totalSyllables / totalRuns : totalSyllables;
  
  // Create a pause pattern array (pause durations in sequence)
  const pausePattern = whisperResult.pause_durations.map(p => p.duration);
  
  return {
    mlrScore,
    articulationRate,
    pausePattern
  };
}

/**
 * Estimate syllable count in a word
 */
function estimateSyllableCount(word: string): number {
  // Remove any punctuation and convert to lowercase
  const cleanWord = word.replace(/[^\w\s]|_/g, "").toLowerCase();
  
  if (cleanWord.length === 0) return 0;
  
  // Count vowel sequences as syllables
  const vowels = ["a", "e", "i", "o", "u", "y"];
  let count = 0;
  let prevIsVowel = false;
  
  for (let i = 0; i < cleanWord.length; i++) {
    const isVowel = vowels.includes(cleanWord[i]);
    if (isVowel && !prevIsVowel) {
      count++;
    }
    prevIsVowel = isVowel;
  }
  
  // Handle special cases
  if (count === 0) count = 1; // Every word has at least one syllable
  
  // Handle common patterns like silent e at the end
  if (cleanWord.endsWith("e") && count > 1) {
    count--;
  }
  
  return count;
}
