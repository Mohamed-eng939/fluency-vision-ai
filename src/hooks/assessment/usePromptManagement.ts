
import { useState, useEffect, useRef } from 'react';
import { SpeakingPrompt, CEFRLevel } from '@/types/assessment';
import { mockPrompts } from '@/utils/speaking/promptUtils';
import { fetchPromptsFromSupabase } from '@/services/promptService';

export const usePromptManagement = (maxPrompts: number = 38) => {
  const [loadedPrompts, setLoadedPrompts] = useState<SpeakingPrompt[]>([]);
  const fetchedRef = useRef(false);

  // Fetch prompts from Supabase once; fall back to local data if unavailable.
  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    fetchPromptsFromSupabase().then(prompts => {
      const speaking = prompts.filter(p => !p.isReadAloud);
      const readAloud = prompts.filter(p => p.isReadAloud);
      setLoadedPrompts([...speaking, ...readAloud]);
    });
  }, []);

  const sortedPrompts = loadedPrompts.length > 0
    ? loadedPrompts
    : (() => {
        const speaking = mockPrompts.filter(p => !p.isReadAloud);
        const readAloud = mockPrompts.filter(p => p.isReadAloud);
        return [...speaking, ...readAloud];
      })();

  // Prompt queue and history
  const [promptQueue, setPromptQueue] = useState<SpeakingPrompt[]>([]);
  const [promptHistory, setPromptHistory] = useState<{
    prompt: SpeakingPrompt;
    result?: any;
  }[]>([]);
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);

  // Initialize prompts queue — speaking prompts first, then read-aloud
  const initializePromptQueue = () => {
    const totalPrompts = sortedPrompts.length;
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
