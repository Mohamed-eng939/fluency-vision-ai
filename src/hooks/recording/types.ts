
import { AudioAnalysisResult } from '@/utils/audioAnalysisUtils';

export interface RecordingFlowState {
  isSpeechRecognitionSupported: boolean;
  isManualEntryMode: boolean;
  manualTranscript: string;
  isQuickSubmitting: boolean;
}

export interface RecordingFlowCallbacks {
  onRecordingComplete: (audioBlob: Blob, transcript?: string, audioAnalysis?: AudioAnalysisResult) => void;
  delayAnalysis: boolean;
}

export interface AudioValidationResult {
  isValid: boolean;
  errorMessage?: string;
  errorTitle?: string;
}
