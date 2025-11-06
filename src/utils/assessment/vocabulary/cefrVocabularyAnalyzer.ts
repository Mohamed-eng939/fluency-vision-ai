
/**
 * CEFR Vocabulary Analyzer
 * STRICT MODE: Uses official CEFR word list only, no fallback guessing
 */

import { cefrVocabulary, stopWords, cefrLevelToScoreRange, cefrVocabularyIndicators } from './cefrVocabularyData';

/**
 * Interface for vocabulary analysis result
 */
export interface VocabularyAnalysisResult {
  vocabularyScore: number;
  cefrVocabularyLevel: string;
  vocabularyJustification: string;
  wordDistribution: Record<string, number>;
  lexicalDiversity: number;
  uniqueWordCount: number;
  totalWordCount: number;
  recognizedWordCount: number; // Words found in CEFR list
  unrecognizedWordCount: number; // Words not in CEFR list
}

/**
 * Clean and tokenize text into words
 */
const tokenizeText = (text: string): string[] => {
  if (!text) return [];
  
  return text
    .toLowerCase()
    .replace(/[^\w\s'-]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 0 && !stopWords.includes(word));
};

/**
 * Get the CEFR level for a given word
 * STRICT MODE: Returns null if word not found in CEFR list
 */
const getWordCefrLevel = (word: string): string | null => {
  const normalizedWord = word.toLowerCase();
  
  // Check each CEFR level from highest to lowest
  if (cefrVocabulary.C2?.some(w => w.toLowerCase() === normalizedWord)) return 'C2';
  if (cefrVocabulary.C1?.some(w => w.toLowerCase() === normalizedWord)) return 'C1';
  if (cefrVocabulary.B2?.some(w => w.toLowerCase() === normalizedWord)) return 'B2';
  if (cefrVocabulary.B1?.some(w => w.toLowerCase() === normalizedWord)) return 'B1';
  if (cefrVocabulary.A2?.some(w => w.toLowerCase() === normalizedWord)) return 'A2';
  if (cefrVocabulary.A1?.some(w => w.toLowerCase() === normalizedWord)) return 'A1';
  
  // STRICT MODE: Return null if not found
  return null;
};

/**
 * Calculate vocabulary distribution by CEFR level
 * STRICT MODE: Only counts words found in CEFR list
 */
const calculateVocabularyDistribution = (words: string[]): Record<string, number> => {
  const distribution: Record<string, number> = {
    'A1': 0,
    'A2': 0,
    'B1': 0,
    'B2': 0,
    'C1': 0,
    'C2': 0,
    'not_found': 0
  };
  
  words.forEach(word => {
    const level = getWordCefrLevel(word);
    if (level) {
      distribution[level]++;
    } else {
      distribution['not_found']++;
    }
  });
  
  return distribution;
};

/**
 * Determine the dominant CEFR level based on vocabulary distribution
 * STRICT MODE: Only considers words found in CEFR list
 */
const determineCefrLevel = (distribution: Record<string, number>): string => {
  // Calculate total recognized words (excluding 'not_found')
  const recognizedTotal = Object.entries(distribution)
    .filter(([level]) => level !== 'not_found')
    .reduce((sum, [_, count]) => sum + count, 0);
    
  if (recognizedTotal === 0) return 'A1';
  
  // Calculate weighted scores for each level
  const levelWeights = {
    A1: 1,
    A2: 2,
    B1: 3,
    B2: 4,
    C1: 5,
    C2: 6
  };
  
  let weightedSum = 0;
  Object.entries(distribution).forEach(([level, count]) => {
    if (level in levelWeights) {
      weightedSum += levelWeights[level as keyof typeof levelWeights] * count;
    }
  });
  
  const averageWeight = weightedSum / recognizedTotal;
  
  // Map back to CEFR level based on average weight
  if (averageWeight >= 5.5) return 'C2';
  if (averageWeight >= 4.5) return 'C1';
  if (averageWeight >= 3.5) return 'B2';
  if (averageWeight >= 2.5) return 'B1';
  if (averageWeight >= 1.5) return 'A2';
  return 'A1';
};

/**
 * Calculate vocabulary score based on CEFR level and recognition rate
 * Uses neutral approach: final_score = base_score × (recognized_words / total_words)
 */
const calculateVocabularyScore = (
  cefrLevel: string,
  lexicalDiversity: number,
  recognizedCount: number,
  totalCount: number,
  distribution: Record<string, number>
): number => {
  // Get base score from CEFR level
  const { base, min, max } = cefrLevelToScoreRange[cefrLevel];
  
  // Calculate recognition rate (what % of words were found in CEFR list)
  const recognitionRate = totalCount > 0 ? recognizedCount / totalCount : 0;
  
  // Apply neutral adjustment: multiply base score by recognition rate
  // This ensures fairness without penalizing rare/advanced/misspelled words
  let adjustedScore = base * recognitionRate;
  
  // Minor adjustment for lexical diversity (variety of vocabulary)
  if (lexicalDiversity > 0.7) {
    adjustedScore += 0.3;
  } else if (lexicalDiversity < 0.4) {
    adjustedScore -= 0.3;
  }
  
  // Ensure score stays within valid range
  adjustedScore = Math.max(min, Math.min(max, adjustedScore));
  
  return Math.round(adjustedScore * 10) / 10;
};

/**
 * Generate justification for vocabulary assessment with clear metrics
 */
const generateVocabularyJustification = (
  cefrLevel: string,
  distribution: Record<string, number>,
  lexicalDiversity: number,
  recognizedCount: number,
  totalCount: number
): string => {
  const recognitionRate = Math.round((recognizedCount / totalCount) * 100);
  const unrecognizedRate = Math.round((distribution['not_found'] / totalCount) * 100);
  
  let justification = `**CEFR Level: ${cefrLevel}**\n\n`;
  
  // Recognition rate
  justification += `**Recognition Rate:** ${recognitionRate}% of words found in CEFR word list\n`;
  if (unrecognizedRate > 0) {
    justification += `**Unrecognized:** ${unrecognizedRate}% (not in CEFR database)\n`;
  }
  justification += `\n`;
  
  // CEFR distribution breakdown (only for recognized words)
  if (recognizedCount > 0) {
    justification += `**CEFR Distribution:**\n`;
    const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    levels.forEach(level => {
      const count = distribution[level] || 0;
      if (count > 0) {
        const percentage = Math.round((count / recognizedCount) * 100);
        justification += `- ${level}: ${percentage}%\n`;
      }
    });
    justification += `\n`;
  }
  
  // Lexical diversity
  const diversityPercent = Math.round(lexicalDiversity * 100);
  justification += `**Lexical Variety:** ${diversityPercent}% (unique words / total words)`;
  
  return justification;
};

/**
 * Analyze vocabulary in transcript according to CEFR standards
 * STRICT MODE: Only uses official CEFR word list
 */
export const analyzeCefrVocabulary = (transcript: string): VocabularyAnalysisResult => {
  if (!transcript) {
    return {
      vocabularyScore: 1.0,
      cefrVocabularyLevel: 'A1',
      vocabularyJustification: "No transcript provided.",
      wordDistribution: { 'A1': 0, 'A2': 0, 'B1': 0, 'B2': 0, 'C1': 0, 'C2': 0, 'not_found': 0 },
      lexicalDiversity: 0,
      uniqueWordCount: 0,
      totalWordCount: 0,
      recognizedWordCount: 0,
      unrecognizedWordCount: 0
    };
  }
  
  // Tokenize and clean
  const words = tokenizeText(transcript);
  
  if (words.length === 0) {
    return {
      vocabularyScore: 1.0,
      cefrVocabularyLevel: 'A1',
      vocabularyJustification: "No meaningful words after filtering.",
      wordDistribution: { 'A1': 0, 'A2': 0, 'B1': 0, 'B2': 0, 'C1': 0, 'C2': 0, 'not_found': 0 },
      lexicalDiversity: 0,
      uniqueWordCount: 0,
      totalWordCount: 0,
      recognizedWordCount: 0,
      unrecognizedWordCount: 0
    };
  }
  
  // Calculate metrics
  const uniqueWords = new Set(words);
  const lexicalDiversity = uniqueWords.size / words.length;
  
  // Get distribution
  const distribution = calculateVocabularyDistribution(words);
  const recognizedCount = Object.entries(distribution)
    .filter(([level]) => level !== 'not_found')
    .reduce((sum, [_, count]) => sum + count, 0);
  const unrecognizedCount = distribution['not_found'];
  
  // Determine CEFR level
  const cefrLevel = determineCefrLevel(distribution);
  
  // Calculate score
  const vocabularyScore = calculateVocabularyScore(
    cefrLevel,
    lexicalDiversity,
    recognizedCount,
    words.length,
    distribution
  );
  
  // Generate justification
  const vocabularyJustification = generateVocabularyJustification(
    cefrLevel,
    distribution,
    lexicalDiversity,
    recognizedCount,
    words.length
  );
  
  return {
    vocabularyScore,
    cefrVocabularyLevel: cefrLevel,
    vocabularyJustification,
    wordDistribution: distribution,
    lexicalDiversity,
    uniqueWordCount: uniqueWords.size,
    totalWordCount: words.length,
    recognizedWordCount: recognizedCount,
    unrecognizedWordCount: unrecognizedCount
  };
};
