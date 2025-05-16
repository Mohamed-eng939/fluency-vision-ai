
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

/**
 * Identify CEFR-specific coherence features
 */
export const identifyCoherenceFeatures = (transcript: string): Record<string, boolean> => {
  if (!transcript) return {};
  
  const features: Record<string, boolean> = {};
  
  // A1-A2 level features
  features.hasBasicConjunctions = /\b(and|but|so)\b/i.test(transcript);
  features.hasChronologicalSequencing = /\b(first|then|next|after that|finally)\b/i.test(transcript);
  
  // B1-B2 level features
  features.hasDiscourseMarkers = /\b(however|therefore|moreover|in addition|on the other hand)\b/i.test(transcript);
  features.hasCausalConnectors = /\b(because|since|as|due to|as a result)\b/i.test(transcript);
  features.hasContrastiveConnectors = /\b(although|though|despite|in spite of|nevertheless)\b/i.test(transcript);
  
  // C1-C2 level features
  features.hasAdvancedDiscourseMarkers = /\b(conversely|subsequently|consequently|alternatively|notwithstanding)\b/i.test(transcript);
  features.hasRhetoricalDevices = /\b(not only|but also|either|or|neither|nor|the former|the latter)\b/i.test(transcript);
  
  return features;
};

/**
 * Estimate CEFR coherence level based on features
 */
export const estimateCEFRCoherenceLevel = (transcript: string): string => {
  const features = identifyCoherenceFeatures(transcript);
  const metrics = calculateTextMetrics(transcript);
  
  // C1-C2 level indicators
  if (
    features.hasAdvancedDiscourseMarkers && 
    features.hasRhetoricalDevices &&
    metrics.avgWordsPerSentence > 15
  ) {
    return 'C1';
  }
  
  // B2 level indicators
  if (
    features.hasDiscourseMarkers && 
    features.hasContrastiveConnectors &&
    metrics.avgWordsPerSentence > 12
  ) {
    return 'B2';
  }
  
  // B1 level indicators
  if (
    features.hasCausalConnectors && 
    metrics.avgWordsPerSentence > 8
  ) {
    return 'B1';
  }
  
  // A2 level indicators
  if (
    features.hasChronologicalSequencing && 
    features.hasBasicConjunctions
  ) {
    return 'A2';
  }
  
  // Default to A1
  return 'A1';
};
