
import React, { useState } from 'react';
import { useRecordingFlow } from '@/hooks/useRecordingFlow';
import { SpeakingPrompt, AudioAnalysisResult } from '@/types/assessment'; 
import RecordingContainer from './RecordingContainer';
import RecordingControls from './RecordingControls';
import TranscriptPreview from './TranscriptPreview';
import AudioSubmission from './AudioSubmission';
import EntryModeToggle from './EntryModeToggle';
import ManualEntryController from './ManualEntryController';
import { usePronunciationApi } from '@/hooks/usePronunciationApi';

export interface RecordingFlowControllerProps {
  selectedPrompt: SpeakingPrompt;
  onComplete: (audioBlob: Blob, transcript?: string, audioAnalysis?: AudioAnalysisResult) => void;
  onCancel: () => void;
  isProcessing: boolean;
}

const RecordingFlowController: React.FC<RecordingFlowControllerProps> = ({
  selectedPrompt,
  onComplete,
  onCancel,
  isProcessing
}) => {
  const { isPronunciationApiAvailable } = usePronunciationApi();
  
  const {
    isRecording,
    recordingTime,
    audioBlob,
    transcript,
    isManualEntryMode,
    isSpeechRecognitionSupported,
    manualTranscript,
    handleStartRecording,
    handleStopRecording,
    handleReset,
    toggleEntryMode,
    setManualTranscript,
    handleSubmit,
    formatTime
  } = useRecordingFlow((audioBlob: Blob, transcript?: string, audioAnalysis?: AudioAnalysisResult) => {
    if (audioBlob) {
      onComplete(audioBlob, transcript, audioAnalysis);
    }
  });

  return (
    <RecordingContainer 
      prompt={selectedPrompt} 
      isPronunciationApiAvailable={isPronunciationApiAvailable}
    >
      {isManualEntryMode ? (
        <ManualEntryController
          isManualEntryMode={isManualEntryMode}
          isSpeechRecognitionSupported={isSpeechRecognitionSupported}
          onTranscriptSubmit={(manualText) => {
            setManualTranscript(manualText);
            handleSubmit();
          }}
          onAudioSubmit={(audioBlob) => onComplete(audioBlob, manualTranscript)}
          onToggleEntryMode={toggleEntryMode}
        />
      ) : (
        <>
          {!isRecording && !audioBlob && (
            <div className="space-y-4">
              <RecordingControls 
                isRecording={false}
                recordingTime={recordingTime}
                onStartRecording={handleStartRecording}
                onStopRecording={handleStopRecording}
                formatTime={formatTime}
              />
              
              <EntryModeToggle 
                isManualMode={false}
                isSpeechRecognitionSupported={isSpeechRecognitionSupported}
                onToggle={toggleEntryMode}
              />
            </div>
          )}
          
          {isRecording && (
            <RecordingControls 
              isRecording={true}
              recordingTime={recordingTime}
              onStartRecording={handleStartRecording}
              onStopRecording={handleStopRecording}
              formatTime={formatTime}
            />
          )}
          
          <TranscriptPreview transcript={transcript} isRecording={isRecording} />
          
          {audioBlob && (
            <AudioSubmission
              audioBlob={audioBlob}
              transcript={transcript}
              onSubmit={handleSubmit}
              onReset={handleReset}
            />
          )}
        </>
      )}
    </RecordingContainer>
  );
};

export default RecordingFlowController;
