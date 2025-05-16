
/**
 * Count instances of a pattern in text
 */
export const countPattern = (text: string, pattern: RegExp): number => {
  const matches = text.match(pattern);
  return matches ? matches.length : 0;
};

/**
 * Detect compound-complex sentences
 */
export const detectCompoundComplexSentences = (transcript: string): boolean => {
  const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  // Look for sentences with both coordination and subordination
  return sentences.some(sentence => {
    const hasCoordination = /\b(and|but|or)\b/i.test(sentence);
    const hasSubordination = /\b(because|although|though|since|as|while|whereas|unless|if|when|whenever|wherever)\b/i.test(sentence);
    return hasCoordination && hasSubordination;
  });
};

/**
 * Detect repeated clause beginnings
 * Returns the count of repeated beginnings above threshold
 */
export const detectRepeatedClauseBeginnings = (sentences: string[]): number => {
  if (sentences.length < 3) return 0;
  
  // Extract first two words of each sentence/clause
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
 * Detect repetition in content
 * Returns the ratio of repeated phrases to total content
 */
export const detectRepetition = (text: string): number => {
  if (!text || text.length < 10) return 0;
  
  // Get unique words and their count
  const words = text.toLowerCase().split(/\s+/).filter(w => w.trim().length > 0);
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
