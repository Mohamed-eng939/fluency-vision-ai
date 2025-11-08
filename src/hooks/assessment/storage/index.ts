
export { useResponseStorage } from './useResponseStorage';
export { useResponseBatchProcessor } from './useResponseBatchProcessor';
export { calculateAggregatedResult, aggregateAudioAnalysis, determineCEFRFromScore } from './responseAggregation';
export { generateSmartFeedback } from './feedbackGeneration';
export { validateStoredResponse, createStoredResponse } from './responseBatchUtils';
export type { StoredResponse, ProcessingProgress } from './types';

// Re-export vocabulary aggregation utilities
export { 
  aggregateVocabularyScores, 
  createVocabularyDetail,
  getDifficultyWeight,
  mapVocabularyScoreToCEFR
} from '@/utils/assessment/vocabulary/vocabularyAggregation';
export type { 
  QuestionVocabularyDetail, 
  AggregatedVocabularyResult 
} from '@/utils/assessment/vocabulary/vocabularyAggregation';
