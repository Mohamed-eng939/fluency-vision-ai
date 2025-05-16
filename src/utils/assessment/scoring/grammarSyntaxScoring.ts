
/**
 * Grammar and Syntax Scoring
 * Functions for calculating grammar and syntax scores based on CEFR levels
 */
import { findCEFRLevelForScore } from '../rubrics/cefrLevelUtils';
import { detectGrammaticalFeatures } from '../grammar/grammarFeatureDetection';
import { detectSyntacticFeatures } from '../syntax/syntaxFeatureDetection';

/**
 * Calculate grammar score using CEFR guidelines
 */
export const calculateGrammarScoreUsingCEFR = (transcript: string, audioMetrics: any): number => {
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
export const calculateSyntaxScoreUsingCEFR = (transcript: string, audioMetrics: any): number => {
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
