
/**
 * CEFR Scoring Adapter
 * This adapter integrates the CEFR evaluation with our existing assessment system
 */

import { evaluateCEFR, CEFRScoringResult } from './cefrEvaluation';
import { AudioAnalysisResult } from '../../types/assessment';

/**
 * Enhanced scoring result with CEFR evaluation
 */
export interface EnhancedScoringResult {
  grammarScore: number;
  syntaxScore: number;
  grammarCEFRLevel: string;
  syntaxCEFRLevel: string;
  grammar_justification?: string;
  syntax_justification?: string;
}

/**
 * Evaluate grammar and syntax using the CEFR rubric
 * Adapted to work with our existing audio analysis pipeline
 */
export const evaluateGrammarAndSyntax = (
  transcript: string,
  audioAnalysis?: AudioAnalysisResult
): EnhancedScoringResult => {
  // Use the CEFR evaluation service
  const cefrResult: CEFRScoringResult = evaluateCEFR(transcript, audioAnalysis);
  
  // Return in the format expected by our existing system
  return {
    grammarScore: cefrResult.grammar_score,
    syntaxScore: cefrResult.syntax_score,
    grammarCEFRLevel: cefrResult.grammar_cefr_estimate,
    syntaxCEFRLevel: cefrResult.syntax_cefr_estimate,
    grammar_justification: cefrResult.justification?.grammar,
    syntax_justification: cefrResult.justification?.syntax
  };
};

/**
 * Integrate CEFR evaluation with existing audio analysis
 * Enhances the audio analysis with CEFR-based grammar and syntax scores
 */
export const enhanceAudioAnalysisWithCEFR = (
  audioAnalysis: AudioAnalysisResult,
  transcript: string
): AudioAnalysisResult => {
  // Get CEFR evaluation
  const cefrResult = evaluateGrammarAndSyntax(transcript, audioAnalysis);
  
  // Enhance the audio analysis with CEFR evaluation
  return {
    ...audioAnalysis,
    grammarScore: cefrResult.grammarScore,
    syntaxScore: cefrResult.syntaxScore,
    cefrGrammarLevel: cefrResult.grammarCEFRLevel,
    cefrSyntaxLevel: cefrResult.syntaxCEFRLevel,
    grammarJustification: cefrResult.grammar_justification,
    syntaxJustification: cefrResult.syntax_justification
  };
};
