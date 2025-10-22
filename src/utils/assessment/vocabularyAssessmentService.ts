
/**
 * Vocabulary Assessment Service
 * Orchestrates different methods of vocabulary assessment
 */

import { analyzeCefrVocabulary, VocabularyAnalysisResult } from './vocabulary/cefrVocabularyAnalyzer';
import { 
  createVocabularyEvaluationPrompt, 
  processGptVocabularyEvaluation, 
  GPTVocabularyEvaluation 
} from './vocabulary/gptVocabularyEvaluation';

/**
 * Assessment method type
 */
export type VocabularyAssessmentMethod = 'local' | 'gpt' | 'hybrid';

/**
 * Options for vocabulary assessment
 */
export interface VocabularyAssessmentOptions {
  method?: VocabularyAssessmentMethod;
  gptEvaluator?: (prompt: string) => Promise<any>;
}

/**
 * Assess vocabulary using the specified method
 */
export const assessVocabulary = async (
  transcript: string, 
  options: VocabularyAssessmentOptions = {}
): Promise<VocabularyAnalysisResult> => {
  const method = options.method || 'local';
  
  // If no transcript or it's very short, use local method only
  if (!transcript || transcript.length < 20) {
    return analyzeCefrVocabulary(transcript);
  }
  
  switch (method) {
    case 'gpt':
      // Use GPT-based evaluation if a GPT evaluator function is provided
      if (options.gptEvaluator) {
        try {
          const prompt = createVocabularyEvaluationPrompt(transcript);
          const response = await options.gptEvaluator(prompt);
          const evaluation = processGptVocabularyEvaluation(response);
          
          if (evaluation) {
            // Convert GPT evaluation to our analysis result format
            return {
              vocabularyScore: evaluation.vocabularyScore,
              cefrVocabularyLevel: evaluation.cefrVocabularyLevel,
              vocabularyJustification: evaluation.vocabularyJustification,
              wordDistribution: { 'A1': 0, 'A2': 0, 'B1': 0, 'B2': 0, 'C1': 0, 'C2': 0 },
              lexicalDiversity: 0,
              uniqueWordCount: 0,
              totalWordCount: transcript.split(/\s+/).filter(w => w.length > 0).length,
              recognizedWordCount: 0,
              unrecognizedWordCount: 0
            };
          }
        } catch (error) {
          console.error('Error in GPT vocabulary assessment:', error);
        }
      }
      
      // Fall back to local method if GPT evaluation fails or is not available
      return analyzeCefrVocabulary(transcript);
      
    case 'hybrid':
      // Use both methods and combine results
      const localAnalysis = analyzeCefrVocabulary(transcript);
      
      if (options.gptEvaluator) {
        try {
          const prompt = createVocabularyEvaluationPrompt(transcript);
          const response = await options.gptEvaluator(prompt);
          const gptEvaluation = processGptVocabularyEvaluation(response);
          
          if (gptEvaluation) {
            // Average the scores from both methods
            return {
              ...localAnalysis,
              vocabularyScore: (localAnalysis.vocabularyScore + gptEvaluation.vocabularyScore) / 2,
              vocabularyJustification: gptEvaluation.vocabularyJustification,
              cefrVocabularyLevel: gptEvaluation.cefrVocabularyLevel
            };
          }
        } catch (error) {
          console.error('Error in hybrid vocabulary assessment:', error);
        }
      }
      
      return localAnalysis;
      
    case 'local':
    default:
      // Use local rule-based analysis
      return analyzeCefrVocabulary(transcript);
  }
};
