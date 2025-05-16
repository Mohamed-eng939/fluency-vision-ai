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
  
  // If we have CEFR-based analysis available
  if (audioMetrics.cefrSyntaxLevel || audioMetrics.syntaxScore) {
    return audioMetrics.syntaxScore || convertCEFRLevelToScore(audioMetrics.cefrSyntaxLevel);
  }
  
  // Otherwise use a more basic approach
  return calculateBasicSyntaxScore(transcript);
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
  
  // CEFR-Aligned: Cap score based on subordination/coordination presence
  if (complexity.subordinationIndex < 0.1 && complexity.complexSentenceRatio < 0.1) {
    score = Math.min(score, 4.0); // Cap at A2 if no subordination or coordination
  }
  
  // CEFR-Aligned: SVO structure requirement for scores ≥ 5.6 (B2)
  if (!detectSVOStructure(complexity) && score >= 5.6) {
    score = 5.5; // Cap at B1 if SVO structure isn't met
  }
  
  // Ensure score is between 1-10
  return Math.max(1, Math.min(10, score));
};

/**
 * Calculate basic syntax score from transcript
 * Enhanced with CEFR alignment
 */
export const calculateBasicSyntaxScore = (transcript: string): number => {
  if (!transcript) return 1.5; // Default low A1 score if no transcript
  
  // Split into sentences
  const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 0);
  if (sentences.length === 0) return 1.5;
  
  // Calculate average sentence length (in words)
  const words = transcript.split(/\s+/).filter(w => w.trim().length > 0);
  const avgSentenceLength = words.length / sentences.length;
  
  // Base score on CEFR-aligned features
  let score = 1.5; // Start at low A1
  
  // A1 Level (1.0-2.5): Very basic sentence structure
  if (avgSentenceLength >= 3) score = Math.max(score, 1.5);
  if (countPattern(transcript, /\b(and|but|or)\b/gi) > 0) score = Math.max(score, 2.0);
  
  // A2 Level (2.6-4.0): Simple coordination, basic subordination
  if (countPattern(transcript, /\b(and|but|or)\b/gi) > 1) score = Math.max(score, 2.6);
  if (countPattern(transcript, /\b(because|when|if)\b/gi) > 0) score = Math.max(score, 3.0);
  if (avgSentenceLength >= 5) score = Math.max(score, 3.2);
  
  // B1 Level (4.1-5.5): Emerging complex sentences
  if (countPattern(transcript, /\b(because|although|though|since|while|when|if|unless)\b/gi) > 1) score = Math.max(score, 4.1);
  if (countPattern(transcript, /\b(who|which|that|whom|whose)\b/gi) > 0) score = Math.max(score, 4.5);
  if (detectCompoundComplexSentences(transcript)) score = Math.max(score, 5.0);
  
  // B2 Level (5.6-7.0): Consistent subordination, relative clauses
  if (countPattern(transcript, /\b(even though|in order to|provided that|as long as)\b/gi) > 0) score = Math.max(score, 5.6);
  if (countPattern(transcript, /\b(is|are|was|were|be|been|being) ([a-z]+ed)\b/gi) > 0) score = Math.max(score, 6.0);
  if (countPattern(transcript, /\b(about which|for whom|the extent to which)\b/gi) > 0) score = Math.max(score, 6.5);
  
  // C1 Level (7.1-8.5): Advanced structures
  const embeddedClauses = countPattern(transcript, /\b(the fact that)\b|\b(what|whatever) .+ (is|was)\b/gi);
  if (embeddedClauses > 0) score = Math.max(score, 7.1);
  if (countPattern(transcript, /\b(to \w+|having \w+ed|being \w+ed)\b/gi) > 0) score = Math.max(score, 7.5);
  
  // C2 Level (8.6-10.0): Elegant, highly flexible
  if (countPattern(transcript, /\b(not only|never|rarely|seldom) .+ (do|did|have|has|had)\b|\b(had|were|should) \w+ \b/gi) > 0) score = Math.max(score, 8.6);
  if (countPattern(transcript, /\bit (is|was) .+ (that|who|which)\b/gi) > 0) score = Math.max(score, 9.0);
  
  // Apply CEFR-aligned caps and adjustments
  
  // Cap for insufficient coordination or subordination (CEFR A2 requirement)
  const hasCoordination = countPattern(transcript, /\b(and|but|or|so|yet|for|nor)\b/gi) > 0;
  const hasSubordination = countPattern(transcript, /\b(because|although|though|since|as|while|whereas|unless|if|when|whenever|wherever|who|which|that)\b/gi) > 0;
  
  if (!hasSubordination && !hasCoordination) {
    score = Math.min(score, 2.5); // Cap at A1 if no coordination/subordination
  } else if (!hasSubordination) {
    score = Math.min(score, 4.0); // Cap at A2 if no subordination
  }
  
  // SVO structure analysis (required for B1+ levels)
  const svoRatio = analyzeSVOStructure(sentences);
  if (svoRatio < 0.6 && score > 5.5) {
    score = 5.5; // Cap at B1 if SVO structure requirement not adequately met
  }
  
  // Repeated beginnings penalty
  const repeatedBeginnings = detectRepeatedClauseBeginnings(sentences);
  if (repeatedBeginnings > 2) {
    score = Math.max(1, score - 0.8); // Penalize for repeated beginnings
  }
  
  // Redundancy/repetition penalty
  const repetitionRatio = detectRepetition(transcript);
  if (repetitionRatio > 0.25) {
    score = Math.max(1, score - 0.8); // Reduce by 0.8 if 25%+ content is repeated
  }
  
  // Minimum sentence quality filter
  const errorCount = countGrammaticalIssues(transcript);
  const errorDensity = words.length > 0 ? errorCount / words.length : 0;
  
  if (avgSentenceLength < 5 && errorDensity > 0.25) {
    score = Math.min(score, 3.5); // Cap syntax score for error-prone short sentences
  }
  
  // Ensure score is between 1-10
  return Math.max(1, Math.min(10, score));
};

