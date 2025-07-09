/**
 * Expert-aligned vocabulary scoring based on IELTS/PTE band descriptors
 * Uses CEFR word level analysis and lexical diversity metrics
 */

export interface VocabularyAnalysis {
  cefrDistribution: Record<string, number>; // A1, A2, B1, B2, C1, C2 percentages
  lexicalDiversity: number; // TTR or similar
  sophisticatedWordUsage: number; // 0-100%
  collocationsAccuracy: number; // 0-100%
  bandScore: number;
  fallbackUsed: boolean;
  bandJustification: string;
  wordBreakdown: {
    total: number;
    unique: number;
    byLevel: Record<string, string[]>;
  };
}

/**
 * CEFR word lists (simplified for demonstration)
 */
const CEFR_WORD_LISTS = {
  A1: ['the', 'be', 'have', 'do', 'say', 'get', 'make', 'go', 'know', 'take', 'see', 'come', 'think', 'look', 'want', 'give', 'use', 'find', 'tell', 'ask'],
  A2: ['work', 'try', 'feel', 'become', 'leave', 'put', 'mean', 'keep', 'let', 'begin', 'seem', 'help', 'talk', 'turn', 'start', 'show', 'hear', 'play', 'run', 'move'],
  B1: ['follow', 'live', 'believe', 'hold', 'bring', 'happen', 'write', 'provide', 'sit', 'stand', 'lose', 'pay', 'meet', 'include', 'continue', 'set', 'learn', 'change', 'lead', 'understand'],
  B2: ['develop', 'consider', 'appear', 'suggest', 'require', 'expect', 'build', 'remain', 'result', 'offer', 'remember', 'serve', 'die', 'send', 'receive', 'decide', 'win', 'explain', 'hope', 'create'],
  C1: ['establish', 'achieve', 'therefore', 'particularly', 'significant', 'approach', 'indicate', 'despite', 'maintain', 'circumstances', 'appropriate', 'contribute', 'enormous', 'essential', 'furthermore', 'implement', 'investigate', 'adequate', 'comprehensive', 'substantial'],
  C2: ['nonetheless', 'paradigm', 'innovative', 'sophisticated', 'exemplify', 'inevitable', 'ubiquitous', 'ambiguous', 'arbitrary', 'catalyst', 'contentious', 'detrimental', 'feasible', 'meticulous', 'pervasive', 'profound', 'scrutinize', 'substantiate', 'unprecedented', 'versatile']
};

/**
 * Calculate expert-aligned vocabulary score using IELTS/PTE descriptors
 */
export const calculateExpertVocabularyScore = (transcript: string): VocabularyAnalysis => {
  const words = extractWords(transcript);
  const uniqueWords = [...new Set(words)];
  
  // Calculate CEFR distribution
  const cefrDistribution = calculateCEFRDistribution(uniqueWords);
  
  // Calculate lexical diversity (Type-Token Ratio)
  const lexicalDiversity = words.length > 0 ? uniqueWords.length / words.length : 0;
  
  // Assess sophisticated word usage
  const sophisticatedUsage = assessSophisticatedWordUsage(cefrDistribution);
  
  // Assess collocation accuracy (simplified)
  const collocationsAccuracy = assessCollocationsAccuracy(transcript);
  
  // Determine band score
  const baseScore = getBandFromVocabularyProfile(cefrDistribution, lexicalDiversity, sophisticatedUsage);
  let justification = createVocabularyJustification(cefrDistribution, lexicalDiversity, sophisticatedUsage);
  
  // Apply modifiers
  let finalScore = baseScore;
  
  // Penalty for poor collocations
  if (collocationsAccuracy < 60) {
    finalScore = Math.min(finalScore, 6.5);
    justification += ', collocation issues';
  }
  
  // Bonus for high lexical diversity with sophisticated vocabulary
  if (lexicalDiversity > 0.7 && sophisticatedUsage > 30) {
    finalScore += 0.5;
    justification += ', excellent range & accuracy';
  }
  
  // Penalty for very short responses
  if (words.length < 30) {
    finalScore = Math.min(finalScore, 6.0);
    justification += ', insufficient length';
  }
  
  // Ensure score is within valid band range
  finalScore = Math.max(1.0, Math.min(9.0, finalScore));
  
  return {
    cefrDistribution,
    lexicalDiversity,
    sophisticatedWordUsage: sophisticatedUsage,
    collocationsAccuracy,
    bandScore: Math.round(finalScore * 2) / 2, // Round to nearest 0.5
    fallbackUsed: false,
    bandJustification: justification,
    wordBreakdown: {
      total: words.length,
      unique: uniqueWords.length,
      byLevel: groupWordsByLevel(uniqueWords)
    }
  };
};

