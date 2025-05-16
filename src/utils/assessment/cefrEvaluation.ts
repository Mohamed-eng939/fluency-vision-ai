
/**
 * CEFR Evaluation Service
 * Evaluates grammar and syntax based on CEFR rubric criteria
 */

import { CEFRFeatureLevel, findCEFRLevelForScore, getScoreRangeForLevel } from './rubrics/cefrGrammarSyntaxRubric';

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
  if (!transcript) return 1.5; // Default low A1 score if no transcript
  
  // Extract key features based on CEFR criteria
  const features = detectGrammaticalFeatures(transcript);
  
  // Score based on features detected - start with minimum score
  let score = 1.5; // Default starting point (mid A1)
  
  // A1 Level (1.0-2.5): Basic present/past forms, simple phrases
  if (features.hasPresentSimple) score = Math.max(score, 1.5);
  if (features.hasSomeArticles) score = Math.max(score, 2.0);
  if (features.hasBasicConjunctions) score = Math.max(score, 2.2);
  
  // A2 Level (2.6-4.0): Basic tenses, simple coordination
  if (features.hasPastSimple) score = Math.max(score, 2.6);
  if (features.hasComparatives) score = Math.max(score, 3.0);
  if (features.hasAdverbsOfFrequency) score = Math.max(score, 3.2);
  if (features.hasBasicModals) score = Math.max(score, 3.5);
  
  // B1 Level (4.1-5.5): Present perfect, modals, relatives
  if (features.hasPresentPerfect) score = Math.max(score, 4.1);
  if (features.hasAdvancedModals) score = Math.max(score, 4.5);
  if (features.hasRelativeClauses) score = Math.max(score, 4.8);
  if (features.hasFirstConditional) score = Math.max(score, 5.0);
  
  // B2 Level (5.6-7.0): More complex forms
  if (features.hasPastPerfect) score = Math.max(score, 5.6);
  if (features.hasPassiveVoice) score = Math.max(score, 5.9);
  if (features.hasSecondConditional) score = Math.max(score, 6.3);
  if (features.hasReportedSpeech) score = Math.max(score, 6.7);
  
  // C1 Level (7.1-8.5): Advanced structures
  if (features.hasMixedConditional) score = Math.max(score, 7.1);
  if (features.hasAdvancedModalsWithPerfect) score = Math.max(score, 7.5);
  if (features.hasInversion) score = Math.max(score, 7.9);
  if (features.hasFronting) score = Math.max(score, 8.2);
  
  // C2 Level (8.6-10.0): Near-native control
  if (features.hasCleftSentence) score = Math.max(score, 8.6);
  if (features.hasEllipsis) score = Math.max(score, 9.0);
  if (features.hasIdiomaticStructures) score = Math.max(score, 9.3);
  if (features.hasSubtleModalityShifts) score = Math.max(score, 9.7);
  
  // Apply correction factors based on errors
  if (features.errorDensity > 0.4) {
    score = Math.min(score, 4.0);  // Cap at A2 with very high errors
  } else if (features.errorDensity > 0.25) {
    score = Math.min(score, 5.5);  // Cap at B1 with high errors
  } else if (features.errorDensity > 0.15) {
    score = Math.min(score, 7.0);  // Cap at B2 with moderate errors
  } else if (features.errorDensity > 0.08) {
    score = Math.min(score, 8.5);  // Cap at C1 with low errors
  }
  
  // Cap scores based on minimum quality requirements
  if (features.avgSentenceLength < 4) {
    score = Math.min(score, 3.5); // Cap at A2 for very short sentences
  } else if (features.avgSentenceLength < 5 && features.errorDensity > 0.25) {
    score = Math.min(score, 5.5); // Apply minimum sentence quality filter
  }
  
  // CEFR alignment correction
  // If we have assigned a score in a range but essential features of that level are missing
  const level = findCEFRLevelForScore(score, 'grammar');
  if (level === 'B1' && !features.hasPresentPerfect && !features.hasFirstConditional) {
    // Missing key B1 features, cap at A2+
    score = 4.0;
  } else if (level === 'B2' && !features.hasPassiveVoice && !features.hasSecondConditional) {
    // Missing key B2 features, cap at B1+
    score = 5.5;
  } else if (level === 'C1' && !features.hasAdvancedModalsWithPerfect && !features.hasInversion) {
    // Missing key C1 features, cap at B2+
    score = 7.0;
  }
  
  return score;
};

/**
 * Calculate syntax score using CEFR guidelines
 */
