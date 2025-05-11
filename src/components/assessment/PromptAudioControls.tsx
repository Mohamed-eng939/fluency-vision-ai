
import React from 'react';
import { Button } from '@/components/ui/button';
import { Volume2 } from 'lucide-react';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';

interface PromptAudioControlsProps {
  text: string;
}

const PromptAudioControls: React.FC<PromptAudioControlsProps> = ({ text }) => {
  const { speak, isPlaying } = useSpeechSynthesis();
  
  const handlePlayPrompt = () => {
    speak(text);
  };
  
  return (
    <Button 
      type="button"
      variant="outline"
      className="flex items-center gap-2 mb-4"
      onClick={handlePlayPrompt}
      disabled={isPlaying}
    >
      {isPlaying ? (
        <span className="flex items-center gap-2">
          <Volume2 className="h-4 w-4 animate-pulse" /> Playing Audio...
        </span>
      ) : (
        <span className="flex items-center gap-2">
          <Volume2 className="h-4 w-4" /> Listen to Prompt
        </span>
      )}
    </Button>
  );
};

export default PromptAudioControls;
