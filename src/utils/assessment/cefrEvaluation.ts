
/**
 * CEFR Evaluation Service
 * Evaluates grammar and syntax based on CEFR rubric criteria
 */

import { CEFRFeatureLevel, findCEFRLevelForScore } from './rubrics/cefrGrammarSyntaxRubric';

/**
 * Result of a CEFR evaluation
 */
export interface CEFRScoringResult {
  grammar_score: number;
  syntax_score: number;
  grammar_cefr_estimate: CEFRFeatureLevel;
  syntax_cefr_estimate: CEFRFeatureLevel;
  justification?: {
    grammar: string;
    syntax: string;
  };
}

/**
 * Evaluate grammar and syntax against the CEFR rubric
 */
export const evaluateCEFR = (
  transcript: string,
  audioMetrics: any = {}
): CEFRScoringResult => {
  // Get scores from existing modules (modified to now use CEFR guidelines)
  const grammarScore = calculateGrammarScoreUsingCEFR(transcript, audioMetrics);
  const syntaxScore = calculateSyntaxScoreUsingCEFR(transcript, audioMetrics);
  
  // Determine CEFR levels based on scores
  const grammarLevel = findCEFRLevelForScore(grammarScore, 'grammar');
  const syntaxLevel = findCEFRLevelForScore(syntaxScore, 'syntax');
  
  // Build result
  return {
    grammar_score: grammarScore,
    syntax_score: syntaxScore,
    grammar_cefr_estimate: grammarLevel,
    syntax_cefr_estimate: syntaxLevel,
    justification: {
      grammar: buildGrammarJustification(transcript, grammarScore, grammarLevel),
      syntax: buildSyntaxJustification(transcript, syntaxScore, syntaxLevel)
    }
  };
};

/**
 * Calculate grammar score using CEFR guidelines
 */
const calculateGrammarScoreUsingCEFR = (transcript: string, audioMetrics: any): number => {
  // We'll delegate to our existing grammar scoring but adapt to CEFR criteria
  // This allows us to leverage existing analysis while aligning with CEFR standards
  const rawScore = calculateGrammarScoreInternal(transcript, audioMetrics);
  return rawScore;
};

/**
 * Calculate syntax score using CEFR guidelines
 */
const calculateSyntaxScoreUsingCEFR = (transcript: string, audioMetrics: any): number => {
  // Similar to grammar, we'll adapt existing analysis to CEFR guidelines
  const rawScore = calculateSyntaxScoreInternal(transcript, audioMetrics);
  return rawScore;
};

/**
 * Internal function to calculate grammar score
 * This leverages our existing grammar scoring with CEFR alignments
 */
const calculateGrammarScoreInternal = (transcript: string, audioMetrics: any): number => {
  // This is a simplified version - in practice, we would import our complex grammar analysis
  if (!transcript) return 2.0; // Default low score if no transcript
  
  // Extract key features based on CEFR criteria
  const features = detectGrammaticalFeatures(transcript);
  
  // Score based on features detected
  let score = 3.0; // Default starting point (low-mid A2)
  
  // Present perfect usage suggests at least B1
  if (features.hasPresentPerfect) score = Math.max(score, 4.1); 
  
  // Past perfect usage suggests at least B2
  if (features.hasPastPerfect) score = Math.max(score, 5.6);
  
  // Conditionals and modals suggest higher levels
  if (features.hasSecondConditional) score = Math.max(score, 5.6); // B2
  if (features.hasMixedConditional) score = Math.max(score, 7.1); // C1
  
  // Advanced structures suggest C1-C2
  if (features.hasInversion) score = Math.max(score, 7.1); // C1
  if (features.hasCleftSentence) score = Math.max(score, 8.6); // C2
  
  // Adjust based on error density
  if (features.errorDensity > 0.25) score = Math.min(score, 5.5); // Max B1 with high errors
  if (features.errorDensity > 0.4) score = Math.min(score, 4.0);  // Max A2 with very high errors
  
  // Cap scores based on minimum quality requirements
  if (features.avgSentenceLength < 5 && features.errorDensity > 0.25) {
    score = Math.min(score, 5.5); // Apply minimum sentence quality filter
  }
  
  return score;
};

