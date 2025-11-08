
import { SpeakingPrompt, AssessmentResult, AudioAnalysisResult } from '@/types/assessment';
import { QuestionVocabularyDetail } from '@/utils/assessment/vocabulary/vocabularyAggregation';

export interface StoredResponse {
  prompt: SpeakingPrompt;
  audioBlob: Blob;
  transcript?: string;
  audioAnalysis?: AudioAnalysisResult;
  timestamp: number;
  questionIndex: number;
  vocabularyDetail?: QuestionVocabularyDetail; // Per-question vocabulary analysis
}

export interface ProcessingProgress {
  current: number;
  total: number;
}
