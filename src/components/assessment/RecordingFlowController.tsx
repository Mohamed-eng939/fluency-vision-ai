
import React, { useState, useEffect } from 'react';
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
    startRecording,
    stopRecording,
    resetRecording,
    toggleEntryMode,
    setManualTranscript,
    submitRecording,
    formatTime
  } = useRecordingFlow(selectedPrompt);

  const handleSubmit = async () => {
    await submitRecording();
    onComplete(audioBlob!, isManualEntryMode ? manualTranscript : transcript);
  };

  return (
    <RecordingContainer 
      prompt={selectedPrompt} 
      isPronunciationApiAvailable={isPronunciationApiAvailable}
    >
      {isManualEntryMode ? (
        <ManualEntryController
          transcript={manualTranscript}
          onTranscriptChange={setManualTranscript}
          onSubmit={handleSubmit}
          onCancel={onCancel}
          onToggleMode={toggleEntryMode}
          isProcessing={isProcessing}
        />
      ) : (
        <>
          {!isRecording && !audioBlob && (
            <div className="space-y-4">
              <RecordingControls 
                isRecording={false}
                recordingTime={recordingTime}
                onStartRecording={startRecording}
                onStopRecording={stopRecording}
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
              onStartRecording={startRecording}
              onStopRecording={stopRecording}
              formatTime={formatTime}
            />
          )}
          
          <TranscriptPreview transcript={transcript} isRecording={isRecording} />
          
          {audioBlob && (
            <AudioSubmission
              audioBlob={audioBlob}
              transcript={transcript}
              onSubmit={handleSubmit}
              onReset={resetRecording}
            />
          )}
        </>
      )}
    </RecordingContainer>
  );
};

export default RecordingFlowController;
