
/**
 * GPT-based CEFR vocabulary evaluation
 * A utility for using the GPT prompt-based vocabulary evaluation logic
 */

/**
 * Interface matching the expected GPT response format
 */
export interface GPTVocabularyEvaluation {
  vocabularyScore: number;
  cefrVocabularyLevel: string;
  vocabularyJustification: string;
}

/**
 * Create a prompt for the GPT CEFR vocabulary evaluator
 */
export const createVocabularyEvaluationPrompt = (transcript: string): string => {
  return `You are a CEFR vocabulary evaluator trained in lexical profiling.

Task:
Analyze a learner's spoken transcript and evaluate the vocabulary used according to CEFR levels. Focus on the range, appropriateness, and level alignment of individual words (lemmas).

Reference Examples:
A1: go, school, like, eat, book, cat, run  
A2: usually, write, travel, simple, always, help  
B1: explain, prefer, describe, suggestion, communicate  
B2: development, contrast, advantage, despite, however  
C1: consequently, assumption, sophisticated, criticise, nevertheless  
C2: simultaneously, philosophical, disproportionate, hypothesis, albeit

Instructions:
1. Tokenize the transcript and lemmatize words.
2. Estimate which CEFR level the vocabulary most closely aligns with.
3. Consider:
   - Variety of words used
   - CEFR difficulty of words
   - Overuse of simple vocabulary
4. Return the estimated CEFR vocabulary level and a score from 1.0 to 10.0

Output Format:
Respond in JSON only, like this:
{
  "vocabularyScore": 5.0,
  "cefrVocabularyLevel": "B1",
  "vocabularyJustification": "The learner used a mix of A2 and B1 words with moderate variety and one B2 transitional marker."
}

Transcript: "${transcript.replace(/\"/g, '\\"')}"`;
};

/**
 * Process a GPT evaluation response
 */
export const processGptVocabularyEvaluation = (response: any): GPTVocabularyEvaluation | null => {
  try {
    if (response && typeof response === 'object') {
      return {
        vocabularyScore: response.vocabularyScore ?? null,
        cefrVocabularyLevel: response.cefrVocabularyLevel ?? null,
        vocabularyJustification: response.vocabularyJustification ?? ''
      };
    }
    return null;
  } catch (error) {
    console.error('Error processing GPT vocabulary evaluation:', error);
    return null;
  }
};

/**
 * Apply the GPT evaluation to the audio analysis result
 */
export const applyGptVocabularyEvaluation = (audioAnalysisResult: any, evaluation: GPTVocabularyEvaluation): void => {
  if (!audioAnalysisResult) return;
  
  audioAnalysisResult.vocabularyScore = evaluation.vocabularyScore ?? audioAnalysisResult.vocabularyScore;
  audioAnalysisResult.cefrVocabularyLevel = evaluation.cefrVocabularyLevel ?? audioAnalysisResult.cefrVocabularyLevel;
  audioAnalysisResult.vocabularyJustification = evaluation.vocabularyJustification ?? audioAnalysisResult.vocabularyJustification;
};
