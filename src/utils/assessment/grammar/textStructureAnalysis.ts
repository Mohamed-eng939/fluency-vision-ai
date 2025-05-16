
/**
 * Text Structure Analysis Functions
 * Functions to analyze sentence structure and variety
 */

/**
 * Calculate sentence variety score (0-3)
 */
export const calculateSentenceVariety = (sentences: string[]): number => {
  if (sentences.length < 2) return 0;
  
  // Check for question forms
  const hasQuestions = sentences.some(s => s.trim().endsWith('?'));
  
  // Check for complex sentences (with conjunctions)
  const hasComplexSentences = sentences.some(s => 
    /\b(because|although|though|since|as|while|whereas|unless|if|when|whenever|wherever|even though)\b/i.test(s)
  );
  
  // Check for compound sentences
  const hasCompoundSentences = sentences.some(s => 
    /\b(and|but|or|so|yet|for|nor)\b/i.test(s)
  );
  
  // Add points for variety
  let varietyScore = 0;
  if (hasQuestions) varietyScore += 1;
  if (hasComplexSentences) varietyScore += 1;
  if (hasCompoundSentences) varietyScore += 1;
  
  return varietyScore;
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
