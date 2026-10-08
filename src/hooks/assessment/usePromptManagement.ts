
import { useState, useEffect, useRef, useCallback } from 'react';
import { SpeakingPrompt } from '@/types/assessment';
import { mockPrompts } from '@/utils/speaking/promptUtils';
import { fetchPromptsFromSupabase } from '@/services/promptService';
import { kidsPrompts } from '@/data/speaking/kidsPrompts';
import { teensPrompts } from '@/data/speaking/teensPrompts';
import type { Track } from '@/data/assessment/tracks';

export const usePromptManagement = (maxPrompts: number = 38, track: Track = 'adults') => {
  // Adults prompts come from Supabase (with a local fallback). Kids & Teens
  // question banks are authored locally in src/data/speaking.
  const [loadedAdultPrompts, setLoadedAdultPrompts] = useState<SpeakingPrompt[]>([]);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    fetchPromptsFromSupabase().then(prompts => {
      const speaking = prompts.filter(p => !p.isReadAloud);
      const readAloud = prompts.filter(p => p.isReadAloud);
      setLoadedAdultPrompts([...speaking, ...readAloud]);
    });
  }, []);

  const adultPrompts = loadedAdultPrompts.length > 0
    ? loadedAdultPrompts
    : (() => {
        const speaking = mockPrompts.filter(p => !p.isReadAloud);
        const readAloud = mockPrompts.filter(p => p.isReadAloud);
        return [...speaking, ...readAloud];
      })();

  // Resolve the question bank for a given age-based track.
  const getPromptsForTrack = useCallback((t: Track): SpeakingPrompt[] => {
    if (t === 'kids') return kidsPrompts;
    if (t === 'teens') return teensPrompts;
    return adultPrompts;
  }, [adultPrompts]);

  // Prompt queue and history
  const [promptQueue, setPromptQueue] = useState<SpeakingPrompt[]>([]);
  const [promptHistory, setPromptHistory] = useState<{
    prompt: SpeakingPrompt;
    result?: any;
  }[]>([]);
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);

  // Initialize the prompt queue for the active track. The track is passed in
  // explicitly by the flow (chosen from the student's age) so the right test
  // loads without depending on React state having flushed yet.
  const initializePromptQueue = (queueTrack: Track = track) => {
    const set = getPromptsForTrack(queueTrack);
    setPromptQueue([...set]);
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
