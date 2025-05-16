
import { GrammaticalError } from "../../types/assessment";

/**
 * Enhanced grammar scoring based on error analysis and sentence structure
 * Now with CEFR-aligned criteria
 */
export const calculateGrammarScore = (
  audioMetrics: any,
  transcript: string
): number => {
  // If we have CEFR-based analysis available
  if (audioMetrics.cefrGrammarLevel || audioMetrics.grammarScore) {
    return audioMetrics.grammarScore || convertCEFRLevelToScore(audioMetrics.cefrGrammarLevel);
  }
  
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
 * Convert CEFR level to numeric score
 */
const convertCEFRLevelToScore = (level: string): number => {
  if (!level) return 5.0;
  
  switch (level.toUpperCase()) {
    case 'C2': return 9.0;
    case 'C1+': return 8.0;
    case 'C1': return 7.5;
    case 'B2+': return 7.0;
    case 'B2': return 6.5;
    case 'B1+': return 6.0;
    case 'B1': return 5.0;
    case 'A2+': return 4.0;
    case 'A2': return 3.5;
    case 'A1+': return 3.0;
    case 'A1': return 2.0;
    default: return 5.0;
  }
};

/**
 * Calculate grammar score based on detected errors - now CEFR-aligned
 */
export const calculateGrammarScoreFromErrors = (
  errors: GrammaticalError[],
  transcript: string
): number => {
  if (!transcript) return 1.5;
  
  const words = transcript.split(/\s+/).filter(w => w.trim().length > 0).length;
  
  // Calculate error density (errors per 100 words)
  const errorDensity = (errors.length / words) * 100;
  
  // Score based on error density with CEFR alignment
  if (errorDensity < 1) return 9.0;       // < 1 error per 100 words: C1-C2 range
  if (errorDensity < 2) return 8.0;       // < 2 errors per 100 words: C1 range
  if (errorDensity < 3.5) return 7.0;     // < 3.5 errors per 100 words: B2 range
  if (errorDensity < 5) return 6.0;       // < 5 errors per 100 words: B1+ range
  if (errorDensity < 7.5) return 5.0;     // < 7.5 errors per 100 words: B1 range
  if (errorDensity < 10) return 4.0;      // < 10 errors per 100 words: A2+ range
  if (errorDensity < 15) return 3.5;      // < 15 errors per 100 words: A2 range
  if (errorDensity < 20) return 3.0;      // < 20 errors per 100 words: A1+ range
  if (errorDensity < 25) return 2.0;      // < 25 errors per 100 words: A1 range
  return 1.0;                             // 25+ errors per 100 words: Below A1
};

/**
 * Calculate basic grammar score from transcript text
 * Enhanced with CEFR-aligned features and criteria
 */
export const calculateBasicGrammarScore = (transcript: string): number => {
  if (!transcript) return 1.5; // Default low A1 score if no transcript
  
  // Split into sentences for analysis
  const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 0);
  if (sentences.length === 0) return 1.5;
  
  // Start with lowest CEFR level score
  let score = 1.5; // Default mid-range A1 score
  
  // A1 Level Features (1.0-2.5)
  if (detectPresentSimple(transcript)) score = Math.max(score, 1.5);
  if (detectBasicConjunctions(transcript)) score = Math.max(score, 2.0);
  
  // A2 Level Features (2.6-4.0)
  if (detectPastSimple(transcript)) score = Math.max(score, 2.6);
  if (detectComparatives(transcript)) score = Math.max(score, 3.0);
  if (detectAdverbsOfFrequency(transcript)) score = Math.max(score, 3.2);
  if (detectBasicModals(transcript)) score = Math.max(score, 3.5);
  
  // B1 Level Features (4.1-5.5)
  if (detectPresentPerfect(transcript)) score = Math.max(score, 4.1);
  if (detectAdvancedModals(transcript)) score = Math.max(score, 4.5);
  if (detectRelativeClauses(transcript)) score = Math.max(score, 4.8);
  if (detectFirstConditional(transcript)) score = Math.max(score, 5.0);
  
  // B2 Level Features (5.6-7.0)
  if (detectPastPerfect(transcript)) score = Math.max(score, 5.6);
  if (detectPassiveVoice(transcript)) score = Math.max(score, 6.0);
  if (detectSecondConditional(transcript)) score = Math.max(score, 6.3);
  if (detectReportedSpeech(transcript)) score = Math.max(score, 6.7);
  
  // C1 Level Features (7.1-8.5)
  if (detectMixedConditional(transcript)) score = Math.max(score, 7.1);
  if (detectAdvancedModalsWithPerfect(transcript)) score = Math.max(score, 7.5);
  if (detectInversion(transcript)) score = Math.max(score, 7.9);
  if (detectFronting(transcript)) score = Math.max(score, 8.2);
  
  // C2 Level Features (8.6-10.0)
  if (detectCleftSentence(transcript)) score = Math.max(score, 8.6);
  if (detectEllipsis(transcript)) score = Math.max(score, 9.0);
  if (detectIdiomaticStructures(transcript)) score = Math.max(score, 9.3);
  
  // Apply corrections based on error analysis
  
  // Subject-verb agreement errors
  const svAgreementErrors = countPattern(transcript, /\b(they|we|you) (is|was)\b|\b(he|she|it) (are|were)\b/gi);
  
  // Tense consistency
  const tenseMixing = countTenseMixing(sentences);
  
  // Article usage
  const articleErrors = countArticleErrors(transcript);
  
  // Error density calculation
  const totalErrors = svAgreementErrors + tenseMixing + articleErrors + 
                      detectVerbTenseConflicts(transcript) + 
                      detectAuxiliaryErrors(transcript) + 
                      detectMissingDeterminers(transcript);
                      
  const words = transcript.split(/\s+/).filter(w => w.trim().length > 0);
  const errorDensity = words.length > 0 ? totalErrors / words.length : 0;
  
  // Apply CEFR-aligned caps based on error density
  if (errorDensity > 0.4) {
    score = Math.min(score, 3.0);  // Cap at A1+ with very high errors
  } else if (errorDensity > 0.25) {
    score = Math.min(score, 4.0);  // Cap at A2 with high errors
  } else if (errorDensity > 0.15) {
    score = Math.min(score, 5.5);  // Cap at B1 with moderate errors
  } else if (errorDensity > 0.08) {
    score = Math.min(score, 7.0);  // Cap at B2 with low errors
  }
  
  // Adjust for transcript length - very short responses get penalized
  if (words.length < 25) score = Math.min(score, 4.0); // Cap A2 for very short responses
  if (words.length < 15) score = Math.min(score, 3.0); // Cap A1+ for extremely short responses
  
  // CEFR alignment correction
  // If we have assigned a score in a range but essential features of that level are missing
  if (score >= 4.1 && score <= 5.5 && !detectPresentPerfect(transcript)) {
    // Missing key B1 feature (present perfect), cap at A2+
    score = Math.min(score, 4.0);
  } else if (score >= 5.6 && score <= 7.0 && !detectPastPerfect(transcript) && !detectPassiveVoice(transcript)) {
    // Missing key B2 features, cap at B1+
    score = Math.min(score, 5.5);
  } else if (score >= 7.1 && score <= 8.5 && !detectMixedConditional(transcript) && !detectAdvancedModalsWithPerfect(transcript)) {
    // Missing key C1 features, cap at B2+
    score = Math.min(score, 7.0);
  }
  
  // Ensure score is between 1-10
  return Math.max(1, Math.min(10, score));
};

