
import { useState } from 'react';

export const useManualEntryState = (isSpeechRecognitionSupported: boolean) => {
  // Always start with recording mode (false = recording, true = manual)
  const [isManualEntryMode, setIsManualEntryMode] = useState(false);
  const [manualTranscript, setManualTranscript] = useState('');

  const toggleEntryMode = () => {
    setIsManualEntryMode(!isManualEntryMode);
    // Clear manual transcript when switching modes
    if (isManualEntryMode) {
      setManualTranscript('');
    }
  };

  const resetManualEntry = () => {
    setIsManualEntryMode(false); // Reset to recording mode
    setManualTranscript('');
  };

  return {
    isManualEntryMode,
    manualTranscript,
    setManualTranscript,
    toggleEntryMode,
    resetManualEntry
  };
};
