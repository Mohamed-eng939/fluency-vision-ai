
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
  const audioUrl = React.useMemo(() => {
    try {
      return URL.createObjectURL(audioBlob);
    } catch {
      return '';
    }
  }, [audioBlob]);

  React.useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

    return (
      <div className="space-y-4">
        <div>
          <audio key={audioUrl} controls className="w-full" preload="auto" playsInline>
            <source src={audioUrl} type={audioBlob?.type || 'audio/wav'} />
            Your browser does not support the audio element.
          </audio>
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