/**
 * Internal function to calculate syntax score
 * This leverages our existing syntax scoring with CEFR alignments
 */
const calculateSyntaxScoreInternal = (transcript: string, audioMetrics: any): number => {
  if (!transcript) return 2.0; // Default low score if no transcript
  
  // Extract key syntactic features based on CEFR criteria
  const features = detectSyntacticFeatures(transcript);
  
  // Score based on features detected
  let score = 3.0; // Default starting point (low-mid A2)
  
  // Subordination indicates at least B1
  if (features.hasSubordination) score = Math.max(score, 4.1); 
  
  // Advanced subordination suggests at least B2
  if (features.hasAdvancedSubordination) score = Math.max(score, 5.6);
  
  // Complex clauses suggest higher levels
  if (features.hasRelativeClauses) score = Math.max(score, 4.1); // B1+
  if (features.hasAdvancedRelativeClauses) score = Math.max(score, 5.6); // B2+
  
  // Very advanced structures suggest C1-C2
  if (features.hasPassiveVoice) score = Math.max(score, 5.6); // B2
  if (features.hasEmbeddedClauses) score = Math.max(score, 7.1); // C1
  if (features.hasInversion) score = Math.max(score, 8.6); // C2
  
  // Apply caps and conditions from our updated logic
  if (!features.hasSubordination && !features.hasCoordination) {
    score = Math.min(score, 5.0); // Cap syntax score if no subordination/coordination
  }
  
  // SVO structure requirement for scores ≥ 6
  if (features.svoRatio < 0.5 && score >= 6) {
    score = 5.9; // Cap just below 6 if SVO requirement not met
  }
  
  // Repeated beginnings penalty
  if (features.repeatedBeginnings > 2) {
    score = Math.max(1, score - 1.0); // Penalize 1.0 point
  }
  
  // Redundancy penalty
  if (features.repetitionRatio > 0.25) {
    score = Math.max(1, score - 1.0); // Reduce by 1.0 for high repetition
  }
  
  // Minimum sentence quality filter
  if (features.avgSentenceLength < 5 && features.errorDensity > 0.25) {
    score = Math.min(score, 5.5); // Cap syntax score at 5.5
  }
  
  return score;
};

/**
 * Detect grammatical features in the transcript
 * This implements the grammar analysis logic from our system
 */
const detectGrammaticalFeatures = (transcript: string) => {
  // Implementation would analyze the transcript for various grammatical features
  // This is simplified - our actual implementation would be more sophisticated
  
  return {
    hasPresentPerfect: /\b(have|has) \w+ed\b/i.test(transcript),
    hasPastPerfect: /\b(had) \w+ed\b/i.test(transcript),
    hasSecondConditional: /\bif .+ would\b/i.test(transcript),
    hasMixedConditional: /\bif .+ had\b.*\bwould\b/i.test(transcript) || /\bwould have\b.*\bif\b/i.test(transcript),
    hasInversion: /\b(had|were|should) \w+ \b/i.test(transcript), // Simplified test
    hasCleftSentence: /\bit (is|was) .+ (that|who|which)\b/i.test(transcript),
    errorDensity: estimateErrorDensity(transcript),
    avgSentenceLength: estimateAverageSentenceLength(transcript)
  };
};

/**
 * Detect syntactic features in the transcript
 * This implements the syntax analysis logic from our system
 */
