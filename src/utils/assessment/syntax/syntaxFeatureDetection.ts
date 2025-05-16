
/**
 * Syntax Feature Detection
 * Functions to detect syntactic features in text for CEFR evaluation
 */

/**
 * Detect syntactic features in the transcript
 * This implements an enhanced syntax analysis with CEFR alignment
 */
export const detectSyntacticFeatures = (transcript: string) => {
  const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  // Enhanced with more CEFR-aligned syntactic features
  return {
    // A1 level features
    hasBasicSVO: /^(I|you|he|she|it|we|they|the|a|an|this|that|these|those|my|your|his|her|its|our|their|\w+)\s+\w+s?\b/i.test(transcript),
    hasSimplePhrases: sentences.some(s => s.split(/\s+/).length <= 5),
    hasBasicPrepositions: /\b(in|on|at|to|from|with|for|of|about)\b/i.test(transcript),
    
    // A2 level features
    hasSimpleCoordination: /\b(and|but|or)\b/i.test(transcript),
    hasBasicSubordination: /\b(because|so|when)\b/i.test(transcript),
    hasTimeSequencers: /\b(first|then|next|after that|finally)\b/i.test(transcript),
    
    // B1 level features
    hasSubordination: /\b(because|although|though|since|as|while|whereas|unless|if|when|whenever|wherever)\b/i.test(transcript),
    hasRelativeClauses: /\b(who|whom|whose|which|that)\b/i.test(transcript),
    hasCompoundComplex: detectCompoundComplexSentences(transcript),
    
    // B2 level features
    hasAdvancedSubordination: /\b(even though|in order that|provided that|in case|as long as)\b/i.test(transcript),
    hasPassiveVoice: /\b(is|are|was|were|be|been|being) ([a-z]+ed)\b/i.test(transcript),
    hasAdvancedRelativeClauses: /\b(about which|for whom|the extent to which)\b/i.test(transcript),
    hasAdvancedCoordination: /\b(not only|either|neither|nor)\b/i.test(transcript),
    
    // C1 level features
    hasEmbeddedClauses: countEmbeddedClausePatterns(transcript) > 0,
    hasRhetoricalDevices: /\b(while|whereas|although|despite|in spite of|nevertheless|nonetheless|however)\b/i.test(transcript),
    hasNonFiniteConstructs: /\b(to \w+|having \w+ed|being \w+ed)\b/i.test(transcript),
    
    // C2 level features
    hasInversion: /\b(not only|never|rarely|seldom) .+ (do|did|have|has|had)\b/i.test(transcript) || /\b(had|were|should) \w+ \b/i.test(transcript),
    hasCleftSentences: /\bit (is|was) .+ (that|who|which)\b/i.test(transcript),
    hasEllipsis: /, (if|when) \w+[^.]*/i.test(transcript),
    hasStyleModulation: /\b(indeed|undoubtedly|certainly|presumably|allegedly)\b/i.test(transcript),
    
    // Quality measures
    svoRatio: estimateSVORatio(sentences),
    repeatedBeginnings: countRepeatedBeginnings(sentences),
    repetitionRatio: estimateRepetitionRatio(transcript),
    avgSentenceLength: sentences.length > 0 ? 
      transcript.split(/\s+/).length / sentences.length : 0,
    errorDensity: estimateErrorDensity(transcript),
    clauseComplexity: estimateClauseComplexity(transcript)
  };
};

/**
 * Detect compound-complex sentences
 */
export const detectCompoundComplexSentences = (transcript: string): boolean => {
  const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  // Look for sentences with both coordination and subordination
  return sentences.some(sentence => {
    const hasCoordination = /\b(and|but|or)\b/i.test(sentence);
    const hasSubordination = /\b(because|although|though|since|as|while|whereas|unless|if|when|whenever|wherever)\b/i.test(sentence);
    return hasCoordination && hasSubordination;
  });
};

/**
 * Count patterns that indicate embedded clauses
 */
export const countEmbeddedClausePatterns = (text: string): number => {
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
 * Estimate clause complexity based on subordinator count and sentence length
 */
export const estimateClauseComplexity = (transcript: string): number => {
  const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 0);
  if (sentences.length === 0) return 0;
  
  let totalComplexity = 0;
  
  sentences.forEach(sentence => {
    // Count subordinators and conjunctions
    const subordinators = (sentence.match(/\b(because|although|though|since|as|while|whereas|unless|if|when|whenever|wherever|who|which|that|whom|whose)\b/gi) || []).length;
    const conjunctions = (sentence.match(/\b(and|but|or|so|yet|for|nor)\b/gi) || []).length;
    
    // Estimate clauses (rough approximation)
    const estimatedClauses = 1 + subordinators + conjunctions;
    const words = sentence.split(/\s+/).length;
    
    // Calculate complexity as ratio of clauses to sentence length
    const sentenceComplexity = words > 0 ? estimatedClauses / words : 0;
    totalComplexity += sentenceComplexity;
  });
  
  return totalComplexity / sentences.length;
};

/**
 * Estimate the ratio of sentences with proper SVO structure
 */
export const estimateSVORatio = (sentences: string[]): number => {
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
export const countRepeatedBeginnings = (sentences: string[]): number => {
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
export const estimateRepetitionRatio = (text: string): number => {
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
 * Estimate error density in the text
 * Used for syntax quality measures
 */
export const estimateErrorDensity = (text: string): number => {
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
  
  // Verb form errors
  errorCount += countPatterns(text, /\b(has|have) [a-z]+ |is [a-z]+ing/gi);
  
  return words.length > 0 ? errorCount / words.length : 0;
};

/**
 * Count occurrences of patterns in text
 */
export const countPatterns = (text: string, pattern: RegExp): number => {
  const matches = text.match(pattern);
  return matches ? matches.length : 0;
};
