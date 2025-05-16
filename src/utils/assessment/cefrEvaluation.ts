
/**
 * CEFR Evaluation Service
 * Evaluates grammar and syntax based on CEFR rubric criteria
 */

import { CEFRFeatureLevel, findCEFRLevelForScore } from './rubrics/cefrTypes';
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
