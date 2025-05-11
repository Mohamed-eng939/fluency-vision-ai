
import React from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Square } from 'lucide-react';

interface RecordingControlsProps {
  isRecording: boolean;
  recordingTime: number;
  onStartRecording: () => void;
  onStopRecording: () => void;
  formatTime: (seconds: number) => string;
}

const RecordingControls: React.FC<RecordingControlsProps> = ({
  isRecording,
  recordingTime,
  onStartRecording,
  onStopRecording,
  formatTime
}) => {
  return (
    <div className="space-y-4">
      {!isRecording ? (
        <Button 
          className="bg-assessment-teal hover:bg-assessment-lightBlue text-white"
          onClick={onStartRecording}
        >
          <Mic className="h-4 w-4 mr-2" />
          Start Recording
        </Button>
      ) : (
        <div className="flex items-center gap-4">
          <Button 
            variant="destructive" 
            onClick={onStopRecording}
          >
            <Square className="h-4 w-4 mr-2" />
            Stop Recording
          </Button>
          <div className="animate-pulse text-red-500 flex items-center">
            <MicOff className="h-4 w-4 mr-2" />
            Recording: {formatTime(recordingTime)}
          </div>
        </div>
      )}
    </div>
  );
};

export default RecordingControls;
