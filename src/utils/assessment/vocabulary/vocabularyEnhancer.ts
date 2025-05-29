
import { cefrVocabulary, cefrLevelToScoreRange } from './cefrVocabularyData';

interface VocabularyEnhancement {
  original: string;
  suggestions: string[];
  reason: string;
  targetLevel: string;
  examples: string[];
}

interface VocabularyAnalysis {
  enhancements: VocabularyEnhancement[];
  currentLevel: string;
  averageWordLevel: string;
  levelDistribution: Record<string, number>;
}

// Enhanced vocabulary with alternatives
const vocabularyEnhancements: Record<string, {
  level: string;
  alternatives: Array<{
    word: string;
    level: string;
    example: string;
  }>;
}> = {
  'good': {
    level: 'A1',
    alternatives: [
      { word: 'excellent', level: 'B1', example: 'The presentation was excellent.' },
      { word: 'outstanding', level: 'B2', example: 'Her performance was outstanding.' },
      { word: 'remarkable', level: 'C1', example: 'It was a remarkable achievement.' }
    ]
  },
  'bad': {
    level: 'A1',
    alternatives: [
      { word: 'terrible', level: 'A2', example: 'The weather was terrible.' },
      { word: 'dreadful', level: 'B2', example: 'The traffic was dreadful.' },
      { word: 'appalling', level: 'C1', example: 'The conditions were appalling.' }
    ]
  },
  'big': {
    level: 'A1',
    alternatives: [
      { word: 'large', level: 'A2', example: 'It\'s a large building.' },
      { word: 'enormous', level: 'B1', example: 'The elephant was enormous.' },
      { word: 'massive', level: 'B2', example: 'There was a massive crowd.' }
    ]
  },
  'small': {
    level: 'A1',
    alternatives: [
      { word: 'tiny', level: 'A2', example: 'The apartment was tiny.' },
      { word: 'compact', level: 'B1', example: 'It\'s a compact design.' },
      { word: 'minute', level: 'C1', example: 'The details were minute.' }
    ]
  },
  'nice': {
    level: 'A1',
    alternatives: [
      { word: 'pleasant', level: 'B1', example: 'It was a pleasant evening.' },
      { word: 'delightful', level: 'B2', example: 'The garden was delightful.' },
      { word: 'charming', level: 'B2', example: 'She has a charming personality.' }
    ]
  },
  'fun': {
    level: 'A1',
    alternatives: [
      { word: 'enjoyable', level: 'B1', example: 'The movie was enjoyable.' },
      { word: 'entertaining', level: 'B2', example: 'The show was entertaining.' },
      { word: 'exhilarating', level: 'C1', example: 'The ride was exhilarating.' }
    ]
  },
  'important': {
    level: 'A2',
    alternatives: [
      { word: 'significant', level: 'B2', example: 'This is a significant discovery.' },
      { word: 'crucial', level: 'C1', example: 'Timing is crucial for success.' },
      { word: 'paramount', level: 'C2', example: 'Safety is of paramount importance.' }
    ]
  },
  'different': {
    level: 'A2',
    alternatives: [
      { word: 'distinct', level: 'B2', example: 'Each culture has distinct traditions.' },
      { word: 'diverse', level: 'B2', example: 'The team has diverse backgrounds.' },
      { word: 'disparate', level: 'C2', example: 'The data shows disparate results.' }
    ]
  }
};

/**
 * Determine CEFR level of a word
 */
const getWordLevel = (word: string): string => {
  const lowerWord = word.toLowerCase();
  
  for (const [level, words] of Object.entries(cefrVocabulary)) {
    if (words.includes(lowerWord)) {
      return level;
    }
  }
  
  // If not found in basic lists, assume higher level
  return 'B2';
};

/**
 * Analyze transcript for vocabulary enhancement opportunities
 */
export const analyzeVocabularyEnhancements = (
  transcript: string,
  currentCefrLevel: string = 'B1'
): VocabularyAnalysis => {
  const words = transcript.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2);

  const levelDistribution: Record<string, number> = {
    'A1': 0, 'A2': 0, 'B1': 0, 'B2': 0, 'C1': 0, 'C2': 0
  };

  const wordLevels = words.map(word => {
    const level = getWordLevel(word);
    levelDistribution[level]++;
    return { word, level };
  });

  // Find words that could be enhanced
  const enhancements: VocabularyEnhancement[] = [];
  const wordCounts: Record<string, number> = {};

  words.forEach(word => {
    wordCounts[word] = (wordCounts[word] || 0) + 1;
  });

  // Look for enhancement opportunities
  Object.entries(wordCounts).forEach(([word, count]) => {
    if (vocabularyEnhancements[word] && count > 0) {
      const enhancement = vocabularyEnhancements[word];
      
      // Suggest alternatives at or above current level
      const suitableAlternatives = enhancement.alternatives.filter(alt => {
        const currentLevelOrder = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].indexOf(currentCefrLevel);
        const altLevelOrder = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].indexOf(alt.level);
        return altLevelOrder >= currentLevelOrder;
      });

      if (suitableAlternatives.length > 0) {
        enhancements.push({
          original: word,
          suggestions: suitableAlternatives.map(alt => alt.word),
          reason: count > 1 
            ? `You used "${word}" ${count} times. Try varying your vocabulary.`
            : `"${word}" is a basic word. Consider using more advanced alternatives.`,
          targetLevel: suitableAlternatives[0].level,
          examples: suitableAlternatives.map(alt => alt.example)
        });
      }
    }
  });

  // Calculate average word level
  const totalWords = words.length;
  const levelWeights = { 'A1': 1, 'A2': 2, 'B1': 3, 'B2': 4, 'C1': 5, 'C2': 6 };
  const weightedSum = Object.entries(levelDistribution)
    .reduce((sum, [level, count]) => sum + (levelWeights[level as keyof typeof levelWeights] * count), 0);
  
  const averageWeight = totalWords > 0 ? weightedSum / totalWords : 0;
  const averageWordLevel = averageWeight <= 1.5 ? 'A1' :
                          averageWeight <= 2.5 ? 'A2' :
                          averageWeight <= 3.5 ? 'B1' :
                          averageWeight <= 4.5 ? 'B2' :
                          averageWeight <= 5.5 ? 'C1' : 'C2';

  return {
    enhancements,
    currentLevel: currentCefrLevel,
    averageWordLevel,
    levelDistribution
  };
};

/**
 * Get vocabulary enhancement suggestions for a specific word
 */
export const getWordEnhancements = (word: string, targetLevel: string = 'B2') => {
  const enhancement = vocabularyEnhancements[word.toLowerCase()];
  if (!enhancement) return null;

  const targetLevelOrder = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].indexOf(targetLevel);
  const suitableAlternatives = enhancement.alternatives.filter(alt => {
    const altLevelOrder = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].indexOf(alt.level);
    return altLevelOrder >= targetLevelOrder;
  });

  return suitableAlternatives;
};
