
import { useState, useMemo } from 'react';
import { SpeakingPrompt, CEFRLevel } from '@/types/assessment';
import { mockPrompts } from '@/utils/speaking/promptUtils';

export const usePromptManagement = (maxPrompts: number = 38) => {
  // Memoize sorted prompts to prevent recalculation on every render
  // Order: ALL free-speaking first (Q1-Q23), then ALL read-aloud (Q24-Q38)
  const sortedPrompts = useMemo(() => {
    const freeSpeakingPrompts = mockPrompts.filter(p => !p.isReadAloud);
    const readAloudPrompts = mockPrompts.filter(p => p.isReadAloud);
    return [...freeSpeakingPrompts, ...readAloudPrompts];
  }, []);
  
  // Prompt queue and history
  const [promptQueue, setPromptQueue] = useState<SpeakingPrompt[]>([]);
  const [promptHistory, setPromptHistory] = useState<{
    prompt: SpeakingPrompt;
    result?: any;
  }[]>([]);
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  
  // Initialize prompts queue - NO CAPS/FILTERS, use ALL prompts
  const initializePromptQueue = () => {
    console.info('[PROMPT_QUEUE_INIT] Actually initializing queue now');
    console.info('[PROMPT_QUEUE_INIT] Available prompts:', sortedPrompts.length);
    console.info('[PROMPT_QUEUE_INIT] Free-speaking: Q1-Q23, Read-aloud: Q24-Q38');
    
    // Use ALL available prompts
    const totalPrompts = sortedPrompts.length;
    setPromptQueue(sortedPrompts.slice(0, totalPrompts));
    setPromptHistory([]);
    setCurrentPromptIndex(0);
    
    console.info('[PROMPT_QUEUE_INIT] Queue initialized with', totalPrompts, 'prompts total');
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
    console.info(`[FS_NEXT] Moving from Q${currentPromptIndex + 1} to Q${nextIndex + 1}`);
    
    if (nextIndex < promptQueue.length) {
      setCurrentPromptIndex(nextIndex);
      const nextPrompt = promptQueue[nextIndex];
      
      if (nextPrompt.isReadAloud) {
        console.info(`[RA_START] Starting Read-Aloud phase at Q${nextIndex + 1} (${nextPrompt.cefrLevel})`);
      } else {
        console.info(`[FS_CONTINUE] Free-speaking Q${nextIndex + 1} (${nextPrompt.cefrLevel}): ${nextPrompt.text.substring(0, 50)}...`);
      }
      
      return nextPrompt;
    }
    
    console.info('[ASSESSMENT_COMPLETE] All 38 questions completed - moving to processing');
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
