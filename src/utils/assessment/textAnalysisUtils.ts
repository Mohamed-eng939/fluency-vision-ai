
/**
 * Utilities for text analysis to support coherence scoring
 */

/**
 * Extract potential topic entities from text
 */
export const extractEntities = (text: string): string[] => {
  if (!text) return [];
  
  // Simple entity extraction based on capitalized words not at sentence start
  const words = text.split(/\s+/);
  const entities: string[] = [];
  
  for (let i = 1; i < words.length; i++) {
    const word = words[i].replace(/[.,!?;:'"\(\)]/g, '');
    if (word.length > 0 && word[0] === word[0].toUpperCase()) {
      entities.push(word);
    }
  }
  
  // Also consider common nouns as potential topics
  const commonNouns = [
    'time', 'person', 'year', 'way', 'day', 'thing', 'man', 'woman', 'world',
    'life', 'school', 'place', 'case', 'work', 'system', 'group', 'number',
    'problem', 'fact', 'home', 'room', 'area', 'book', 'water', 'company'
  ];
  
  const textLower = text.toLowerCase();
  commonNouns.forEach(noun => {
    if (textLower.includes(` ${noun} `)) {
      entities.push(noun);
    }
  });
  
  return entities;
};

/**
 * Count the number of distinct propositions/ideas in a text
 */
export const countPropositions = (text: string): number => {
  if (!text) return 0;
  
  // Split into sentences
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  // Simple heuristic: count main verbs as proxy for propositions
  const verbPatterns = [
    /\b(?:is|am|are|was|were)\b/gi, // be verbs
    /\b(?:has|have|had)\b/gi,       // have verbs
    /\b(?:do|does|did)\b/gi,        // do verbs
    /\b(?:can|could|will|would|should|must)\b/gi, // modal verbs
    /\b\w+(?:s|ed|ing)\b/gi         // other verb forms (simplified)
  ];
  
  // Count potential verb occurrences (very simplified approach)
  let verbCount = 0;
  verbPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) verbCount += matches.length;
  });
  
  // Estimate unique propositions - this is a very rough approximation
  // In a real NLP system, this would use dependency parsing
  const estimatedPropositions = Math.min(sentences.length, Math.ceil(verbCount / 2));
  return Math.max(1, estimatedPropositions);
};

/**
 * Calculate the lexical diversity of a text
 */
export const calculateLexicalDiversity = (text: string): number => {
  if (!text) return 0;
  
  const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 0);
  const uniqueWords = new Set(words).size;
  
  return words.length > 0 ? uniqueWords / words.length : 0;
};

/**
 * Analyze referential coherence (pronoun usage)
 */
export const analyzeReferentialCoherence = (text: string): number => {
  if (!text) return 0;
  
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  if (sentences.length < 2) return 0;
  
  // Count pronouns that typically refer to previously mentioned entities
  const pronounRegex = /\b(he|she|it|they|them|their|these|those|this|that)\b/gi;
  let pronounCount = 0;
  
  // Skip the first sentence (pronouns in first sentence don't create cohesion)
  for (let i = 1; i < sentences.length; i++) {
    const matches = sentences[i].match(pronounRegex);
    if (matches) pronounCount += matches.length;
  }
  
  // Normalize by number of sentences (minus the first one)
  return pronounCount / (sentences.length - 1);
};
