
/**
 * Quality Metrics for Syntax Analysis
 * Functions for analyzing syntax quality aspects
 */

/**
 * Count occurrences of patterns in text
 */
export const countPatterns = (text: string, pattern: RegExp): number => {
  const matches = text.match(pattern);
  return matches ? matches.length : 0;
};

/**
 * Estimate repetition ratio in the text
 */
export const estimateRepetitionRatio = (text: string): number => {
  if (!text || text.length < 10) return 0;
  
  // Get unique words and their count
  const words = text.toLowerCase().split(/\s+/);
  const uniqueWords = new Set(words);
  
  // Simple repetition ratio = 1 - (unique words / total words)
  const wordRepetitionRatio = 1 - (uniqueWords.size / words.length);
  
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
  
  // Phrase repetition ratio
  const phraseRepetitionRatio = phrases.length > 0 ? 
    repeatedPhraseCount / phrases.length : 0;
  
  // Combine both metrics, giving more weight to phrase repetition
  return (wordRepetitionRatio * 0.4) + (phraseRepetitionRatio * 0.6);
};

/**
 * Estimate error density in the text
 * Used for syntax quality measures
 */
export const estimateErrorDensity = (text: string): number => {
  let errorCount = 0;
  const words = text.split(/\s+/);
  
  // Agreement errors
  errorCount += countPatterns(text, /\b(they|we|you) (is|was)\b|\b(he|she|it) (are|were)\b/gi);
  
  // Article errors
  errorCount += countPatterns(text, /\b(a) ([aeiou]\w+)\b|\b(an) ([^aeiou]\w+)\b/gi);
  
  // Auxiliary errors
  errorCount += countPatterns(text, /\b(didn't|did not) (\w+ed)\b|\b(don't|do not) ([^the\s]\w+s)\b/gi);
  
  // Preposition errors (simplified)
  errorCount += countPatterns(text, /\b(arrive|go) (in|on|with) /gi);
  
  // Verb form errors
  errorCount += countPatterns(text, /\b(has|have) [a-z]+ |is [a-z]+ing/gi);
  
  return words.length > 0 ? errorCount / words.length : 0;
};
