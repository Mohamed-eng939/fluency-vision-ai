import { GrammaticalError } from "../../types/assessment";
import { 
  detectPresentSimple, detectBasicConjunctions, detectPastSimple, 
  detectComparatives, detectAdverbsOfFrequency, detectBasicModals, 
  detectPresentPerfect, detectAdvancedModals, detectRelativeClauses, 
  detectFirstConditional, detectPastPerfect, detectPassiveVoice, 
  detectSecondConditional, detectReportedSpeech, detectMixedConditional,
  detectAdvancedModalsWithPerfect, detectInversion, detectFronting, 
  detectCleftSentence, detectEllipsis, detectIdiomaticStructures
} from './grammar/grammarFeatureDetectors';
import {
  countPattern, countTenseMixing, detectTense, countArticleErrors, 
  detectVerbTenseConflicts, detectAuxiliaryErrors, detectMissingDeterminers
} from './grammar/grammarErrorAnalysis';
import {
  calculateSentenceVariety, detectRepetition
} from './grammar/textStructureAnalysis';

/**
 * Enhanced grammar scoring based on error analysis and sentence structure
 * Now with CEFR-aligned criteria
 */
export const calculateGrammarScore = (
  audioMetrics: any,
  transcript: string
): number => {
  // If we have CEFR-based analysis available
  if (audioMetrics.cefrGrammarLevel || audioMetrics.grammarScore) {
    return audioMetrics.grammarScore || convertCEFRLevelToScore(audioMetrics.cefrGrammarLevel);
  }
  
  // If we have detailed grammatical error analysis
  if (audioMetrics.grammaticalErrors) {
    return calculateGrammarScoreFromErrors(
      audioMetrics.grammaticalErrors,
      transcript
    );
  }
  
  // Otherwise use a more basic approach
  return calculateBasicGrammarScore(transcript);
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
 * Calculate grammar score based on detected errors - now CEFR-aligned
 */
export const calculateGrammarScoreFromErrors = (
  errors: GrammaticalError[],
  transcript: string
): number => {
  if (!transcript) return 1.5;
  
  const words = transcript.split(/\s+/).filter(w => w.trim().length > 0).length;
  
  // Calculate error density (errors per 100 words)
  const errorDensity = (errors.length / words) * 100;
  
  // Score based on error density with CEFR alignment
  if (errorDensity < 1) return 9.0;       // < 1 error per 100 words: C1-C2 range
  if (errorDensity < 2) return 8.0;       // < 2 errors per 100 words: C1 range
  if (errorDensity < 3.5) return 7.0;     // < 3.5 errors per 100 words: B2 range
  if (errorDensity < 5) return 6.0;       // < 5 errors per 100 words: B1+ range
  if (errorDensity < 7.5) return 5.0;     // < 7.5 errors per 100 words: B1 range
  if (errorDensity < 10) return 4.0;      // < 10 errors per 100 words: A2+ range
  if (errorDensity < 15) return 3.5;      // < 15 errors per 100 words: A2 range
  if (errorDensity < 20) return 3.0;      // < 20 errors per 100 words: A1+ range
  if (errorDensity < 25) return 2.0;      // < 25 errors per 100 words: A1 range
  return 1.0;                             // 25+ errors per 100 words: Below A1
};

/**
 * Calculate basic grammar score from transcript text
 * Enhanced with CEFR-aligned features and criteria
 */
export const calculateBasicGrammarScore = (transcript: string): number => {
  if (!transcript) return 1.5; // Default low A1 score if no transcript
  
  // Split into sentences for analysis
  const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 0);
  if (sentences.length === 0) return 1.5;
  
  // Start with lowest CEFR level score
  let score = 1.5; // Default mid-range A1 score
  
  // A1 Level Features (1.0-2.5)
  if (detectPresentSimple(transcript)) score = Math.max(score, 1.5);
  if (detectBasicConjunctions(transcript)) score = Math.max(score, 2.0);
  
  // A2 Level Features (2.6-4.0)
  if (detectPastSimple(transcript)) score = Math.max(score, 2.6);
  if (detectComparatives(transcript)) score = Math.max(score, 3.0);
  if (detectAdverbsOfFrequency(transcript)) score = Math.max(score, 3.2);
  if (detectBasicModals(transcript)) score = Math.max(score, 3.5);
  
  // B1 Level Features (4.1-5.5)
  if (detectPresentPerfect(transcript)) score = Math.max(score, 4.1);
  if (detectAdvancedModals(transcript)) score = Math.max(score, 4.5);
  if (detectRelativeClauses(transcript)) score = Math.max(score, 4.8);
  if (detectFirstConditional(transcript)) score = Math.max(score, 5.0);
  
  // B2 Level Features (5.6-7.0)
  if (detectPastPerfect(transcript)) score = Math.max(score, 5.6);
  if (detectPassiveVoice(transcript)) score = Math.max(score, 6.0);
  if (detectSecondConditional(transcript)) score = Math.max(score, 6.3);
  if (detectReportedSpeech(transcript)) score = Math.max(score, 6.7);
  
  // C1 Level Features (7.1-8.5)
  if (detectMixedConditional(transcript)) score = Math.max(score, 7.1);
  if (detectAdvancedModalsWithPerfect(transcript)) score = Math.max(score, 7.5);
  if (detectInversion(transcript)) score = Math.max(score, 7.9);
  if (detectFronting(transcript)) score = Math.max(score, 8.2);
  
  // C2 Level Features (8.6-10.0)
  if (detectCleftSentence(transcript)) score = Math.max(score, 8.6);
  if (detectEllipsis(transcript)) score = Math.max(score, 9.0);
  if (detectIdiomaticStructures(transcript)) score = Math.max(score, 9.3);
  
  // Apply corrections based on error analysis
  
  // Subject-verb agreement errors
  const svAgreementErrors = countPattern(transcript, /\b(they|we|you) (is|was)\b|\b(he|she|it) (are|were)\b/gi);
  
  // Tense consistency
  const tenseMixing = countTenseMixing(sentences);
  
  // Article usage
  const articleErrors = countArticleErrors(transcript);
  
  // Error density calculation
  const totalErrors = svAgreementErrors + tenseMixing + articleErrors + 
                      detectVerbTenseConflicts(transcript) + 
                      detectAuxiliaryErrors(transcript) + 
                      detectMissingDeterminers(transcript);
                      
  const words = transcript.split(/\s+/).filter(w => w.trim().length > 0);
  const errorDensity = words.length > 0 ? totalErrors / words.length : 0;
  
  // Apply CEFR-aligned caps based on error density
  if (errorDensity > 0.4) {
    score = Math.min(score, 3.0);  // Cap at A1+ with very high errors
  } else if (errorDensity > 0.25) {
    score = Math.min(score, 4.0);  // Cap at A2 with high errors
  } else if (errorDensity > 0.15) {
    score = Math.min(score, 5.5);  // Cap at B1 with moderate errors
  } else if (errorDensity > 0.08) {
    score = Math.min(score, 7.0);  // Cap at B2 with low errors
  }
  
  // Adjust for transcript length - very short responses get penalized
  if (words.length < 25) score = Math.min(score, 4.0); // Cap A2 for very short responses
  if (words.length < 15) score = Math.min(score, 3.0); // Cap A1+ for extremely short responses
  
  // CEFR alignment correction
  // If we have assigned a score in a range but essential features of that level are missing
  if (score >= 4.1 && score <= 5.5 && !detectPresentPerfect(transcript)) {
    // Missing key B1 feature (present perfect), cap at A2+
    score = Math.min(score, 4.0);
  } else if (score >= 5.6 && score <= 7.0 && !detectPastPerfect(transcript) && !detectPassiveVoice(transcript)) {
    // Missing key B2 features, cap at B1+
    score = Math.min(score, 5.5);
  } else if (score >= 7.1 && score <= 8.5 && !detectMixedConditional(transcript) && !detectAdvancedModalsWithPerfect(transcript)) {
    // Missing key C1 features, cap at B2+
    score = Math.min(score, 7.0);
  }
  
  // Ensure score is between 1-10
  return Math.max(1, Math.min(10, score));
};

// Re-export utility functions for other modules to use
export {
  countPattern,
  countTenseMixing,
  detectTense,
  countArticleErrors,
  calculateSentenceVariety
};
