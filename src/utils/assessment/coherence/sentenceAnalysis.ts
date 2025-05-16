
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

/**
 * Analyze repetition in content
 * Returns the ratio of repeated phrases to total content
 */
export const analyzeRepetition = (text: string): number => {
  if (!text || text.length < 10) return 0;
  
  // Get unique words and their count
  const words = text.toLowerCase().split(/\s+/);
  const uniqueWords = new Set(words);
  
  // Simple repetition ratio = 1 - (unique words / total words)
  const repetitionRatio = 1 - (uniqueWords.size / words.length);
  
  // Detect repeated phrases (3+ words)
  const phrases: string[] = [];
  for (let i = 0; i < words.length - 2; i++) {
    phrases.push(`${words[i]} ${words[i+1]} ${words[i+2]}`);
  }
  
  // Count repeated phrases
  const phraseCounts: Record<string, number> = {};
  let repeatedPhraseCount = 0;
  
  phrases.forEach(phrase => {
    phraseCounts[phrase] = (phraseCounts[phrase] || 0) + 1;
    if (phraseCounts[phrase] > 1) {
      repeatedPhraseCount++;
    }
  });
  
  // Combine both metrics, giving more weight to phrase repetition
  const phraseRepetitionRatio = phrases.length > 0 ? repeatedPhraseCount / phrases.length : 0;
  
  return (repetitionRatio * 0.4) + (phraseRepetitionRatio * 0.6);
};

/**
 * Analyze sentence beginnings for repetition
 * Returns count of repeated sentence beginnings above threshold
 */
export const analyzeRepeatedBeginnings = (sentences: string[]): number => {
  if (sentences.length < 3) return 0;
  
  // Extract first two words of each sentence
  const beginnings = sentences.map(s => {
    const words = s.trim().split(/\s+/);
    return words.slice(0, Math.min(2, words.length)).join(' ').toLowerCase();
  });
  
  // Count occurrences of each beginning
  const beginningCounts: Record<string, number> = {};
  beginnings.forEach(beginning => {
    beginningCounts[beginning] = (beginningCounts[beginning] || 0) + 1;
  });
  
  // Count how many beginnings occur more than twice
  return Object.values(beginningCounts).filter(count => count > 2).length;
};