const detectSyntacticFeatures = (transcript: string) => {
  // Again, simplified implementation
  const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  return {
    hasSubordination: /\b(because|although|though|since|as|while|whereas|unless|if|when|whenever|wherever)\b/i.test(transcript),
    hasAdvancedSubordination: /\b(even though|in order that|provided that|in case|as long as)\b/i.test(transcript),
    hasCoordination: /\b(and|but|or|so|yet|for|nor)\b/i.test(transcript),
    hasRelativeClauses: /\b(who|whom|whose|which|that)\b/i.test(transcript),
    hasAdvancedRelativeClauses: /\b(about which|for whom|the extent to which)\b/i.test(transcript),
    hasPassiveVoice: /\b(is|are|was|were|be|been|being) ([a-z]+ed)\b/i.test(transcript),
    hasEmbeddedClauses: countEmbeddedClausePatterns(transcript) > 0,
    hasInversion: /\b(not only|never|rarely|seldom) .+ (do|did|have|has|had)\b/i.test(transcript),
    svoRatio: estimateSVORatio(sentences),
    repeatedBeginnings: countRepeatedBeginnings(sentences),
    repetitionRatio: estimateRepetitionRatio(transcript),
    avgSentenceLength: sentences.length > 0 ? 
      transcript.split(/\s+/).length / sentences.length : 0,
    errorDensity: estimateErrorDensity(transcript)
  };
};

/**
 * Build justification for grammar scoring
 */
const buildGrammarJustification = (transcript: string, score: number, level: CEFRFeatureLevel): string => {
  // Extract the features we observed
  const features = detectGrammaticalFeatures(transcript);
  
  // Build a list of observed features for the justification
  const observedFeatures: string[] = [];
  if (features.hasPresentPerfect) observedFeatures.push("Present perfect");
  if (features.hasPastPerfect) observedFeatures.push("Past perfect");
  if (features.hasSecondConditional) observedFeatures.push("Second conditional");
  if (features.hasMixedConditional) observedFeatures.push("Mixed conditionals");
  if (features.hasInversion) observedFeatures.push("Inversion");
  if (features.hasCleftSentence) observedFeatures.push("Cleft sentences");
  
  // Add error information
  if (features.errorDensity > 0.25) {
    observedFeatures.push("High error density");
  }
  
  // Build the justification text
  return `CEFR ${level} (${score.toFixed(1)}/10): Grammar reflects ${level} level control. 
Features: ${observedFeatures.join(', ') || "Basic structures only"}. 
${features.errorDensity > 0.25 ? "Errors frequently occur and sometimes interfere with meaning." : 
  features.errorDensity > 0.1 ? "Some errors occur but rarely interfere with meaning." : 
  "Few grammatical errors."}`;
};

/**
 * Build justification for syntax scoring
 */
const buildSyntaxJustification = (transcript: string, score: number, level: CEFRFeatureLevel): string => {
  // Extract the features we observed
  const features = detectSyntacticFeatures(transcript);
  
  // Build a list of observed features for the justification
  const observedFeatures: string[] = [];
  if (features.hasSubordination) observedFeatures.push("Basic subordination");
  if (features.hasAdvancedSubordination) observedFeatures.push("Advanced subordination");
  if (features.hasCoordination) observedFeatures.push("Coordination");
  if (features.hasRelativeClauses) observedFeatures.push("Relative clauses");
  if (features.hasAdvancedRelativeClauses) observedFeatures.push("Advanced relative clauses");
  if (features.hasPassiveVoice) observedFeatures.push("Passive voice");
  if (features.hasEmbeddedClauses) observedFeatures.push("Embedded clauses");
  if (features.hasInversion) observedFeatures.push("Inversion");
  
  // Build the justification text
  return `CEFR ${level} (${score.toFixed(1)}/10): Syntax complexity reflects ${level} level. 
Features: ${observedFeatures.join(', ') || "Simple sentence structures only"}. 
Average sentence length: ${features.avgSentenceLength.toFixed(1)} words.
${features.repeatedBeginnings > 2 ? "Repeated sentence beginnings observed." : "Good variety in sentence structure."}
${features.svoRatio < 0.5 ? "Limited use of complete sentence structures." : "Good use of complete sentence structures."}`;
};

/**
 * Count patterns that indicate embedded clauses
 */
