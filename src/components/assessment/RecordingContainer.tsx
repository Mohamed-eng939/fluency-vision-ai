
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import PromptHeader from './PromptHeader';
import PromptAudioControls from './PromptAudioControls';
import ApiStatusIndicator from './ApiStatusIndicator';
import { SpeakingPrompt } from '@/types/assessment';

interface RecordingContainerProps {
  prompt: SpeakingPrompt;
  isPronunciationApiAvailable: boolean;
  children: React.ReactNode;
}

const RecordingContainer: React.FC<RecordingContainerProps> = ({
  prompt,
  isPronunciationApiAvailable,
  children
}) => {
  return (
    <Card className="mb-8 border-assessment-teal/20">
      <CardContent className="p-6">
        <PromptHeader prompt={prompt} />
        
        <div className="mb-4">
          <PromptAudioControls text={prompt.text} />
        </div>
        
        <div className="mb-4">
          <ApiStatusIndicator isApiAvailable={isPronunciationApiAvailable} />
          {children}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecordingContainer;
