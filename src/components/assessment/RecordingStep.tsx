
import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Pause, Play } from 'lucide-react';
import { SpeakingPrompt, AudioAnalysisResult } from '@/types/assessment';
import RecordingFlowController from './RecordingFlowController';
import PromptHeader from './PromptHeader';

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

  const handleRecordingComplete = (audioBlob: Blob, transcript?: string, audioAnalysis?: AudioAnalysisResult) => {
    setHasRecorded(true);
    onRecordingComplete(audioBlob, transcript, audioAnalysis);
  };

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
            className="bg-assessment-blue h-2 rounded-full" 
            style={{ width: `${((currentIndex + 1) / totalPrompts) * 100}%` }}
          ></div>
        </div>
      </CardHeader>
      
      <CardContent>
        <PromptHeader
          prompt={prompt}
          level={prompt.cefrLevel}
          category={prompt.category}
        />
        
        <div className="mt-6">
          <RecordingFlowController
            selectedPrompt={prompt}
            onComplete={handleRecordingComplete}
            onCancel={() => {}}
            isProcessing={isProcessing}
          />
        </div>
        
        {hasRecorded && (
          <div className="mt-6 flex justify-end">
            <Button onClick={onNext} className="ml-2">
              Next Question <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between border-t pt-4">
        <Button variant="outline" onClick={onPause}>
          <Pause className="mr-2 h-4 w-4" /> Pause Test
        </Button>
        <Button variant="ghost" onClick={onFinishNow}>
          Finish Now
        </Button>
      </CardFooter>
    </Card>
  );
};

export default RecordingStep;
