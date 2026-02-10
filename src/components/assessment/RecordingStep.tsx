
import React from 'react';
import { SpeakingPrompt, AudioAnalysisResult } from '@/types/assessment';
import TimedRecordingStep from './TimedRecordingStep';

interface RecordingStepProps {
  prompt: SpeakingPrompt;
  currentIndex: number;
  totalPrompts: number;
  onRecordingComplete: (audioBlob: Blob, transcript?: string, audioAnalysis?: AudioAnalysisResult) => void;
  onPause: () => void;
  onFinishNow: () => void;
  onNext: () => void;
  isProcessing: boolean;
}

const RecordingStep: React.FC<RecordingStepProps> = (props) => {
  return <TimedRecordingStep {...props} />;
};

export default RecordingStep;
