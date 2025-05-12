
import React from 'react';
import PromptSection from '@/components/PromptSection';
import RecordingSection from '@/components/RecordingSection';
import { Card, CardContent } from '@/components/ui/card';
import { SpeakingPrompt, AudioAnalysisResult } from '@/types/assessment';

interface QuickAssessmentSectionProps {
  selectedPrompt: SpeakingPrompt | null;
  onPromptSelect: (prompt: SpeakingPrompt) => void;
  onRecordingComplete: (audioBlob: Blob, transcript?: string, audioAnalysis?: AudioAnalysisResult) => void;
  isProcessing: boolean;
}

const QuickAssessmentSection: React.FC<QuickAssessmentSectionProps> = ({
  selectedPrompt,
  onPromptSelect,
  onRecordingComplete,
  isProcessing
}) => {
  return (
    <>
      <PromptSection 
        onPromptSelect={onPromptSelect} 
        selectedPrompt={selectedPrompt}
      />
      
      <RecordingSection 
        prompt={selectedPrompt}
        onRecordingComplete={onRecordingComplete}
      />

      {isProcessing && (
        <Card className="mb-8">
          <CardContent className="p-8 text-center">
            <div className="animate-pulse text-assessment-blue">
              <p className="text-lg font-medium">Processing your recording...</p>
              <p className="text-sm mt-2 text-gray-600">
                Our AI is analyzing your speaking skills. This may take a few moments.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default QuickAssessmentSection;