// Grammar feature detection functions - CEFR-aligned

/**
 * Detect present simple
 */
const detectPresentSimple = (text: string): boolean => {
  return /\b(I|you|we|they) ([a-z]+)(?!(ed|ing))\b|he|she|it ([a-z]+)s\b/i.test(text);
};

/**
 * Detect basic conjunctions
 */
const detectBasicConjunctions = (text: string): boolean => {
  return /\b(and|but|or)\b/i.test(text);
};

/**
 * Detect past simple
 */
const detectPastSimple = (text: string): boolean => {
  return /\b\w+ed\b|\b(went|saw|had|was|were|did|made|took|came|knew|got)\b/i.test(text);
};

/**
 * Detect comparatives
 */
const detectComparatives = (text: string): boolean => {
  return /\b(\w+er|more \w+) than\b/i.test(text);
};

/**
 * Detect adverbs of frequency
 */
const detectAdverbsOfFrequency = (text: string): boolean => {
  return /\b(always|usually|often|sometimes|rarely|never)\b/i.test(text);
};

/**
 * Detect basic modals
 */
const detectBasicModals = (text: string): boolean => {
  return /\b(can|must|should)\b/i.test(text);
};

/**
 * Detect present perfect
 */
const detectPresentPerfect = (text: string): boolean => {
  return /\b(have|has) \w+ed\b|\b(have|has) (been|gone|done|seen|had)\b/i.test(text);
};

