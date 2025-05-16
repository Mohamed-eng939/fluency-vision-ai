
/**
 * Grammar Error Analysis Functions
 * Functions to analyze grammatical errors in text
 */

/**
 * Count instances of a pattern in text
 */
export const countPattern = (text: string, pattern: RegExp): number => {
  const matches = text.match(pattern);
  return matches ? matches.length : 0;
};

/**
 * Check for tense mixing in adjacent sentences
 */
export const countTenseMixing = (sentences: string[]): number => {
  let mixCount = 0;
  
  for (let i = 0; i < sentences.length - 1; i++) {
    const currentTense = detectTense(sentences[i]);
    const nextTense = detectTense(sentences[i + 1]);
    
    // If sentences shift tense without logical reason
    if (currentTense && nextTense && currentTense !== nextTense) {
      mixCount++;
    }
  }
  
  return mixCount;
};

/**
 * Detect the primary tense of a sentence
 */
export const detectTense = (sentence: string): string | null => {
  // Simple tense detection based on verb forms
  if (/\b(will|going to|shall)\b/i.test(sentence)) return 'future';
  if (/\b(is|am|are|'s|'re|'m) ([\w]+ing)\b/i.test(sentence)) return 'present-continuous';
  if (/\b(was|were) ([\w]+ing)\b/i.test(sentence)) return 'past-continuous';
  if (/\b(has|have|'ve) ([\w]+ed|[\w]+en)\b/i.test(sentence)) return 'present-perfect';
  if (/\b(had|'d) ([\w]+ed|[\w]+en)\b/i.test(sentence)) return 'past-perfect';
  
  // Check for simple past (-ed endings)
  if (/\b[\w]+(ed|t|ought|aught)\b/i.test(sentence)) return 'past';
  
  // Default to present if no other tense is detected
  return 'present';
};

/**
 * Count likely article errors
 */
export const countArticleErrors = (text: string): number => {
  // Common article error patterns
  const patterns = [
    /\b(a) ([aeiou]\w+)\b/gi,               // "a" before vowel sound
    /\b(an) ([^aeiou]\w+)\b/gi,             // "an" before consonant sound
    /\b(the) ([A-Z]\w+)\b/gi,               // "the" before proper noun
    /\b(go to) (the) (school|college|university|work)\b/gi,  // Incorrect "the" with institutions
  ];
  
  return patterns.reduce((count, pattern) => {
    const matches = text.match(pattern) || [];
    return count + matches.length;
  }, 0);
};

/**
 * Detect verb tense conflicts within clauses
 * For example: "I go to the store yesterday" or "I went to store tomorrow"
 */
export const detectVerbTenseConflicts = (text: string): number => {
  let conflicts = 0;
  
  // Look for past tense verbs with future time indicators
  if (/\b(yesterday|ago|last) .* (will|going to)\b/i.test(text)) conflicts++;
  if (/\b(will|going to) .* (yesterday|ago|last)\b/i.test(text)) conflicts++;
  
  // Look for present tense with past time indicators
  if (/\b(yesterday|ago|last) .* \b(go|come|do|have|am|is|are)\b(?!\w)/i.test(text)) conflicts++;
  
  // Look for mixed tenses in same clause
  const clauses = text.split(/[,.;:]\s+/);
  clauses.forEach(clause => {
    // Count different tense forms in the same clause
    const tenseTypes = new Set();
    if (/\b(ed|t|ought|aught)\b/i.test(clause)) tenseTypes.add('past');
    if (/\b(will|going to|shall)\b/i.test(clause)) tenseTypes.add('future');
    if (/\b(is|am|are|'s|'re|'m) ([\w]+ing)\b/i.test(clause)) tenseTypes.add('present-continuous');
    
    // If more than one tense in a single clause without conjunction
    if (tenseTypes.size > 1 && !/\b(and|but|or|because|though|although|when|if)\b/i.test(clause)) {
      conflicts++;
    }
  });
  
  return conflicts;
};

/**
 * Detect auxiliary verb errors
 * For example: "I didn't went" or "He don't know"
 */
export const detectAuxiliaryErrors = (text: string): number => {
  // Common auxiliary error patterns
  const patterns = [
    /\b(didn't|did not) (\w+ed)\b/gi,      // didn't + past tense
    /\b(don't|do not) ([^the\s]\w+s)\b/gi,  // don't + 3rd person singular
    /\b(he|she|it) (don't|do not)\b/gi,     // 3rd person + don't
    /\b(hasn't|has not) (\w+ed)\b/gi,       // hasn't + past participle
    /\b(am|is|are|was|were) (\w+ed)\b/gi,   // be + past tense (should be participle)
  ];
  
  return patterns.reduce((count, pattern) => {
    const matches = text.match(pattern) || [];
    return count + matches.length;
  }, 0);
};

/**
 * Detect missing determiners in noun phrases
 * For example: "I went to store" or "She is teacher"
 */
export const detectMissingDeterminers = (text: string): number => {
  // Common patterns for missing determiners
  const patterns = [
    /\b(to|at|in) ([a-z]+)\b(?! (the|a|an|my|your|his|her|their|our|its))/gi, // to/at/in + noun without determiner
    /\b(is|am|are|was|were) ([a-z]+er)\b(?! (the|a|an|my|your|his|her|their|our|its))/gi, // is + profession without determiner
  ];
  
  // Exclude common exceptions where determiners aren't needed
  const exceptions = /\b(to|at|in) (school|college|university|home|work|church|bed|hospital)\b/gi;
  const exceptionMatches = text.match(exceptions) || [];
  
  let totalMissing = patterns.reduce((count, pattern) => {
    const matches = text.match(pattern) || [];
    return count + matches.length;
  }, 0);
  
  // Subtract exceptions
  totalMissing = Math.max(0, totalMissing - exceptionMatches.length);
  
  return totalMissing;
};