/**
 * Extract and clean words from transcript
 */
function extractWords(transcript: string): string[] {
  return transcript
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2); // Filter out very short words
}

/**
 * Calculate CEFR level distribution of vocabulary
 */
function calculateCEFRDistribution(words: string[]): Record<string, number> {
  const distribution: Record<string, number> = {
    A1: 0, A2: 0, B1: 0, B2: 0, C1: 0, C2: 0, unknown: 0
  };
  
  words.forEach(word => {
    let found = false;
    for (const [level, wordList] of Object.entries(CEFR_WORD_LISTS)) {
      if (wordList.includes(word)) {
        distribution[level]++;
        found = true;
        break;
      }
    }
    if (!found) distribution.unknown++;
  });
  
  // Convert to percentages
  const total = words.length;
  Object.keys(distribution).forEach(level => {
    distribution[level] = total > 0 ? (distribution[level] / total) * 100 : 0;
  });
  
  return distribution;
}

/**
 * Assess sophisticated word usage percentage
 */
function assessSophisticatedWordUsage(cefrDistribution: Record<string, number>): number {
  return cefrDistribution.B2 + cefrDistribution.C1 + cefrDistribution.C2;
}

/**
 * Assess collocation accuracy (simplified implementation)
 */
function assessCollocationsAccuracy(transcript: string): number {
  const text = transcript.toLowerCase();
  
  // Common incorrect collocations
  const incorrectCollocations = [
    'make a photo', 'do a mistake', 'say a joke', 'make a travel',
    'do a party', 'make a shower', 'strong tea', 'big rain'
  ];
  
  // Common correct collocations
  const correctCollocations = [
    'take a photo', 'make a mistake', 'tell a joke', 'take a trip',
    'have a party', 'take a shower', 'heavy rain', 'make progress'
  ];
  
  let correctCount = 0;
  let incorrectCount = 0;
  
  correctCollocations.forEach(collocation => {
    if (text.includes(collocation)) correctCount++;
  });
  
  incorrectCollocations.forEach(collocation => {
    if (text.includes(collocation)) incorrectCount++;
  });
  
  const total = correctCount + incorrectCount;
  return total > 0 ? (correctCount / total) * 100 : 75; // Default to 75% if no collocations detected
}

/**
 * Determine band score from vocabulary profile
 */
function getBandFromVocabularyProfile(
  cefrDistribution: Record<string, number>,
  lexicalDiversity: number,
  sophisticatedUsage: number
): number {
  // Primarily C1+ vocabulary with sophistication → Band 9
  if (cefrDistribution.C1 + cefrDistribution.C2 > 15 && sophisticatedUsage > 25) {
    return 9.0;
  }
  
  // Rich mix of B2–C1 words, accurate collocations → Band 7–8
  if (sophisticatedUsage > 15 && lexicalDiversity > 0.6) {
    return sophisticatedUsage > 20 ? 8.0 : 7.5;
  }
  
  // Some B1–B2, limited synonyms → Band 6
  if (cefrDistribution.B1 + cefrDistribution.B2 > 30) {
    return lexicalDiversity > 0.5 ? 6.5 : 6.0;
  }
  
  // Only A1–A2 words → Band 4–5
  if (cefrDistribution.A1 + cefrDistribution.A2 > 60) {
    return lexicalDiversity > 0.4 ? 5.0 : 4.5;
  }
  
  return 5.5; // Default middle band
}

/**
 * Create justification text for vocabulary score
 */
function createVocabularyJustification(
  cefrDistribution: Record<string, number>,
  lexicalDiversity: number,
  sophisticatedUsage: number
): string {
  const sophisticatedLevel = sophisticatedUsage > 20 ? 'high' : sophisticatedUsage > 10 ? 'moderate' : 'limited';
  const diversityLevel = lexicalDiversity > 0.7 ? 'excellent' : lexicalDiversity > 0.5 ? 'good' : 'limited';
  
  return `${sophisticatedLevel} sophistication (${sophisticatedUsage.toFixed(1)}%), ${diversityLevel} diversity (${(lexicalDiversity * 100).toFixed(1)}%)`;
}

/**
 * Group words by CEFR level
 */
function groupWordsByLevel(words: string[]): Record<string, string[]> {
  const grouped: Record<string, string[]> = {
    A1: [], A2: [], B1: [], B2: [], C1: [], C2: [], unknown: []
  };
  
  words.forEach(word => {
    let found = false;
    for (const [level, wordList] of Object.entries(CEFR_WORD_LISTS)) {
      if (wordList.includes(word)) {
        grouped[level].push(word);
        found = true;
        break;
      }
    }
    if (!found) grouped.unknown.push(word);
  });
  
  return grouped;
}