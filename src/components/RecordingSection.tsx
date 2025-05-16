
import React from 'react';
import { SpeakingPrompt } from '@/types/assessment';
import { AudioAnalysisResult } from '@/utils/audioAnalysisUtils';
import { useRecordingFlow } from '@/hooks/useRecordingFlow';

// Import components
import RecordingContainer from './assessment/RecordingContainer';
import RecordingFlowController from './assessment/RecordingFlowController';
import ManualEntryController from './assessment/ManualEntryController';
import RecordingStatus from './assessment/RecordingStatus';

interface RecordingSectionProps {
  prompt: SpeakingPrompt | null;
  onRecordingComplete: (audioBlob: Blob, transcript?: string, audioAnalysis?: AudioAnalysisResult) => void;
}

const RecordingSection: React.FC<RecordingSectionProps> = ({ prompt, onRecordingComplete }) => {
  const {
    // State
    isRecording,
    recordingTime,
    audioBlob,
    isProcessing,
    transcript,
    isManualEntryMode,
    isSpeechRecognitionSupported,
    isPronunciationApiAvailable,
    
    // Actions
    handleStartRecording,
    handleStopRecording,
    handleSubmit,
    handleReset,
    handleManualTranscriptSubmit,
    handleManualAudioSubmit,
    toggleEntryMode,
    formatTime
  } = useRecordingFlow(onRecordingComplete);
  
  if (!prompt) return null;
  
  return (
    <RecordingContainer 
      prompt={prompt}
      isPronunciationApiAvailable={isPronunciationApiAvailable}
    >
      <RecordingFlowController
        isManualEntryMode={isManualEntryMode}
        isRecording={isRecording}
        recordingTime={recordingTime}
        audioBlob={audioBlob}
        transcript={transcript}
        isSpeechRecognitionSupported={isSpeechRecognitionSupported}
        onStartRecording={handleStartRecording}
        onStopRecording={handleStopRecording}
        onSubmit={handleSubmit}
        onReset={handleReset}
        onToggleEntryMode={toggleEntryMode}
        formatTime={formatTime}
      />
      
      <ManualEntryController
        isManualEntryMode={isManualEntryMode}
        isSpeechRecognitionSupported={isSpeechRecognitionSupported}
        onTranscriptSubmit={handleManualTranscriptSubmit}
        onAudioSubmit={handleManualAudioSubmit}
        onToggleEntryMode={toggleEntryMode}
      />
      
      <RecordingStatus isProcessing={isProcessing} />
    </RecordingContainer>
  );
};

export default RecordingSection;
