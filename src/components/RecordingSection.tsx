
import React, { useState } from 'react';
import { SpeakingPrompt } from '@/types/assessment';
import { AudioAnalysisResult } from '@/utils/audioAnalysisUtils';
import { useRecordingFlow } from '@/hooks/useRecordingFlow';

// Import components
import RecordingContainer from './assessment/RecordingContainer';
import RecordingFlowController from './assessment/RecordingFlowController';
import ManualEntryController from './assessment/ManualEntryController';
import RecordingStatus from './assessment/RecordingStatus';
import MicTest from './assessment/MicTest';

interface RecordingSectionProps {
  prompt: SpeakingPrompt | null;
  onRecordingComplete: (audioBlob: Blob, transcript?: string, audioAnalysis?: AudioAnalysisResult) => void;
}

const RecordingSection: React.FC<RecordingSectionProps> = ({ prompt, onRecordingComplete }) => {
  // Whether the user needs to complete the mic test
  const [showMicTest, setShowMicTest] = useState(true);
  // Reference voice data for speaker verification
  const [referenceVoice, setReferenceVoice] = useState<{
    audioBlob: Blob;
    transcript: string;
    analysis: AudioAnalysisResult | null;
  } | null>(null);
  
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
  
  const handleMicTestComplete = (audioBlob: Blob, transcript: string, analysis: AudioAnalysisResult | null) => {
    // Store reference voice data for future speaker verification
    setReferenceVoice({
      audioBlob,
      transcript,
      analysis
    });
    
    // Hide mic test and show main recording interface
    setShowMicTest(false);
  };
  
  const skipMicTest = () => {
    setShowMicTest(false);
  };
  
  return (
    <RecordingContainer 
      prompt={prompt}
      isPronunciationApiAvailable={isPronunciationApiAvailable}
    >
      {showMicTest ? (
        <MicTest 
          onComplete={handleMicTestComplete}
          onSkip={skipMicTest}
        />
      ) : (
        <>
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
        </>
      )}
    </RecordingContainer>
  );
};

export default RecordingSection;