const countEmbeddedClausePatterns = (text: string): number => {
  // Look for patterns like "the fact that", "what she said", etc.
  const patterns = [
    /\b(the fact that)\b/gi,
    /\b(what|whatever|whoever|whenever|wherever|however) .+ (is|was|will|would)\b/gi,
    /\b(that|which|who) .+ (that|which|who)\b/gi  // Nested relative clauses
  ];
  
  return patterns.reduce((count, pattern) => {
    const matches = text.match(pattern) || [];
    return count + matches.length;
  }, 0);
};

/**
 * Estimate the ratio of sentences with proper SVO structure
 */
const estimateSVORatio = (sentences: string[]): number => {
  if (sentences.length === 0) return 0;
  
  let validSVOCount = 0;
  
  sentences.forEach(sentence => {
    // Check if sentence contains a subject-verb pattern
    // This is simplified - a real implementation would use NLP parsing
    if (/^(I|you|he|she|it|we|they|the|a|an|this|that|these|those|my|your|his|her|its|our|their|\w+)\s+\w+s?\b/i.test(sentence.trim())) {
      validSVOCount++;
    }
  });
  
  return validSVOCount / sentences.length;
};

/**
 * Count sentences with repeated beginnings
 */
const countRepeatedBeginnings = (sentences: string[]): number => {
  if (sentences.length < 3) return 0;
  
  // Extract first two words of each sentence
  const beginnings = sentences.map(s => {
    const words = s.trim().split(/\s+/);
    return words.slice(0, Math.min(2, words.length)).join(' ').toLowerCase();
  });
  
  // Count occurrences
  const counts: Record<string, number> = {};
  beginnings.forEach(beginning => {
    counts[beginning] = (counts[beginning] || 0) + 1;
  });
  
  // Return count of beginnings that occur more than twice
  return Object.values(counts).filter(count => count > 2).length;
};

/**
 * Estimate repetition ratio in the text
 */
const estimateRepetitionRatio = (text: string): number => {
  if (!text || text.length < 10) return 0;
  
  // Get unique words and their count
  const words = text.toLowerCase().split(/\s+/);
  const uniqueWords = new Set(words);
  
  // Simple repetition ratio = 1 - (unique words / total words)
  const wordRepetitionRatio = 1 - (uniqueWords.size / words.length);
  
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
  
  // Phrase repetition ratio
  const phraseRepetitionRatio = phrases.length > 0 ? 
    repeatedPhraseCount / phrases.length : 0;
  
  // Combine both metrics, giving more weight to phrase repetition
  return (wordRepetitionRatio * 0.4) + (phraseRepetitionRatio * 0.6);
};

/**
 * Estimate the average sentence length
 */
const estimateAverageSentenceLength = (text: string): number => {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = text.split(/\s+/).filter(w => w.length > 0);
  
  return sentences.length > 0 ? words.length / sentences.length : 0;
};

/**
 * Estimate error density in the text
 */
const estimateErrorDensity = (text: string): number => {
  let errorCount = 0;
  const words = text.split(/\s+/);
  
  // Agreement errors
  errorCount += countPatterns(text, /\b(they|we|you) (is|was)\b|\b(he|she|it) (are|were)\b/gi);
  
  // Article errors
  errorCount += countPatterns(text, /\b(a) ([aeiou]\w+)\b|\b(an) ([^aeiou]\w+)\b/gi);
  
  // Auxiliary errors
  errorCount += countPatterns(text, /\b(didn't|did not) (\w+ed)\b|\b(don't|do not) ([^the\s]\w+s)\b/gi);
  
  // Preposition errors (simplified)
  errorCount += countPatterns(text, /\b(arrive|go) (in|on|with) /gi);
  
  return words.length > 0 ? errorCount / words.length : 0;
};

/**
 * Count occurrences of patterns in text
 */
const countPatterns = (text: string, pattern: RegExp): number => {
  const matches = text.match(pattern);
  return matches ? matches.length : 0;
};
