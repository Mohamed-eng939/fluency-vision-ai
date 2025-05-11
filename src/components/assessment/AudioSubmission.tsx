
import React from 'react';
import { Button } from '@/components/ui/button';

interface AudioSubmissionProps {
  audioBlob: Blob;
  transcript: string;
  onSubmit: () => void;
  onReset: () => void;
}

const AudioSubmission: React.FC<AudioSubmissionProps> = ({
  audioBlob,
  transcript,
  onSubmit,
  onReset
}) => {
  return (
    <div className="space-y-4">
      <div>
        <audio controls src={URL.createObjectURL(audioBlob)} className="w-full"></audio>
      </div>
      
      {transcript && (
        <div className="bg-gray-50 p-3 rounded-md text-sm">
          <div className="font-medium text-gray-700 mb-1">Transcript:</div>
          {transcript}
        </div>
      )}
      
      <div className="flex items-center gap-4">
        <Button 
          className="bg-assessment-teal hover:bg-assessment-lightBlue text-white"
          onClick={onSubmit}
        >
          Submit Recording
        </Button>
        <Button 
          variant="outline"
          onClick={onReset}
        >
          Record Again
        </Button>
      </div>
    </div>
  );
};

export default AudioSubmission;
