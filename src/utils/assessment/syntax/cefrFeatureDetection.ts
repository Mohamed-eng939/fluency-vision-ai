
/**
 * CEFR-aligned Syntactic Feature Detection
 * Functions for detecting syntactic features aligned with CEFR levels
 */

import { countEmbeddedClausePatterns } from './features/complexStructures';
import { 
  estimateSVORatio, 
  countRepeatedBeginnings, 
  detectCompoundComplexSentences,
  estimateClauseComplexity
} from './features/sentenceFeatures';
import { estimateRepetitionRatio, estimateErrorDensity } from './features/qualityMetrics';

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
