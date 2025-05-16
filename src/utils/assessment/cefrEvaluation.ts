
/**
 * CEFR Evaluation Service
 * Evaluates grammar and syntax based on CEFR rubric criteria
 */

import { CEFRFeatureLevel } from './rubrics/cefrTypes';
import { findCEFRLevelForScore } from './rubrics/cefrLevelUtils';
import { calculateGrammarScoreUsingCEFR, calculateSyntaxScoreUsingCEFR } from './scoring/grammarSyntaxScoring';
import { buildGrammarJustification, buildSyntaxJustification } from './justification/scoringJustification';

/**
 * Result of a CEFR evaluation
 */
export interface CEFRScoringResult {
  grammar_score: number;
  syntax_score: number;
  grammar_cefr_estimate: CEFRFeatureLevel;
  syntax_cefr_estimate: CEFRFeatureLevel;
  adjusted_grammar_score?: number;
  adjusted_syntax_score?: number;
  prompt_cefr_level?: CEFRFeatureLevel;
  level_discrepancy?: number;
  needs_review?: boolean;
  justification?: {
    grammar: string;
    syntax: string;
    adjustment?: string;
  };
}

/**
 * Converts CEFR level to a numeric value for comparison
 */
export const cefrLevelToNumeric = (level: CEFRFeatureLevel): number => {
  const levelMap: Record<CEFRFeatureLevel, number> = {
    'A1': 1,
    'A2': 2,
    'B1': 3,
    'B2': 4,
    'C1': 5,
    'C2': 6
  };
  return levelMap[level] || 1;
};

/**
 * Calculate the discrepancy between prompt level and response level
 */
export const calculateLevelDiscrepancy = (
  promptLevel: CEFRFeatureLevel,
  responseLevel: CEFRFeatureLevel
): number => {
  return cefrLevelToNumeric(responseLevel) - cefrLevelToNumeric(promptLevel);
};

/**
 * Adjust score based on the level discrepancy
 * If response is more than one level higher than prompt, adjust the score
 */
export const adjustScoreForDiscrepancy = (
  score: number,
  discrepancy: number
): number => {
  if (discrepancy > 1) {
    // For each level above +1, reduce the score by a small factor
    // This is to ensure that the score still reflects higher performance
    // but is adjusted to account for the potential overperformance
    const adjustmentFactor = 0.85; // Reduce by 15%
    return score * adjustmentFactor;
  }
  return score; // No adjustment needed
};

/**
 * Create justification for any score adjustments
 */
export const createAdjustmentJustification = (
  promptLevel: CEFRFeatureLevel,
  responseLevel: CEFRFeatureLevel,
  discrepancy: number
): string => {
  if (discrepancy > 1) {
    return `Response demonstrates ${responseLevel} level features, which is ${discrepancy} levels higher than the ${promptLevel} level prompt. Score has been adjusted to account for this discrepancy. This may indicate that the learner is performing significantly above the expected level for this prompt.`;
  }
  return '';
};

/**
 * Evaluate grammar and syntax against the CEFR rubric
 * Now with prompt-response level comparison
 */
export const evaluateCEFR = (
  transcript: string,
  audioMetrics: any = {},
  promptCEFRLevel?: CEFRFeatureLevel
): CEFRScoringResult => {
  // Get scores from existing modules (modified to now use CEFR guidelines)
  const grammarScore = calculateGrammarScoreUsingCEFR(transcript, audioMetrics);
  const syntaxScore = calculateSyntaxScoreUsingCEFR(transcript, audioMetrics);
  
  // Determine CEFR levels based on scores
  const grammarLevel = findCEFRLevelForScore(grammarScore, 'grammar');
  const syntaxLevel = findCEFRLevelForScore(syntaxScore, 'syntax');
  
  // Prepare result object
  const result: CEFRScoringResult = {
    grammar_score: grammarScore,
    syntax_score: syntaxScore,
    grammar_cefr_estimate: grammarLevel,
    syntax_cefr_estimate: syntaxLevel,
    justification: {
      grammar: buildGrammarJustification(transcript, grammarScore, grammarLevel),
      syntax: buildSyntaxJustification(transcript, syntaxScore, syntaxLevel)
    }
  };
  
  // If prompt CEFR level is provided, compare and adjust if necessary
  if (promptCEFRLevel) {
    // Store the prompt level
    result.prompt_cefr_level = promptCEFRLevel;
    
    // Calculate discrepancies for grammar and syntax
    const grammarDiscrepancy = calculateLevelDiscrepancy(promptCEFRLevel, grammarLevel);
    const syntaxDiscrepancy = calculateLevelDiscrepancy(promptCEFRLevel, syntaxLevel);
    
    // Use the larger discrepancy for the overall adjustment
    const overallDiscrepancy = Math.max(grammarDiscrepancy, syntaxDiscrepancy);
    result.level_discrepancy = overallDiscrepancy;
    
    // Flag for review if discrepancy is significant
    if (overallDiscrepancy > 1) {
      result.needs_review = true;
      
      // Adjust scores
      result.adjusted_grammar_score = adjustScoreForDiscrepancy(grammarScore, grammarDiscrepancy);
      result.adjusted_syntax_score = adjustScoreForDiscrepancy(syntaxScore, syntaxDiscrepancy);
      
      // Add adjustment justification
      result.justification!.adjustment = createAdjustmentJustification(
        promptCEFRLevel, 
        overallDiscrepancy === grammarDiscrepancy ? grammarLevel : syntaxLevel,
        overallDiscrepancy
      );
    }
  }
  
  return result;
};
