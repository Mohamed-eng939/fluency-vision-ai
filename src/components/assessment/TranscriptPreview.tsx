
import React from 'react';

interface TranscriptPreviewProps {
  transcript: string;
  isRecording: boolean;
}

const TranscriptPreview: React.FC<TranscriptPreviewProps> = ({ transcript, isRecording }) => {
  if (!transcript || !isRecording) return null;
  
  return (
    <div className="bg-gray-50 p-3 rounded-md text-sm italic mt-4">
      <div className="font-medium text-gray-700 mb-1">Transcript (real-time):</div>
      {transcript}
    </div>
  );
};

export default TranscriptPreview;
