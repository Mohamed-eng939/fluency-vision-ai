
import React from 'react';
import ManualTranscriptEntry from './ManualTranscriptEntry';
import EntryModeToggle from './EntryModeToggle';

interface ManualEntryControllerProps {
  isManualEntryMode: boolean;
  isSpeechRecognitionSupported: boolean;
  onTranscriptSubmit: (transcript: string) => void;
  onAudioSubmit: (audio: Blob) => void;
  onToggleEntryMode: () => void;
}

const ManualEntryController: React.FC<ManualEntryControllerProps> = ({
  isManualEntryMode,
  isSpeechRecognitionSupported,
  onTranscriptSubmit,
  onAudioSubmit,
  onToggleEntryMode
}) => {
  if (!isManualEntryMode) return null;
  
  return (
    <>
      <ManualTranscriptEntry 
        onTranscriptSubmit={onTranscriptSubmit}
        onAudioSubmit={onAudioSubmit}
      />
      
      <EntryModeToggle 
        isManualMode={true}
        isSpeechRecognitionSupported={isSpeechRecognitionSupported}
        onToggle={onToggleEntryMode}
      />
    </>
  );
};

export default ManualEntryController;
