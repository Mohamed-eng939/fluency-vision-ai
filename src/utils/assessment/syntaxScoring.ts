import { SyntaxComplexity } from "../../types/assessment";

// Import from refactored modules
import { calculateBasicSyntaxScore } from "./syntax/basicScoring";
import { calculateSyntaxScoreFromComplexity } from "./syntax/complexityScoring";
import { convertCEFRLevelToScore } from "./syntax/cefrMapping";

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
  
  // If we have CEFR-based analysis available
  if (audioMetrics.cefrSyntaxLevel || audioMetrics.syntaxScore) {
    return audioMetrics.syntaxScore || convertCEFRLevelToScore(audioMetrics.cefrSyntaxLevel);
  }
  
  // Otherwise use a more basic approach
  return calculateBasicSyntaxScore(transcript);
};

// Re-export all syntax functions for backwards compatibility
export * from './syntax/basicScoring';
export * from './syntax/cefrMapping';
export * from './syntax/complexityScoring';
export * from './syntax/patternAnalysis';
export * from './syntax/structureAnalysis';
export * from './syntax/types';