const calculateSyntaxScoreUsingCEFR = (transcript: string, audioMetrics: any): number => {
  if (!transcript) return 1.5; // Default low A1 score if no transcript
  
  // Extract key syntactic features based on CEFR criteria
  const features = detectSyntacticFeatures(transcript);
  
  // Score based on features detected - start with minimum score
  let score = 1.5; // Default starting point (mid A1)
  
  // A1 Level (1.0-2.5): Very simple structures
  if (features.hasBasicSVO) score = Math.max(score, 1.8);
  if (features.hasSimplePhrases) score = Math.max(score, 2.0);
  if (features.hasBasicPrepositions) score = Math.max(score, 2.3);
  
  // A2 Level (2.6-4.0): Simple coordination
  if (features.hasSimpleCoordination) score = Math.max(score, 2.6);
  if (features.hasBasicSubordination) score = Math.max(score, 3.2);
  if (features.hasTimeSequencers) score = Math.max(score, 3.7);
  
  // B1 Level (4.1-5.5): Emerging complex sentences
  if (features.hasSubordination) score = Math.max(score, 4.1);
  if (features.hasRelativeClauses) score = Math.max(score, 4.5);
  if (features.hasCompoundComplex) score = Math.max(score, 5.0);
  
  // B2 Level (5.6-7.0): Consistent subordination
  if (features.hasAdvancedSubordination) score = Math.max(score, 5.6);
  if (features.hasPassiveVoice) score = Math.max(score, 6.0);
  if (features.hasAdvancedRelativeClauses) score = Math.max(score, 6.4);
  
  // C1 Level (7.1-8.5): Advanced structures
  if (features.hasEmbeddedClauses) score = Math.max(score, 7.1);
  if (features.hasRhetoricalDevices) score = Math.max(score, 7.5);
  if (features.hasNonFiniteConstructs) score = Math.max(score, 8.0);
  
  // C2 Level (8.6-10.0): Elegant, highly flexible
  if (features.hasInversion) score = Math.max(score, 8.6);
  if (features.hasCleftSentences) score = Math.max(score, 9.0);
  if (features.hasEllipsis) score = Math.max(score, 9.4);
  if (features.hasStyleModulation) score = Math.max(score, 9.7);
  
  // Apply caps based on sentence quality factors
  if (features.avgSentenceLength < 4) {
    score = Math.min(score, 3.5); // Cap at A2 for very short sentences
  }
  
  if (!features.hasSubordination && !features.hasAdvancedCoordination) {
    score = Math.min(score, 4.0); // Cap at A2 if no subordination/advanced coordination
  }
  
  // SVO structure requirement for scores ≥ 6
  if (features.svoRatio < 0.6 && score >= 6.0) {
    score = Math.min(score, 5.9); // Cap below B2 if SVO requirement not adequately met
  }
  
  // Repeated beginnings penalty
  if (features.repeatedBeginnings > 2) {
    score = Math.max(1, score - 0.8); // Penalize for repeated beginnings
  }
  
  // Redundancy/repetition penalty
  if (features.repetitionRatio > 0.25) {
    score = Math.max(1, score - 0.8); // Reduce for high repetition
  }
  
  // Minimum sentence quality filter
  if (features.avgSentenceLength < 5 && features.errorDensity > 0.25) {
    score = Math.min(score, 5.5); // Cap syntax score for error-prone short sentences
  }
  
  // CEFR alignment correction
  // If we've assigned a score in a range but essential features of that level are missing
  const level = findCEFRLevelForScore(score, 'syntax');
  if (level === 'B1' && !features.hasSubordination) {
    // Missing key B1 feature, cap at A2+
    score = 4.0;
  } else if (level === 'B2' && !features.hasAdvancedSubordination) {
    // Missing key B2 feature, cap at B1+
    score = 5.5;
  } else if (level === 'C1' && !features.hasEmbeddedClauses && !features.hasNonFiniteConstructs) {
    // Missing key C1 features, cap at B2+
    score = 7.0;
  }
  
  return score;
};

/**
 * Detect grammatical features in the transcript
 * This implements an enhanced grammar analysis with CEFR alignment
 */
