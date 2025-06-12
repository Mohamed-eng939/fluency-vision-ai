
import { useState, useEffect } from 'react';

export const useManualEntryState = (isSpeechRecognitionSupported: boolean) => {
  const [isManualEntryMode, setIsManualEntryMode] = useState<boolean>(false);
  const [manualTranscript, setManualTranscript] = useState<string>('');

  // Check browser compatibility on mount
  useEffect(() => {
    if (!isSpeechRecognitionSupported) {
      setIsManualEntryMode(true);
    }
  }, [isSpeechRecognitionSupported]);

  const toggleEntryMode = () => {
    setIsManualEntryMode(!isManualEntryMode);
    setManualTranscript('');
  };

  const resetManualEntry = () => {
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