/**
 * Detect advanced modals
 */
const detectAdvancedModals = (text: string): boolean => {
  return /\b(might|could|would|may)\b/i.test(text);
};

/**
 * Detect relative clauses
 */
const detectRelativeClauses = (text: string): boolean => {
  return /\b(who|which|that|whom|whose)\b/i.test(text);
};

/**
 * Detect first conditional
 */
const detectFirstConditional = (text: string): boolean => {
  return /\bif .+ (will|won't|going to|won't)\b/i.test(text);
};

/**
 * Detect past perfect
 */
const detectPastPerfect = (text: string): boolean => {
  return /\bhad \w+ed\b|\bhad (been|gone|done|seen)\b/i.test(text);
};

/**
 * Detect passive voice
 */
const detectPassiveVoice = (text: string): boolean => {
  return /\b(is|are|was|were|be|been|being) (\w+ed)\b/i.test(text);
};

/**
 * Detect second conditional
 */
const detectSecondConditional = (text: string): boolean => {
  return /\bif .+ (would|wouldn't)\b/i.test(text);
};

/**
 * Detect reported speech
 */
const detectReportedSpeech = (text: string): boolean => {
  return /\b(said|told|asked|explained) that\b/i.test(text);
};

/**
 * Detect mixed conditional
 */
const detectMixedConditional = (text: string): boolean => {
  return /\bif .+ had\b.*\bwould\b/i.test(text) || 
         /\bwould have\b.*\bif\b/i.test(text);
};

/**
 * Detect advanced modals with perfect
 */
const detectAdvancedModalsWithPerfect = (text: string): boolean => {
  return /\b(should|might|could|would|must) have\b/i.test(text);
};

/**
 * Detect inversion
 */
const detectInversion = (text: string): boolean => {
  return /\b(had|were|should) \w+ \b/i.test(text) || 
         /\b(not only|never|rarely|seldom) .+ (do|did|have|has|had)\b/i.test(text);
};

/**
 * Detect fronting
 */
const detectFronting = (text: string): boolean => {
  return /\b(such|so) .+ that\b/i.test(text);
};

/**
 * Detect cleft sentence
 */
const detectCleftSentence = (text: string): boolean => {
  return /\bit (is|was) .+ (that|who|which)\b/i.test(text);
};

/**
 * Detect ellipsis
 */
const detectEllipsis = (text: string): boolean => {
  return /, (if|when) \w+[^.]*/i.test(text);
};

/**
 * Detect idiomatic structures
 */
const detectIdiomaticStructures = (text: string): boolean => {
  return /\b(let alone|as it were|so to speak|as if|as though)\b/i.test(text);
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

/**
 * Detect repetition in content
 * Returns the ratio of repeated phrases to total content
 */
export const detectRepetition = (text: string): number => {
  if (!text || text.length < 10) return 0;
  
  // Get unique words and their count
  const words = text.toLowerCase().split(/\s+/).filter(w => w.trim().length > 0);
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
