
import React from 'react';
import RecordingControls from './RecordingControls';
import TranscriptPreview from './TranscriptPreview';
import AudioSubmission from './AudioSubmission';
import EntryModeToggle from './EntryModeToggle';

interface RecordingFlowControllerProps {
  isManualEntryMode: boolean;
  isRecording: boolean;
  recordingTime: number;
  audioBlob: Blob | null;
  transcript: string;
  isSpeechRecognitionSupported: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onSubmit: () => void;
  onReset: () => void;
  onToggleEntryMode: () => void;
  formatTime: (seconds: number) => string;
}

const RecordingFlowController: React.FC<RecordingFlowControllerProps> = ({
  isManualEntryMode,
  isRecording,
  recordingTime,
  audioBlob,
  transcript,
  isSpeechRecognitionSupported,
  onStartRecording,
  onStopRecording,
  onSubmit,
  onReset,
  onToggleEntryMode,
  formatTime
}) => {
  if (isManualEntryMode) return null;
  
  return (
    <>
      {!isRecording && !audioBlob && (
        <div className="space-y-4">
          <RecordingControls 
            isRecording={false}
            recordingTime={recordingTime}
            onStartRecording={onStartRecording}
            onStopRecording={onStopRecording}
            formatTime={formatTime}
          />
          
          <EntryModeToggle 
            isManualMode={false}
            isSpeechRecognitionSupported={isSpeechRecognitionSupported}
            onToggle={onToggleEntryMode}
          />
        </div>
      )}
      
      {isRecording && (
        <RecordingControls 
          isRecording={true}
          recordingTime={recordingTime}
          onStartRecording={onStartRecording}
          onStopRecording={onStopRecording}
          formatTime={formatTime}
        />
      )}
      
      <TranscriptPreview transcript={transcript} isRecording={isRecording} />
      
      {audioBlob && (
        <AudioSubmission
          audioBlob={audioBlob}
          transcript={transcript}
          onSubmit={onSubmit}
          onReset={onReset}
        />
      )}
    </>
  );
};

export default RecordingFlowController;
