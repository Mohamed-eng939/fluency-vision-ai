
import React from 'react';

interface RecordingStatusProps {
  isProcessing: boolean;
}

const RecordingStatus: React.FC<RecordingStatusProps> = ({ isProcessing }) => {
  if (!isProcessing) return null;
  
  return (
    <div className="mt-4 text-center">
      <div className="animate-pulse text-assessment-blue">
        <p>Analyzing audio features...</p>
      </div>
    </div>
  );
};

export default RecordingStatus;