/**
 * Detect compound-complex sentences
 */
const detectCompoundComplexSentences = (transcript: string): boolean => {
  const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  // Look for sentences with both coordination and subordination
  return sentences.some(sentence => {
    const hasCoordination = /\b(and|but|or)\b/i.test(sentence);
    const hasSubordination = /\b(because|although|though|since|as|while|whereas|unless|if|when|whenever|wherever)\b/i.test(sentence);
    return hasCoordination && hasSubordination;
  });
};

/**
 * Count instances of a pattern in text
 */
export const countPattern = (text: string, pattern: RegExp): number => {
  const matches = text.match(pattern);
  return matches ? matches.length : 0;
};

/**
 * Detect if SVO structure is present in appropriate ratio from complexity metrics
 */
export const detectSVOStructure = (complexity: SyntaxComplexity): boolean => {
  // We don't have direct access to SVO analysis in the complexity object
  // So we'll use sentence length and complexity as a proxy
  return complexity.averageSentenceLength >= 5 && 
         complexity.complexSentenceRatio >= 0.4;
};

/**
 * Analyze SVO (Subject-Verb-Object) structure in sentences
 * Returns the ratio of sentences with valid SVO structure
 */
export const analyzeSVOStructure = (sentences: string[]): number => {
  if (sentences.length === 0) return 0;
  
  let validSVOCount = 0;
  
  sentences.forEach(sentence => {
    // Simple SVO detection - check for subject-verb pattern
    // This is simplified - a real implementation would use NLP parsing
    
    // Check if sentence starts with a pronoun or noun followed by a verb
    if (/^(I|you|he|she|it|we|they|the|a|an|this|that|these|those|my|your|his|her|its|our|their|\w+)\s+\w+s?\b/i.test(sentence.trim())) {
      validSVOCount++;
    }
  });
  
  return validSVOCount / sentences.length;
};

/**
 * Detect repeated clause beginnings
 * Returns the count of repeated beginnings above threshold
 */
export const detectRepeatedClauseBeginnings = (sentences: string[]): number => {
  if (sentences.length < 3) return 0;
  
  // Extract first two words of each sentence/clause
  const beginnings = sentences.map(s => {
    const words = s.trim().split(/\s+/);
    return words.slice(0, Math.min(2, words.length)).join(' ').toLowerCase();
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

/**
 * Basic count of potential grammatical issues
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
  
  // Verb form errors
  issueCount += countPattern(text, /\b(has|have) [a-z]+ |is [a-z]+ing/gi);
  
  return issueCount;
};
