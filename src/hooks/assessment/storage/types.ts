
import { SpeakingPrompt, AssessmentResult, AudioAnalysisResult } from '@/types/assessment';

export interface StoredResponse {
  prompt: SpeakingPrompt;
  audioBlob: Blob;
  transcript?: string;
  audioAnalysis?: AudioAnalysisResult;
  timestamp: number;
  questionIndex: number;
}

export interface ProcessingProgress {
  current: number;
  total: number;
}
