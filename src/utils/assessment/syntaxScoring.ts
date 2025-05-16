
import { SyntaxComplexity } from "../../types/assessment";

/**
 * Calculate syntax complexity score
 */
export const calculateSyntaxScore = (
  audioMetrics: any,
  transcript: string
): number => {
  // If we have detailed syntax analysis
  if (audioMetrics.syntaxComplexity) {
    return calculateSyntaxScoreFromComplexity(audioMetrics.syntaxComplexity);
  }
  
  // Otherwise use a more basic approach
  return calculateBasicSyntaxScore(transcript);
};

/**
 * Calculate syntax score from complexity metrics
 */
export const calculateSyntaxScoreFromComplexity = (
  complexity: SyntaxComplexity
): number => {
  // Base score from structural variety (already on 1-10 scale)
  let score = complexity.structuralVariety;
  
  // Adjust for sentence length (optimal is 15-20 words for formal English)
  const avgLength = complexity.averageSentenceLength;
  if (avgLength < 5) {
    score -= 2; // Too simple
  } else if (avgLength < 10) {
    score -= 1; // Simple
  } else if (avgLength > 25) {
    score -= 1; // Too complex
  } else if (avgLength > 35) {
    score -= 2; // Excessively complex
  }
  
  // Adjust for subordination (optimal is 1-1.5)
  if (complexity.subordinationIndex > 2) {
    score -= 1; // Too many dependent clauses
  }
  
  // NEW: Cap score at 5.0 if no subordination or coordination
  if (complexity.subordinationIndex < 0.1 && complexity.complexSentenceRatio < 0.1) {
    score = Math.min(score, 5.0);
  }
  
  // NEW: SVO structure requirement for scores ≥ 6
  if (!detectSVOStructure(complexity) && score >= 6) {
    score = 5.9; // Cap just below 6 if SVO structure isn't met
  }
  
  // Ensure score is between 1-10
  return Math.max(1, Math.min(10, score));
};

/**
 * Calculate basic syntax score from transcript
 */
export const calculateBasicSyntaxScore = (transcript: string): number => {
  if (!transcript) return 5;
  
  // Split into sentences
  const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 0);
  if (sentences.length === 0) return 5;
  
  // Calculate average sentence length (in words)
  const words = transcript.split(/\s+/);
  const avgSentenceLength = words.length / sentences.length;
  
  // Base score on sentence length
  let score = 5;
  
  if (avgSentenceLength < 5) score = 3; // Very simple syntax
  else if (avgSentenceLength < 8) score = 4; // Simple syntax
  else if (avgSentenceLength < 12) score = 5; // Basic syntax
  else if (avgSentenceLength < 16) score = 6; // Moderate syntax
  else if (avgSentenceLength < 20) score = 7; // Good syntax
  else if (avgSentenceLength < 25) score = 8; // Advanced syntax
  else score = 6; // Too long sentences (can be harder to understand)
  
  // Look for complex structures
  const hasSubordination = countPattern(transcript, /\b(because|although|though|since|as|while|whereas|unless|if|when|whenever|wherever)\b/gi);
  const hasRelativeClauses = countPattern(transcript, /\b(who|whom|whose|which|that)\b/gi);
  const hasPassiveVoice = countPattern(transcript, /\b(is|are|was|were|be|been|being) ([a-z]+ed)\b/gi);
  
  // Add points for complex structures
  if (hasSubordination > 0) score += 1;
  if (hasRelativeClauses > 0) score += 1;
  if (hasPassiveVoice > 0) score += 1;
  
  // NEW: Check for subordination or coordination presence
  const hasCoordination = countPattern(transcript, /\b(and|but|or|so|yet|for|nor)\b/gi);
  
  // NEW: Cap score at 5.0 if no subordination or coordination
  if (hasSubordination === 0 && hasCoordination === 0) {
    score = Math.min(score, 5.0);
  }
  
  // NEW: Check for SVO structure in clauses
  const svoRatio = analyzeSVOStructure(sentences);
  
  // NEW: SVO structure requirement for scores ≥ 6
  if (svoRatio < 0.5 && score >= 6) {
    score = 5.9; // Cap just below 6
  }
  
  // NEW: Check for repeated clause beginnings
  const repeatedBeginnings = detectRepeatedClauseBeginnings(sentences);
  if (repeatedBeginnings > 2) {
    score = Math.max(1, score - 1.0); // Penalize 1.0 point
  }
  
  // NEW: Redundancy penalty
  const repetitionRatio = detectRepetition(transcript);
  if (repetitionRatio > 0.25) {
    score = Math.max(1, score - 1.0); // Reduce by 1.0 if 25%+ content is repeated
  }
  
  // Penalize for very short responses
  if (sentences.length < 3) score -= 1;
  
  // NEW: Minimum Sentence Quality Filter
  if (avgSentenceLength < 5) {
    // Calculate error density (simple proxy estimation)
    const errorCount = countGrammaticalIssues(transcript);
    const wordCount = words.length;
    const errorDensity = wordCount > 0 ? errorCount / wordCount : 0;
    
    if (errorDensity > 0.25) {
      score = Math.min(score, 5.5); // Cap syntax score at 5.5
    }
  }
  
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
 * NEW: Detect if SVO structure is present in appropriate ratio from complexity metrics
 */
