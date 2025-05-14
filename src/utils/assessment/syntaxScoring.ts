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
  
  // Penalize for very short responses
  if (sentences.length < 3) score -= 1;
  
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
