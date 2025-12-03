
/**
 * CEFR Vocabulary Analyzer
 * STRICT MODE: Uses official CEFR word list only, no numeric scoring
 */

import { cefrVocabulary, stopWords } from './cefrVocabularyData';

/**
 * Interface for vocabulary analysis result - NO numeric scores
 */
export interface VocabularyAnalysisResult {
  cefrVocabularyLevel: string;
  vocabularyJustification: string;
  wordDistribution: Record<string, number>;
  lexicalDiversity: number;
  uniqueWordCount: number;
  totalWordCount: number;
  recognizedWordCount: number;
  unrecognizedWordCount: number;
  recognizedWords: Record<string, string[]>; // Words by CEFR level
  unrecognizedWords: string[];
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
  
  if (cefrVocabulary.C2?.some(w => w.toLowerCase() === normalizedWord)) return 'C2';
  if (cefrVocabulary.C1?.some(w => w.toLowerCase() === normalizedWord)) return 'C1';
  if (cefrVocabulary.B2?.some(w => w.toLowerCase() === normalizedWord)) return 'B2';
  if (cefrVocabulary.B1?.some(w => w.toLowerCase() === normalizedWord)) return 'B1';
  if (cefrVocabulary.A2?.some(w => w.toLowerCase() === normalizedWord)) return 'A2';
  if (cefrVocabulary.A1?.some(w => w.toLowerCase() === normalizedWord)) return 'A1';
  
  return null;
};

/**
 * Calculate vocabulary distribution by CEFR level
 * STRICT MODE: Only counts words found in CEFR list
 */
const calculateVocabularyDistribution = (words: string[]): { 
  distribution: Record<string, number>;
  recognizedWords: Record<string, string[]>;
  unrecognizedWords: string[];
} => {
  const distribution: Record<string, number> = {
    'A1': 0, 'A2': 0, 'B1': 0, 'B2': 0, 'C1': 0, 'C2': 0, 'not_found': 0
  };
  
  const recognizedWords: Record<string, string[]> = {
    'A1': [], 'A2': [], 'B1': [], 'B2': [], 'C1': [], 'C2': []
  };
  
  const unrecognizedWords: string[] = [];
  const seenWords = new Set<string>();
  
  words.forEach(word => {
    const level = getWordCefrLevel(word);
    if (level) {
      distribution[level]++;
      if (!seenWords.has(word)) {
        recognizedWords[level].push(word);
        seenWords.add(word);
      }
    } else {
      distribution['not_found']++;
      if (!seenWords.has(word)) {
        unrecognizedWords.push(word);
        seenWords.add(word);
      }
    }
  });
  
  return { distribution, recognizedWords, unrecognizedWords };
};

/**
 * Determine the dominant CEFR level based on vocabulary distribution
 * STRICT MODE: Only considers words found in CEFR list - NO numeric adjustments
 */
const determineCefrLevel = (distribution: Record<string, number>): string => {
  const recognizedTotal = Object.entries(distribution)
    .filter(([level]) => level !== 'not_found')
    .reduce((sum, [_, count]) => sum + count, 0);
    
  if (recognizedTotal === 0) return 'A1';
  
  const levelWeights = { A1: 1, A2: 2, B1: 3, B2: 4, C1: 5, C2: 6 };
  
  let weightedSum = 0;
  Object.entries(distribution).forEach(([level, count]) => {
    if (level in levelWeights) {
      weightedSum += levelWeights[level as keyof typeof levelWeights] * count;
    }
  });
  
  const averageWeight = weightedSum / recognizedTotal;
  
  if (averageWeight >= 5.5) return 'C2';
  if (averageWeight >= 4.5) return 'C1';
  if (averageWeight >= 3.5) return 'B2';
  if (averageWeight >= 2.5) return 'B1';
  if (averageWeight >= 1.5) return 'A2';
  return 'A1';
};

/**
 * Generate justification for vocabulary assessment - CEFR mapping only
 */
const generateVocabularyJustification = (
  cefrLevel: string,
  distribution: Record<string, number>,
  lexicalDiversity: number,
  recognizedCount: number,
  totalCount: number
): string => {
  const recognitionRate = totalCount > 0 ? Math.round((recognizedCount / totalCount) * 100) : 0;
  
  let justification = `**CEFR Level: ${cefrLevel}**\n\n`;
  justification += `**Words Analyzed:** ${totalCount} total, ${recognizedCount} recognized in CEFR list (${recognitionRate}%)\n\n`;
  
  if (recognizedCount > 0) {
    justification += `**CEFR Distribution:**\n`;
    const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    levels.forEach(level => {
      const count = distribution[level] || 0;
      if (count > 0) {
        const percentage = Math.round((count / recognizedCount) * 100);
        justification += `- ${level}: ${count} words (${percentage}%)\n`;
      }
    });
    justification += `\n`;
  }
  
  const diversityPercent = Math.round(lexicalDiversity * 100);
  justification += `**Lexical Variety:** ${diversityPercent}%`;
  
  return justification;
};

/**
 * Analyze vocabulary in transcript according to CEFR standards
 * STRICT MODE: Only uses official CEFR word list - NO numeric scores
 */
export const analyzeCefrVocabulary = (transcript: string): VocabularyAnalysisResult => {
  if (!transcript) {
    return {
      cefrVocabularyLevel: 'A1',
      vocabularyJustification: "No transcript provided.",
      wordDistribution: { 'A1': 0, 'A2': 0, 'B1': 0, 'B2': 0, 'C1': 0, 'C2': 0, 'not_found': 0 },
      lexicalDiversity: 0,
      uniqueWordCount: 0,
      totalWordCount: 0,
      recognizedWordCount: 0,
      unrecognizedWordCount: 0,
      recognizedWords: { 'A1': [], 'A2': [], 'B1': [], 'B2': [], 'C1': [], 'C2': [] },
      unrecognizedWords: []
    };
  }
  
  const words = tokenizeText(transcript);
  
  if (words.length === 0) {
    return {
      cefrVocabularyLevel: 'A1',
      vocabularyJustification: "No meaningful words after filtering.",
      wordDistribution: { 'A1': 0, 'A2': 0, 'B1': 0, 'B2': 0, 'C1': 0, 'C2': 0, 'not_found': 0 },
      lexicalDiversity: 0,
      uniqueWordCount: 0,
      totalWordCount: 0,
      recognizedWordCount: 0,
      unrecognizedWordCount: 0,
      recognizedWords: { 'A1': [], 'A2': [], 'B1': [], 'B2': [], 'C1': [], 'C2': [] },
      unrecognizedWords: []
    };
  }
  
  const uniqueWords = new Set(words);
  const lexicalDiversity = uniqueWords.size / words.length;
  
  const { distribution, recognizedWords, unrecognizedWords } = calculateVocabularyDistribution(words);
  const recognizedCount = Object.entries(distribution)
    .filter(([level]) => level !== 'not_found')
    .reduce((sum, [_, count]) => sum + count, 0);
  const unrecognizedCount = distribution['not_found'];
  
  const cefrLevel = determineCefrLevel(distribution);
  
  const vocabularyJustification = generateVocabularyJustification(
    cefrLevel,
    distribution,
    lexicalDiversity,
    recognizedCount,
    words.length
  );
  
  return {
    cefrVocabularyLevel: cefrLevel,
    vocabularyJustification,
    wordDistribution: distribution,
    lexicalDiversity,
    uniqueWordCount: uniqueWords.size,
    totalWordCount: words.length,
    recognizedWordCount: recognizedCount,
    unrecognizedWordCount: unrecognizedCount,
    recognizedWords,
    unrecognizedWords
  };
};
