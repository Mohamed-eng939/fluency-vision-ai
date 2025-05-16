
/**
 * CEFR Scoring Adapter
 * This adapter integrates the CEFR evaluation with our existing assessment system
 */

import { evaluateCEFR, CEFRScoringResult } from './cefrEvaluation';
import { AudioAnalysisResult } from '../../types/assessment';
import { CEFRFeatureLevel } from './rubrics/cefrTypes';

/**
 * Enhanced scoring result with CEFR evaluation
 */
export interface EnhancedScoringResult {
  grammarScore: number;
  syntaxScore: number;
  grammarCEFRLevel: string;
  syntaxCEFRLevel: string;
  promptCEFRLevel?: string;
  levelDiscrepancy?: number;
  needsReview?: boolean;
  adjustedGrammarScore?: number;
  adjustedSyntaxScore?: number;
  grammar_justification?: string;
  syntax_justification?: string;
  adjustment_justification?: string;
}

/**
 * Evaluate grammar and syntax using the CEFR rubric
 * Adapted to work with our existing audio analysis pipeline
 */
export const evaluateGrammarAndSyntax = (
  transcript: string,
  audioAnalysis?: AudioAnalysisResult,
  promptCEFRLevel?: CEFRFeatureLevel
): EnhancedScoringResult => {
  // Use the CEFR evaluation service
  const cefrResult: CEFRScoringResult = evaluateCEFR(transcript, audioAnalysis, promptCEFRLevel);
  
  // Return in the format expected by our existing system
  return {
    grammarScore: cefrResult.grammar_score,
    syntaxScore: cefrResult.syntax_score,
    grammarCEFRLevel: cefrResult.grammar_cefr_estimate,
    syntaxCEFRLevel: cefrResult.syntax_cefr_estimate,
    promptCEFRLevel: cefrResult.prompt_cefr_level,
    levelDiscrepancy: cefrResult.level_discrepancy,
    needsReview: cefrResult.needs_review,
    adjustedGrammarScore: cefrResult.adjusted_grammar_score,
    adjustedSyntaxScore: cefrResult.adjusted_syntax_score,
    grammar_justification: cefrResult.justification?.grammar,
    syntax_justification: cefrResult.justification?.syntax,
    adjustment_justification: cefrResult.justification?.adjustment
  };
};

/**
 * Integrate CEFR evaluation with existing audio analysis
 * Enhances the audio analysis with CEFR-based grammar and syntax scores
 */
export const enhanceAudioAnalysisWithCEFR = (
  audioAnalysis: AudioAnalysisResult,
  transcript: string,
  promptCEFRLevel?: CEFRFeatureLevel
): AudioAnalysisResult => {
  // Get CEFR evaluation
  const cefrResult = evaluateGrammarAndSyntax(transcript, audioAnalysis, promptCEFRLevel);
  
  // Enhance the audio analysis with CEFR evaluation
  return {
    ...audioAnalysis,
    grammarScore: cefrResult.adjustedGrammarScore || cefrResult.grammarScore,
    syntaxScore: cefrResult.adjustedSyntaxScore || cefrResult.syntaxScore,
    cefrGrammarLevel: cefrResult.grammarCEFRLevel,
    cefrSyntaxLevel: cefrResult.syntaxCEFRLevel,
    grammarJustification: cefrResult.grammar_justification,
    syntaxJustification: cefrResult.syntax_justification,
    adjustmentJustification: cefrResult.adjustment_justification,
    promptCEFRLevel: cefrResult.promptCEFRLevel,
    levelDiscrepancy: cefrResult.levelDiscrepancy,
    needsReview: cefrResult.needsReview
  };
};

/**
 * Determine the CEFR level of a prompt based on text analysis
 * This is a simplified implementation - in a real system this would use
 * more sophisticated NLP analysis or pre-assigned levels
 */
export const determineCEFRLevelOfPrompt = (promptText: string): CEFRFeatureLevel => {
  // Simplified logic - analyze prompt complexity to estimate CEFR level
  const words = promptText.split(/\s+/).filter(w => w.trim().length > 0);
  const avgWordLength = words.join('').length / words.length;
  
  // Count complex structures as a proxy for difficulty
  const complexWords = words.filter(w => w.length > 8).length / words.length;
  const complexStructures = (
    promptText.match(/\b(although|however|nevertheless|therefore|consequently|furthermore|moreover|whereas)\b/gi)?.length || 0
  ) / words.length * 100;
  
  // Simplistic mapping based on length and complexity
  if (words.length < 8) return 'A1';
  if (words.length < 15 && avgWordLength < 4.5) return 'A2';
  if (words.length < 25 && complexWords < 0.1) return 'B1';
  if (complexWords < 0.15 && complexStructures < 2) return 'B2';
  if (complexWords < 0.2) return 'C1';
  return 'C2';
};
