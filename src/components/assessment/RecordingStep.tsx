
import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Pause, Play, CheckCircle, Clock } from 'lucide-react';
import { SpeakingPrompt, AudioAnalysisResult } from '@/types/assessment';
import RecordingFlowController from './RecordingFlowController';

interface RecordingStepProps {
  prompt: SpeakingPrompt;
  currentIndex: number;
  totalPrompts: number;
  onRecordingComplete: (audioBlob: Blob, transcript?: string, audioAnalysis?: AudioAnalysisResult) => void;
  onPause: () => void;
  onFinishNow: () => void;
  onNext: () => void;
  isProcessing: boolean;
}

const RecordingStep: React.FC<RecordingStepProps> = ({
  prompt,
  currentIndex,
  totalPrompts,
  onRecordingComplete,
  onPause,
  onFinishNow,
  onNext,
  isProcessing
}) => {
  const [hasRecorded, setHasRecorded] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleRecordingComplete = (audioBlob: Blob, transcript?: string, audioAnalysis?: AudioAnalysisResult) => {
    setHasRecorded(true);
    setShowConfirmation(true);
    
    // Hide confirmation after 800ms and proceed to next
    setTimeout(() => {
      setShowConfirmation(false);
      onRecordingComplete(audioBlob, transcript, audioAnalysis);
    }, 800);
  };

  if (showConfirmation) {
    return (
      <Card className="max-w-3xl mx-auto">
        <CardContent className="p-12 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Response Saved!</h3>
          <p className="text-gray-600 flex items-center justify-center gap-2">
            <Clock className="h-4 w-4" />
            Analysis will run when test is complete
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-assessment-blue">Quick Assessment</h2>
          <div className="text-sm font-medium">
            Question {currentIndex + 1} of {totalPrompts}
          </div>
        </div>
        <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
          <div 
            className="bg-assessment-blue h-2 rounded-full transition-all duration-300" 
            style={{ width: `${((currentIndex + 1) / totalPrompts) * 100}%` }}
          ></div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="mt-6">
          <RecordingFlowController
            selectedPrompt={prompt}
            onComplete={handleRecordingComplete}
            onCancel={() => {}}
            isProcessing={isProcessing}
            delayAnalysis={true}
          />
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between border-t pt-4">
        <Button variant="outline" onClick={onPause}>
          <Pause className="mr-2 h-4 w-4" /> Pause Test
        </Button>
        <Button variant="ghost" onClick={onFinishNow}>
          Finish & Process Now
        </Button>
      </CardFooter>
    </Card>
  );
};

export default RecordingStep;
