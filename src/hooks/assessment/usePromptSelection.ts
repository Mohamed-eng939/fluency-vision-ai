
import { useState } from 'react';
import { SpeakingPrompt } from '@/types/assessment';

export const usePromptSelection = () => {
  const [selectedPrompt, setSelectedPrompt] = useState<SpeakingPrompt | null>(null);

  const handlePromptSelect = (prompt: SpeakingPrompt) => {
    setSelectedPrompt(prompt);
  };

  return {
    selectedPrompt,
    handlePromptSelect,
  };
};
