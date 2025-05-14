
/**
 * Calculate vocabulary score
 */
export const calculateVocabularyScore = (
  audioMetrics: any,
  transcript: string
): number => {
  if (!transcript) return 5;
  
  const words = transcript.toLowerCase().split(/\s+/).filter(w => w.length > 0);
  if (words.length === 0) return 5;
  
  // Calculate lexical diversity (unique words / total words)
  const uniqueWords = new Set(words);
  const lexicalDiversity = uniqueWords.size / words.length;
  
  // Base score on lexical diversity
  let score = 5;
  
  if (lexicalDiversity > 0.8) score = 9;
  else if (lexicalDiversity > 0.7) score = 8;
  else if (lexicalDiversity > 0.6) score = 7;
  else if (lexicalDiversity > 0.5) score = 6;
  else if (lexicalDiversity > 0.4) score = 5;
  else if (lexicalDiversity > 0.3) score = 4;
  else score = 3;
  
  // Check for advanced vocabulary
  const advancedVocabularyScore = checkAdvancedVocabulary(transcript);
  score += advancedVocabularyScore;
  
  // Penalize very short responses
  if (words.length < 30) score -= 1;
  
  // Ensure score is between 1-10
  return Math.max(1, Math.min(10, score));
};

/**
 * Check for advanced vocabulary usage
 */
export const checkAdvancedVocabulary = (transcript: string): number => {
  // This is a simplified approach - a real implementation would use 
  // a frequency list or CEFR-aligned vocabulary database
  
  // Sample advanced words that indicate higher proficiency
  const advancedWords = [
    'nevertheless', 'consequently', 'furthermore', 'subsequently', 'therefore',
    'paradigm', 'perspective', 'phenomenon', 'fundamental', 'significant',
    'substantial', 'considerable', 'adequate', 'sustainable', 'innovative',
    'implement', 'establish', 'determine', 'demonstrate', 'emphasize',
    'crucial', 'essential', 'relevant', 'appropriate', 'beneficial',
    'controversial', 'ambiguous', 'inevitable', 'arbitrary', 'imperative'
  ];
  
  // Count advanced word usage
  const lowerText = transcript.toLowerCase();
  const advancedWordCount = advancedWords.filter(word => 
    lowerText.includes(word.toLowerCase())
  ).length;
  
  // Score based on advanced word usage
  if (advancedWordCount >= 5) return 2;
  if (advancedWordCount >= 2) return 1;
  return 0;
};
