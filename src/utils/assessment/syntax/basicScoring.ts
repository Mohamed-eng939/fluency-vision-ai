
import { countPattern, detectCompoundComplexSentences, detectRepetition, detectRepeatedClauseBeginnings } from "./patternAnalysis";
import { analyzeSVOStructure, countGrammaticalIssues } from "./structureAnalysis";

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
