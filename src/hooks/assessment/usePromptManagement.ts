
import { useState } from 'react';
import { SpeakingPrompt, CEFRLevel } from '@/types/assessment';
import { mockPrompts } from '@/utils/speaking/promptUtils';

export const usePromptManagement = (maxPrompts: number = 10) => {
  // Group prompts by CEFR level with speaking prompts followed by read aloud tasks
  const groupedPrompts = () => {
    const levels = ['A1', 'A2', 'B1', 'B2', 'C1'];
    const orderedPrompts: SpeakingPrompt[] = [];
    
    levels.forEach(level => {
      // Add speaking prompts for this level first
      const speakingPrompts = mockPrompts.filter(p => 
        p.cefrLevel === level && !p.isReadAloud
      );
      orderedPrompts.push(...speakingPrompts);
      
      // Then add read aloud tasks for this level
      const readAloudTasks = mockPrompts.filter(p => 
        p.cefrLevel === level && p.isReadAloud
      );
      orderedPrompts.push(...readAloudTasks);
    });
    
    return orderedPrompts;
  };
  
  const sortedPrompts = groupedPrompts();
  
  // Prompt queue and history
  const [promptQueue, setPromptQueue] = useState<SpeakingPrompt[]>([]);
  const [promptHistory, setPromptHistory] = useState<{
    prompt: SpeakingPrompt;
    result?: any;
  }[]>([]);
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  
  // Initialize prompts queue
  const initializePromptQueue = () => {
    const totalPrompts = Math.min(maxPrompts, sortedPrompts.length);
    setPromptQueue(sortedPrompts.slice(0, totalPrompts));
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