const detectGrammaticalFeatures = (transcript: string) => {
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
 * Detect syntactic features in the transcript
 * This implements an enhanced syntax analysis with CEFR alignment
 */
const detectSyntacticFeatures = (transcript: string) => {
  const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  // Enhanced with more CEFR-aligned syntactic features
  return {
    // A1 level features
    hasBasicSVO: /^(I|you|he|she|it|we|they|the|a|an|this|that|these|those|my|your|his|her|its|our|their|\w+)\s+\w+s?\b/i.test(transcript),
    hasSimplePhrases: transcript.split(/[.!?]+/).some(s => s.split(/\s+/).length <= 5),
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
 * Estimate clause complexity based on subordinator count and sentence length
 */
const estimateClauseComplexity = (transcript: string): number => {
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
 * Build justification for grammar scoring
 */
const buildGrammarJustification = (transcript: string, score: number, level: CEFRFeatureLevel): string => {
  // Extract the features we observed
  const features = detectGrammaticalFeatures(transcript);
  
  // Build a list of observed features for the justification
  const observedFeatures: string[] = [];
  
  // A1-A2 features
  if (features.hasPresentSimple) observedFeatures.push("present simple");
  if (features.hasPastSimple) observedFeatures.push("past simple");
  if (features.hasBasicModals) observedFeatures.push("basic modals");
  
  // B1-B2 features
  if (features.hasPresentPerfect) observedFeatures.push("present perfect");
  if (features.hasAdvancedModals) observedFeatures.push("modal verbs");
  if (features.hasRelativeClauses) observedFeatures.push("relative clauses");
  if (features.hasPassiveVoice) observedFeatures.push("passive voice");
  if (features.hasSecondConditional) observedFeatures.push("conditional forms");
  
  // C1-C2 features
  if (features.hasMixedConditional) observedFeatures.push("mixed conditionals");
  if (features.hasAdvancedModalsWithPerfect) observedFeatures.push("perfect modal forms");
  if (features.hasInversion) observedFeatures.push("inversion");
  if (features.hasCleftSentence) observedFeatures.push("cleft sentences");
  
  // Add error information
  let errorComment = "";
  if (features.errorDensity > 0.25) {
    errorComment = "Errors frequently occur and sometimes interfere with meaning.";
  } else if (features.errorDensity > 0.1) {
    errorComment = "Some errors occur but rarely interfere with meaning.";
  } else {
    errorComment = "Few grammatical errors.";
  }
  
  // Build the justification text
  return `CEFR ${level} (${score.toFixed(1)}/10): Grammar reflects ${level} level control. 
Features: ${observedFeatures.join(', ') || "Basic structures only"}. 
${errorComment}`;
};

/**
 * Build justification for syntax scoring
 */
const buildSyntaxJustification = (transcript: string, score: number, level: CEFRFeatureLevel): string => {
  // Extract the features we observed
  const features = detectSyntacticFeatures(transcript);
  
  // Build a list of observed features for the justification
  const observedFeatures: string[] = [];
  
  // A1-A2 features
  if (features.hasSimpleCoordination) observedFeatures.push("simple coordination");
  if (features.hasBasicSubordination) observedFeatures.push("basic subordination");
  
  // B1-B2 features
  if (features.hasSubordination) observedFeatures.push("subordination");
  if (features.hasRelativeClauses) observedFeatures.push("relative clauses");
  if (features.hasAdvancedSubordination) observedFeatures.push("advanced subordination");
  if (features.hasPassiveVoice) observedFeatures.push("passive constructions");
  
  // C1-C2 features
  if (features.hasEmbeddedClauses) observedFeatures.push("embedded clauses");
  if (features.hasNonFiniteConstructs) observedFeatures.push("non-finite constructions");
  if (features.hasInversion) observedFeatures.push("inversion");
  if (features.hasCleftSentences) observedFeatures.push("cleft sentences");
  
  // Build the justification text
  return `CEFR ${level} (${score.toFixed(1)}/10): Syntax complexity reflects ${level} level. 
Features: ${observedFeatures.join(', ') || "Simple sentence structures only"}. 
Average sentence length: ${features.avgSentenceLength.toFixed(1)} words.
${features.repeatedBeginnings > 2 ? "Repeated sentence beginnings observed." : "Good variety in sentence structure."}
${features.svoRatio < 0.6 ? "Limited use of complete sentence structures." : "Good use of complete sentence structures."}`;
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
  
  // Verb form errors
  errorCount += countPatterns(text, /\b(has|have) [a-z]+ |is [a-z]+ing/gi);
  
  return words.length > 0 ? errorCount / words.length : 0;
};

/**
 * Count occurrences of patterns in text
 */
const countPatterns = (text: string, pattern: RegExp): number => {
  const matches = text.match(pattern);
  return matches ? matches.length : 0;
};
