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
