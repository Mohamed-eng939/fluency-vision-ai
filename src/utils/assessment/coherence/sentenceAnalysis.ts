
/**
 * Utilities for analyzing sentences and text structure
 */

/**
 * Break text into sentences
 */
export const splitIntoSentences = (text: string): string[] => {
  if (!text) return [];
  
  return text
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 0);
};

/**
 * Calculate basic text metrics
 */
export const calculateTextMetrics = (transcript: string) => {
  if (!transcript) {
    return {
      sentences: [],
      words: [],
      avgWordsPerSentence: 0
    };
  }
  
  // Extract sentences and words
  const sentences = splitIntoSentences(transcript);
  const words = transcript.split(/\s+/).filter(w => w.length > 0);
  
  // Calculate average words per sentence
  const avgWordsPerSentence = sentences.length > 0 ? words.length / sentences.length : 0;
  
  return {
    sentences,
    words,
    avgWordsPerSentence
  };
};

/**
 * Check if text meets minimum complexity requirements
 * Returns true if text meets the minimum requirements, false otherwise
 */
export const meetsMinimumComplexity = (
  sentences: string[], 
  propositionCount: number, 
  avgWordsPerSentence: number
): boolean => {
  // Require at least 2 sentences
  if (sentences.length < 2) return false;
  
  // Require at least 2 propositions/ideas
  if (propositionCount < 2) return false;
  
  // Require average sentence length of at least 4 words
  if (avgWordsPerSentence < 4) return false;
  
  return true;
};
