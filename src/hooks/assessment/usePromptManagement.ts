
import { useState, useEffect, useRef, useCallback } from 'react';
import { SpeakingPrompt } from '@/types/assessment';
import { mockPrompts } from '@/utils/speaking/promptUtils';
import { fetchPromptsFromSupabase } from '@/services/promptService';
import { kidsPrompts } from '@/data/speaking/kidsPrompts';
import { teensPrompts } from '@/data/speaking/teensPrompts';
import type { Track } from '@/data/assessment/tracks';

const LEVEL_ORDER: Record<string, number> = { A1: 0, A2: 1, B1: 2, B2: 3, C1: 4, C2: 5 };

/**
 * Order prompts by CEFR level (gradual difficulty), placing each level's
 * read-aloud item(s) right after that level's free-speaking prompts — so an A1
 * read-aloud sits among the A1 questions, a B1 read-aloud among the B1s, etc.,
 * instead of all read-alouds bunched at the very end of the test.
 */
const interleaveByLevel = (prompts: SpeakingPrompt[]): SpeakingPrompt[] => {
  const rank = (p: SpeakingPrompt) => LEVEL_ORDER[(p.cefrLevel || '').toUpperCase()] ?? 99;
  const levels = [...new Set(prompts.map(rank))].sort((a, b) => a - b);
  const out: SpeakingPrompt[] = [];
  for (const lvl of levels) {
    const atLevel = prompts.filter((p) => rank(p) === lvl);
    out.push(...atLevel.filter((p) => !p.isReadAloud), ...atLevel.filter((p) => p.isReadAloud));
  }
  return out;
};

export const usePromptManagement = (maxPrompts: number = 38, track: Track = 'adults') => {
  // Adults prompts come from Supabase (with a local fallback). Kids & Teens
  // question banks are authored locally in src/data/speaking.
  const [loadedAdultPrompts, setLoadedAdultPrompts] = useState<SpeakingPrompt[]>([]);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    fetchPromptsFromSupabase().then(prompts => {
      setLoadedAdultPrompts(interleaveByLevel(prompts));
    });
  }, []);

  const adultPrompts = loadedAdultPrompts.length > 0
    ? loadedAdultPrompts
    : interleaveByLevel(mockPrompts);

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
