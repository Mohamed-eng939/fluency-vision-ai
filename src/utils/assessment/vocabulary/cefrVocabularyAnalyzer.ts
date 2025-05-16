
/**
 * CEFR Vocabulary Analyzer
 * Analyzes vocabulary usage according to CEFR levels
 */

import { cefrVocabulary, stopWords, cefrLevelToScoreRange, cefrVocabularyIndicators } from './cefrVocabularyData';
import { lemmatize } from './lemmatizer';

/**
 * Interface for vocabulary analysis result
 */
export interface VocabularyAnalysisResult {
  vocabularyScore: number;
  cefrVocabularyLevel: string;
  vocabularyJustification: string;
  wordDistribution: Record<string, number>; // Distribution of words by CEFR level
  lexicalDiversity: number;
  uniqueWordCount: number;
  totalWordCount: number;
}

/**
 * Clean and tokenize text into words
 */
const tokenizeText = (text: string): string[] => {
  if (!text) return [];
  
  // Remove punctuation and split into words
  return text
    .toLowerCase()
    .replace(/[^\w\s'-]/g, ' ')  // Keep apostrophes and hyphens
    .split(/\s+/)
    .filter(word => word.length > 0 && !stopWords.includes(word));
};

/**
 * Determine the CEFR level of a word
 */
const getWordCefrLevel = (word: string): string => {
  const lemma = lemmatize(word);
  
  // Check each CEFR level from highest to lowest
  if (cefrVocabulary.C2.includes(lemma)) return 'C2';
  if (cefrVocabulary.C1.includes(lemma)) return 'C1';
  if (cefrVocabulary.B2.includes(lemma)) return 'B2';
  if (cefrVocabulary.B1.includes(lemma)) return 'B1';
  if (cefrVocabulary.A2.includes(lemma)) return 'A2';
  if (cefrVocabulary.A1.includes(lemma)) return 'A1';
  
  // Default to A1 for unknown words (in a production system,
  // we would use a more comprehensive word frequency list)
  return 'A1';
};

/**
 * Calculate vocabulary distribution by CEFR level
 */
const calculateVocabularyDistribution = (words: string[]): Record<string, number> => {
  const distribution: Record<string, number> = {
    'A1': 0,
    'A2': 0,
    'B1': 0,
    'B2': 0,
    'C1': 0,
    'C2': 0
  };
  
  words.forEach(word => {
    const level = getWordCefrLevel(word);
    distribution[level]++;
  });
  
  return distribution;
};

/**
 * Determine the dominant CEFR level based on vocabulary distribution
 */
const determineCefrLevel = (distribution: Record<string, number>): string => {
  // Calculate weighted score
  // We give higher weight to higher-level vocabulary to recognize advanced usage
  const weightedScores = {
    'A1': distribution['A1'] * 1,
    'A2': distribution['A2'] * 2,
    'B1': distribution['B1'] * 4,
    'B2': distribution['B2'] * 8,
    'C1': distribution['C1'] * 16,
    'C2': distribution['C2'] * 32
  };
  
  // Get the total count and advanced counts
  const totalWords = Object.values(distribution).reduce((sum, count) => sum + count, 0);
  const advancedCount = distribution['B2'] + distribution['C1'] + distribution['C2'];
  
  // If very few words in total, limit the maximum level
  if (totalWords < 30) {
    if (advancedCount > 0) return 'B1';
    return 'A2';
  }
  
  // If significant advanced vocabulary is used
  if (advancedCount / totalWords > 0.1) {
    if (distribution['C2'] > 1) return 'C1';
    if (distribution['C1'] > 2) return 'B2';
    return 'B1';
  }
  
  // Find the highest weighted level
  let maxLevel = 'A1';
  let maxScore = 0;
  
  Object.entries(weightedScores).forEach(([level, score]) => {
    if (score > maxScore) {
      maxScore = score;
      maxLevel = level;
    }
  });
  
  return maxLevel;
};

/**
 * Calculate vocabulary score based on CEFR level and metrics
 */
const calculateVocabularyScore = (
  cefrLevel: string,
  lexicalDiversity: number,
  uniqueCount: number,
  distribution: Record<string, number>
): number => {
  // Get base score from CEFR level
  const { base, min, max } = cefrLevelToScoreRange[cefrLevel];
  
  // Adjust score based on lexical diversity
  let adjustedScore = base;
  
  // Penalize for very low lexical diversity
  if (lexicalDiversity < 0.4) {
    adjustedScore -= 0.5;
  } 
  // Reward high lexical diversity
  else if (lexicalDiversity > 0.7) {
    adjustedScore += 0.5;
  }
  
  // Adjust for very small vocabulary size
  if (uniqueCount < 20) {
    adjustedScore = Math.min(adjustedScore, 5.0);
  }
  
  // Adjust for higher level vocabulary usage
  const higherLevelCount = 
    (cefrLevel === 'A1' ? distribution['A2'] + distribution['B1'] + distribution['B2'] + distribution['C1'] + distribution['C2'] : 0) +
    (cefrLevel === 'A2' ? distribution['B1'] + distribution['B2'] + distribution['C1'] + distribution['C2'] : 0) +
    (cefrLevel === 'B1' ? distribution['B2'] + distribution['C1'] + distribution['C2'] : 0) +
    (cefrLevel === 'B2' ? distribution['C1'] + distribution['C2'] : 0) +
    (cefrLevel === 'C1' ? distribution['C2'] : 0);
  
  if (higherLevelCount > 5) {
    adjustedScore += 0.5;
  }
  
  // Ensure the score stays within the range for this CEFR level
  adjustedScore = Math.max(min, Math.min(max, adjustedScore));
  
  // Final rounding to 1 decimal place
  return Math.round(adjustedScore * 10) / 10;
};

/**
 * Generate justification for the vocabulary assessment
 */
const generateVocabularyJustification = (
  cefrLevel: string,
  distribution: Record<string, number>,
  lexicalDiversity: number,
  uniqueCount: number,
  totalCount: number
): string => {
  const indicators = cefrVocabularyIndicators[cefrLevel];
  
  // Calculate percentages of words at each level
  const totalWords = Object.values(distribution).reduce((sum, count) => sum + count, 0);
  const percentages = Object.fromEntries(
    Object.entries(distribution).map(([level, count]) => 
      [level, Math.round((count / totalWords) * 100)]
    )
  );
  
  // Count higher and lower level words relative to assigned level
  const cefrLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const levelIndex = cefrLevels.indexOf(cefrLevel);
  
  const higherLevelWords = cefrLevels
    .slice(levelIndex + 1)
    .reduce((sum, level) => sum + distribution[level], 0);
  
  const lowerLevelWords = cefrLevels
    .slice(0, levelIndex)
    .reduce((sum, level) => sum + distribution[level], 0);
  
  // Build justification
  let justification = `CEFR ${cefrLevel}: Used vocabulary primarily at ${cefrLevel} level (${percentages[cefrLevel]}%) `;
  
  if (higherLevelWords > 0) {
    justification += `with some higher-level terms (${Math.round((higherLevelWords / totalWords) * 100)}%). `;
  } else {
    justification += `without higher-level terms. `;
  }
  
  // Add lexical diversity comment
  if (lexicalDiversity > 0.7) {
    justification += "Good lexical variety. ";
  } else if (lexicalDiversity < 0.5) {
    justification += "Limited lexical variety with repetition. ";
  } else {
    justification += "Moderate lexical variety. ";
  }
  
  // Add vocabulary size comment if notable
  if (uniqueCount < 20) {
    justification += "Limited vocabulary range. ";
  } else if (uniqueCount > 100) {
    justification += "Extensive vocabulary range. ";
  }
  
  // Add a note about key features observed
  justification += `Shows ${cefrLevel} features: ${indicators.keyFeatures[0]}.`;
  
  return justification;
};

/**
 * Analyze vocabulary in transcript according to CEFR standards
 */
export const analyzeCefrVocabulary = (transcript: string): VocabularyAnalysisResult => {
  if (!transcript) {
    return {
      vocabularyScore: 3.0,
      cefrVocabularyLevel: 'A2',
      vocabularyJustification: "Insufficient vocabulary sample to make a reliable assessment.",
      wordDistribution: { 'A1': 0, 'A2': 0, 'B1': 0, 'B2': 0, 'C1': 0, 'C2': 0 },
      lexicalDiversity: 0,
      uniqueWordCount: 0,
      totalWordCount: 0
    };
  }
  
  // Tokenize and clean the text
  const words = tokenizeText(transcript);
  
  // If no words after filtering, return default
  if (words.length === 0) {
    return {
      vocabularyScore: 3.0,
      cefrVocabularyLevel: 'A2',
      vocabularyJustification: "Insufficient meaningful vocabulary after removing common words.",
      wordDistribution: { 'A1': 0, 'A2': 0, 'B1': 0, 'B2': 0, 'C1': 0, 'C2': 0 },
      lexicalDiversity: 0,
      uniqueWordCount: 0,
      totalWordCount: 0
    };
  }
  
  // Calculate unique words and lexical diversity
  const uniqueWords = new Set(words);
  const lexicalDiversity = uniqueWords.size / words.length;
  
  // Get distribution of words by CEFR level
  const distribution = calculateVocabularyDistribution(words);
  
  // Determine CEFR level
  const cefrLevel = determineCefrLevel(distribution);
  
  // Calculate vocabulary score
  const vocabularyScore = calculateVocabularyScore(
    cefrLevel,
    lexicalDiversity,
    uniqueWords.size,
    distribution
  );
  
  // Generate justification
  const vocabularyJustification = generateVocabularyJustification(
    cefrLevel,
    distribution,
    lexicalDiversity,
    uniqueWords.size,
    words.length
  );
  
  return {
    vocabularyScore,
    cefrVocabularyLevel: cefrLevel,
    vocabularyJustification,
    wordDistribution: distribution,
    lexicalDiversity,
    uniqueWordCount: uniqueWords.size,
    totalWordCount: words.length
  };
};
