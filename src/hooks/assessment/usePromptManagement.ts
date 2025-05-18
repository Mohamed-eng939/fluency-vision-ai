
import { useState } from 'react';
import { SpeakingPrompt, CEFRLevel } from '@/types/assessment';
import { mockPrompts } from '@/utils/speaking/promptUtils';

export const usePromptManagement = (maxPrompts: number = 10) => {
  // Sort prompts by CEFR level for adaptive testing
  const sortedPrompts = [...mockPrompts].sort((a, b) => {
    // Order: A1, A2, B1, B2, C1, C2
    const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    return levels.indexOf(a.cefrLevel || 'A1') - levels.indexOf(b.cefrLevel || 'A1');
  });
  
  // Prompt queue and history
  const [promptQueue, setPromptQueue] = useState<SpeakingPrompt[]>([]);
  const [promptHistory, setPromptHistory] = useState<{
    prompt: SpeakingPrompt;
    result?: any;
  }[]>([]);
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  
  // Initialize prompts queue
  const initializePromptQueue = () => {
    setPromptQueue(sortedPrompts.slice(0, maxPrompts));
    setPromptHistory([]);
    setCurrentPromptIndex(0);
  };
  
  // Add to history
  const addToHistory = (prompt: SpeakingPrompt, result: any) => {
    const updatedHistory = [
      ...promptHistory,
      { prompt, result }
    ];
    setPromptHistory(updatedHistory);
    return updatedHistory;
  };
  
  // Move to next prompt
  const moveToNextPrompt = () => {
    const nextIndex = currentPromptIndex + 1;
    if (nextIndex < promptQueue.length) {
      setCurrentPromptIndex(nextIndex);
      return promptQueue[nextIndex];
    }
    return null;
  };
  
  // Get current prompt
  const currentPrompt = promptQueue[currentPromptIndex] || null;
  
  return {
    promptQueue,
    promptHistory,
    currentPromptIndex,
    currentPrompt,
    totalPrompts: promptQueue.length,
    initializePromptQueue,
    addToHistory,
    moveToNextPrompt,
    setPromptHistory
  };
};
