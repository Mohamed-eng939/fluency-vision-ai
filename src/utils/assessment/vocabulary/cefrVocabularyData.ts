
/**
 * CEFR Vocabulary Data
 * Loaded from official CEFR word list JSON
 * STRICT MODE: No fallback or guessing logic
 */

import cefrWordsData from '@/data/assessment/cefrWords.json';

// Import the official CEFR word list
export const cefrVocabulary: Record<string, string[]> = cefrWordsData;

// Common words to ignore in assessments (stop words)
export const stopWords = [
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'about',
  'of', 'from', 'as', 'into', 'through', 'after', 'before', 'between', 'under', 'over',
  'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them',
  'my', 'your', 'his', 'her', 'its', 'our', 'their',
  'this', 'that', 'these', 'those',
  'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'shall', 'should',
  'can', 'could', 'may', 'might', 'must',
  'not', 'no', 'nor', 'none',
  'all', 'any', 'some', 'many', 'few', 'more', 'most', 'other', 'such', 'what', 'which'
];

/**
 * Map CEFR level to numeric score range
 */
export const cefrLevelToScoreRange = {
  'A1': { min: 1.0, max: 2.5, base: 1.5 },
  'A2': { min: 2.6, max: 4.0, base: 3.0 },
  'B1': { min: 4.1, max: 5.5, base: 4.5 },
  'B2': { min: 5.6, max: 7.0, base: 6.0 },
  'C1': { min: 7.1, max: 8.5, base: 7.5 },
  'C2': { min: 8.6, max: 10.0, base: 9.0 }
};

/**
 * Define key vocabulary indicators for CEFR levels
 */
export const cefrVocabularyIndicators = {
  A1: {
    description: "Uses a very basic range of single words and simple phrases related to personal details and particular concrete situations.",
    expectedRange: 300,
    keyFeatures: ["Basic verbs (be, have, go)", "Common nouns for everyday objects", "Simple adjectives (big, small, good)"]
  },
  A2: {
    description: "Uses basic vocabulary repertoire on concrete everyday needs. May use lexical boundaries incorrectly but communicates meaning.",
    expectedRange: 1000,
    keyFeatures: ["Frequency adverbs (usually, always)", "Simple modifiers", "Time expressions", "Linking words (and, but, because)"]
  },
  B1: {
    description: "Has sufficient vocabulary to express self on most everyday topics, though may use circumlocution. Some word-finding difficulties.",
    expectedRange: 2000,
    keyFeatures: ["Opinion expressions", "Suggestions", "Comparisons", "Cause/effect language"]
  },
  B2: {
    description: "Has good lexical range for matters connected to field and most general topics. Varies formulation to avoid repetition.",
    expectedRange: 4000,
    keyFeatures: ["Discourse markers (however, despite)", "Abstract concepts", "Evaluative language", "Academic vocabulary"]
  },
  C1: {
    description: "Has broad lexical repertoire allowing gaps to be readily overcome with circumlocutions; little obvious searching for expressions.",
    expectedRange: 8000,
    keyFeatures: ["Idiomatic expressions", "Colloquialisms", "Connotation awareness", "Sophisticated connectors"]
  },
  C2: {
    description: "Has good command of a very broad lexical repertoire including idiomatic expressions and colloquialisms; awareness of connotative levels of meaning.",
    expectedRange: 16000,
    keyFeatures: ["Nuanced vocabulary", "Specialized terminology", "Rare phrases", "Sophisticated academic language"]
  }
};
