
import React from 'react';
import { CheckCircle, AlertTriangle, Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';

interface SpeakerConsistencyProps {
  micTestCompleted: boolean;
  confidenceScore: number;
  mismatchDetected: boolean;
}

const SpeakerConsistency: React.FC<SpeakerConsistencyProps> = ({
  micTestCompleted,
  confidenceScore,
  mismatchDetected
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <div className={`p-2 rounded-full ${micTestCompleted ? 'bg-green-100' : 'bg-amber-100'}`}>
          {micTestCompleted ? (
            <CheckCircle className="h-5 w-5 text-green-600" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-amber-600" />
          )}
        </div>
        <div className="ml-3">
          <p className="font-medium">
            {micTestCompleted
              ? 'Microphone Test Completed Successfully'
              : 'Microphone Test Not Completed'}
          </p>
          <p className="text-sm text-gray-600">
            {micTestCompleted
              ? 'Voice sample recorded for reference'
              : 'No reference voice sample available'}
          </p>
        </div>
      </div>

      {micTestCompleted && (
        <>
          <div className="border rounded-lg p-4 bg-gray-50">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center">
                <span className="font-medium">Voice Match Confidence</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 ml-1 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-sm">
                        Confidence score measuring how closely the voice in this assessment matches
                        the reference voice from the mic test.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <span className="font-bold">{confidenceScore}%</span>
            </div>
            <Progress value={confidenceScore} className="h-2" />
          </div>

          <div className="flex items-center">
            <div className={`p-2 rounded-full ${mismatchDetected ? 'bg-red-100' : 'bg-green-100'}`}>
              {mismatchDetected ? (
                <AlertTriangle className="h-5 w-5 text-red-600" />
              ) : (
                <CheckCircle className="h-5 w-5 text-green-600" />
              )}
            </div>
            <div className="ml-3">
              <p className="font-medium">
                {mismatchDetected
                  ? 'Speaker Mismatch Detected'
                  : 'No Speaker Mismatch Detected'}
              </p>
              <p className="text-sm text-gray-600">
                {mismatchDetected
                  ? 'The voice in this assessment may not match the reference voice.'
                  : 'The voice in this assessment matches the reference voice.'}
              </p>
            </div>
          </div>
        </>
      )}

      <div className="text-sm text-gray-600 mt-2">
        <p>
          <strong>Note:</strong> Speaker verification helps ensure test validity. The system
          compares the voice patterns during the assessment with the microphone test recording.
        </p>
      </div>
    </div>
  );
};

export default SpeakerConsistency;
