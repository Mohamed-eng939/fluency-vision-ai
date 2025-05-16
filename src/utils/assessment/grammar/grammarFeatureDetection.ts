
/**
 * Grammar Feature Detection
 * Functions to detect grammatical features in text for CEFR evaluation
 */

/**
 * Detect grammatical features in the transcript
 * This implements an enhanced grammar analysis with CEFR alignment
 */
export const detectGrammaticalFeatures = (transcript: string) => {
  // Implementation analyzes the transcript for grammatical features
  // Enhanced with more CEFR-aligned grammatical features
  
  return {
    // A1 level features
    hasPresentSimple: /\b(I|you|we|they) ([a-z]+)(?!(ed|ing))\b|he|she|it ([a-z]+)s\b/i.test(transcript),
    hasSomeArticles: /\b(a|an|the) \w+\b/i.test(transcript),
    hasBasicConjunctions: /\b(and|but|or)\b/i.test(transcript),
    
    // A2 level features
    hasPastSimple: /\b\w+ed\b|\b(went|saw|had|was|were|did|made|took|came|knew|got)\b/i.test(transcript),
    hasComparatives: /\b(\w+er|more \w+) than\b/i.test(transcript),
    hasAdverbsOfFrequency: /\b(always|usually|often|sometimes|rarely|never)\b/i.test(transcript),
    hasBasicModals: /\b(can|must|should)\b/i.test(transcript),
    
    // B1 level features
    hasPresentPerfect: /\b(have|has) \w+ed\b|\b(have|has) (been|gone|done|seen|had)\b/i.test(transcript),
    hasAdvancedModals: /\b(might|could|would|may)\b/i.test(transcript),
    hasRelativeClauses: /\b(who|which|that|whom|whose)\b/i.test(transcript),
    hasFirstConditional: /\bif .+ (will|won't|going to|won't)\b/i.test(transcript),
    
    // B2 level features
    hasPastPerfect: /\bhad \w+ed\b|\bhad (been|gone|done|seen)\b/i.test(transcript),
    hasPassiveVoice: /\b(is|are|was|were|be|been|being) (\w+ed)\b/i.test(transcript),
    hasSecondConditional: /\bif .+ (would|wouldn't)\b/i.test(transcript),
    hasReportedSpeech: /\b(said|told|asked|explained) that\b/i.test(transcript),
    
    // C1 level features
    hasMixedConditional: /\bif .+ had\b.*\bwould\b/i.test(transcript) || /\bwould have\b.*\bif\b/i.test(transcript),
    hasAdvancedModalsWithPerfect: /\b(should|might|could|would|must) have\b/i.test(transcript),
    hasInversion: /\b(had|were|should) \w+ \b/i.test(transcript) || /\b(not only|never|rarely|seldom) .+ (do|did|have|has|had)\b/i.test(transcript),
    hasFronting: /\b(such|so) .+ that\b/i.test(transcript),
    
    // C2 level features
    hasCleftSentence: /\bit (is|was) .+ (that|who|which)\b/i.test(transcript),
    hasEllipsis: /, (if|when) \w+[^.]*/i.test(transcript),
    hasIdiomaticStructures: /\b(let alone|as it were|so to speak|as if|as though)\b/i.test(transcript),
    hasSubtleModalityShifts: /\b(must|can't|couldn't) be\b/i.test(transcript),
    
    // Error measures
    errorDensity: estimateErrorDensity(transcript),
    avgSentenceLength: estimateAverageSentenceLength(transcript)
  };
};

/**
 * Estimate error density in the text
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
 * Estimate the average sentence length
 */
export const estimateAverageSentenceLength = (text: string): number => {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = text.split(/\s+/).filter(w => w.length > 0);
  
  return sentences.length > 0 ? words.length / sentences.length : 0;
};

/**
 * Count occurrences of patterns in text
 */
export const countPatterns = (text: string, pattern: RegExp): number => {
  const matches = text.match(pattern);
  return matches ? matches.length : 0;
};
