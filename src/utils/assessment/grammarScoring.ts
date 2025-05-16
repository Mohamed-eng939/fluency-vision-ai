
import { GrammaticalError } from "../../types/assessment";

/**
 * Enhanced grammar scoring based on error analysis and sentence structure
 */
export const calculateGrammarScore = (
  audioMetrics: any,
  transcript: string
): number => {
  // If we have detailed grammatical error analysis
  if (audioMetrics.grammaticalErrors) {
    return calculateGrammarScoreFromErrors(
      audioMetrics.grammaticalErrors,
      transcript
    );
  }
  
  // Otherwise use a more basic approach
  return calculateBasicGrammarScore(transcript);
};

/**
 * Calculate grammar score based on detected errors
 */
export const calculateGrammarScoreFromErrors = (
  errors: GrammaticalError[],
  transcript: string
): number => {
  if (!transcript) return 5;
  
  const words = transcript.split(/\s+/).length;
  
  // Calculate error density (errors per 100 words)
  const errorDensity = (errors.length / words) * 100;
  
  // Score based on error density
  if (errorDensity < 1) return 10; // < 1 error per 100 words: excellent
  if (errorDensity < 2) return 9;  // < 2 errors per 100 words: very good
  if (errorDensity < 3.5) return 8; // < 3.5 errors per 100 words: good
  if (errorDensity < 5) return 7;   // < 5 errors per 100 words: fairly good
  if (errorDensity < 7.5) return 6; // < 7.5 errors per 100 words: above average
  if (errorDensity < 10) return 5;  // < 10 errors per 100 words: average
  if (errorDensity < 15) return 4;  // < 15 errors per 100 words: below average
  if (errorDensity < 20) return 3;  // < 20 errors per 100 words: weak
  if (errorDensity < 25) return 2;  // < 25 errors per 100 words: very weak
  return 1; // 25+ errors per 100 words: extremely weak
};

/**
 * Calculate basic grammar score from transcript text
 */
export const calculateBasicGrammarScore = (transcript: string): number => {
  if (!transcript) return 5;
  
  // Split into sentences
  const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 0);
  if (sentences.length === 0) return 5;
  
  let score = 5; // Default mid-range score
  
  // Check for basic grammar patterns
  
  // 1. Subject-verb agreement errors
  const svAgreementErrors = countPattern(transcript, /\b(they|we|you) (is|was)\b|\b(he|she|it) (are|were)\b/gi);
  
  // 2. Tense consistency
  const tenseMixing = countTenseMixing(sentences);
  
  // 3. Article usage
  const articleErrors = countArticleErrors(transcript);
  
  // 4. Sentence variety
  const sentenceVariety = calculateSentenceVariety(sentences);
  
  // Adjust score based on these factors
  if (svAgreementErrors > 2) score -= 1;
  if (tenseMixing > 1) score -= 1;
  if (articleErrors > 2) score -= 1;
  
  score += sentenceVariety;
  
  // NEW: Detect clause-level errors
  const verbTenseConflicts = detectVerbTenseConflicts(transcript);
  const auxiliaryErrors = detectAuxiliaryErrors(transcript);
  const missingDeterminers = detectMissingDeterminers(transcript);
  
  // NEW: Apply 1-point deduction for specific errors
  if (verbTenseConflicts > 1) score -= 1; // Multiple verb tense conflicts
  if (auxiliaryErrors > 2) score -= 1;    // More than 2 auxiliary errors
  if (missingDeterminers > 2) score -= 1; // Missing determiners in noun phrases
  
  // NEW: Redundancy Penalty - implemented using repetition detection
  const repetitionRatio = detectRepetition(transcript);
  if (repetitionRatio > 0.25) score -= 1; // 25%+ repeated content
  
  // NEW: Minimum Sentence Quality Filter
  const avgSentenceLength = transcript.split(/\s+/).length / sentences.length;
  const errorCount = svAgreementErrors + tenseMixing + articleErrors + 
                     verbTenseConflicts + auxiliaryErrors + missingDeterminers;
  const wordCount = transcript.split(/\s+/).length;
  const errorDensity = wordCount > 0 ? errorCount / wordCount : 0;
  
  if (avgSentenceLength < 5 && errorDensity > 0.25) {
    score = Math.min(score, 5.5); // Cap grammar score at 5.5
  }
  
  // Adjust for transcript length - very short responses get penalized
  if (transcript.length < 50) score -= 1;
  
  // Ensure score is between 1-10
  return Math.max(1, Math.min(10, score));
};

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
 * NEW: Detect verb tense conflicts within clauses
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
 * NEW: Detect auxiliary verb errors
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
 * NEW: Detect missing determiners in noun phrases
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

/**
 * NEW: Detect repetition in content
 * Returns the ratio of repeated phrases to total content
 */
export const detectRepetition = (text: string): number => {
  if (!text || text.length < 10) return 0;
  
  // Get unique words and their count
  const words = text.toLowerCase().split(/\s+/);
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
