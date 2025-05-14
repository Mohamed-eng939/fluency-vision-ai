
import React from 'react';

interface EntryModeToggleProps {
  isManualMode: boolean;
  isSpeechRecognitionSupported: boolean;
  onToggle: () => void;
}

const EntryModeToggle: React.FC<EntryModeToggleProps> = ({ 
  isManualMode, 
  isSpeechRecognitionSupported, 
  onToggle 
}) => {
  // Don't show toggle option when speech recognition is not supported
  if (isManualMode && !isSpeechRecognitionSupported) return null;
  
  return (
    <div className="mt-4 text-center">
      <button 
        onClick={onToggle}
        className="text-sm text-gray-500 underline hover:text-assessment-blue"
      >
        Switch to {isManualMode ? 'recording mode' : 'manual entry'}
      </button>
    </div>
  );
};

export default EntryModeToggle;
