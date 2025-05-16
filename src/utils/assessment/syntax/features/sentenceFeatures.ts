
/**
 * Sentence Feature Detection
 * Functions for detecting sentence-level syntactic features
 */

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
