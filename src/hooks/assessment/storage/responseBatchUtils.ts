
import { StoredResponse } from './types';

/**
 * Validate a stored response before processing
 */
export const validateStoredResponse = (response: StoredResponse): boolean => {
  // Enhanced validation with size and content checks
  if (!response.audioBlob || response.audioBlob.size === 0) {
    console.error("Invalid audio blob - size is 0 or null");
    return false;
  }

  // Check for minimum recording size (prevent very short recordings)
  if (response.audioBlob.size < 1000) {
    console.error("Audio blob too small - likely invalid recording");
    return false;
  }

  return true;
};

/**
 * Store a response for immediate storage without scoring
 */
export const createStoredResponse = (
  prompt: any,
  audioBlob: Blob,
  transcript?: string,
  audioAnalysis?: any,
  questionIndex?: number,
  currentStoredCount: number = 0
): StoredResponse | null => {
  if (!validateStoredResponse({ audioBlob } as StoredResponse)) {
    return null;
  }

  console.log(`Storing response for immediate save - Question ${questionIndex}: Audio size=${audioBlob.size} bytes, transcript=${transcript?.length || 0} chars`);
  
  return {
    prompt,
    audioBlob,
    transcript,
    audioAnalysis,
    timestamp: Date.now(),
    questionIndex: questionIndex || currentStoredCount
  };
};