export const detectSVOStructure = (complexity: SyntaxComplexity): boolean => {
  // We don't have direct access to SVO analysis in the complexity object
  // So we'll use sentence length and complexity as a proxy
  return complexity.averageSentenceLength >= 5 && 
         complexity.complexSentenceRatio >= 0.4;
};

/**
 * NEW: Analyze SVO (Subject-Verb-Object) structure in sentences
 * Returns the ratio of sentences with valid SVO structure
 */
export const analyzeSVOStructure = (sentences: string[]): number => {
  if (sentences.length === 0) return 0;
  
  let validSVOCount = 0;
  
  sentences.forEach(sentence => {
    // Simple SVO detection - check for subject-verb pattern
    // This is a simplified approach - a real implementation would use NLP parsing
    
    // Check if sentence starts with a pronoun or noun followed by a verb
    if (/^(I|you|he|she|it|we|they|the|a|an|this|that|these|those|my|your|his|her|its|our|their|\w+)\s+\w+s?\b/i.test(sentence)) {
      validSVOCount++;
    }
  });
  
  return validSVOCount / sentences.length;
};

/**
 * NEW: Detect repeated clause beginnings
 * Returns the count of repeated beginnings above threshold
 */
export const detectRepeatedClauseBeginnings = (sentences: string[]): number => {
  if (sentences.length < 3) return 0;
  
  // Extract first two words of each sentence/clause
  const beginnings = sentences.map(s => {
    const words = s.trim().split(/\s+/);
    return words.slice(0, 2).join(' ').toLowerCase();
  });
  
  // Count occurrences of each beginning
  const beginningCounts: Record<string, number> = {};
  beginnings.forEach(beginning => {
    beginningCounts[beginning] = (beginningCounts[beginning] || 0) + 1;
  });
  
  // Count how many beginnings occur more than twice
  return Object.values(beginningCounts).filter(count => count > 2).length;
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

/**
 * NEW: Basic count of potential grammatical issues
 * This is a simplified approach for the error density estimation
 */
export const countGrammaticalIssues = (text: string): number => {
  let issueCount = 0;
  
  // Agreement errors
  issueCount += countPattern(text, /\b(they|we|you) (is|was)\b|\b(he|she|it) (are|were)\b/gi);
  
  // Article errors
  issueCount += countPattern(text, /\b(a) ([aeiou]\w+)\b|\b(an) ([^aeiou]\w+)\b/gi);
  
  // Auxiliary errors
  issueCount += countPattern(text, /\b(didn't|did not) (\w+ed)\b|\b(don't|do not) ([^the\s]\w+s)\b/gi);
  
  // Preposition errors (simplified)
  issueCount += countPattern(text, /\b(arrive|go) (in|on|with) /gi);
  
  return issueCount;
};
