import { useState } from 'react';
import { 
  ReadAloudSentence, 
  a1Sentences, 
  a2Sentences, 
  b1Sentences, 
  b2Sentences, 
  c1Sentences 
} from '@/data/readAloud/sentenceBank';

interface ReadAloudIntegrationState {
  readAloudTasks: ReadAloudSentence[];
  currentReadAloudIndex: number;
  readAloudResults: any[];
  isInReadAloudPhase: boolean;
}

export const useReadAloudIntegration = () => {
  const [state, setState] = useState<ReadAloudIntegrationState>({
    readAloudTasks: [],
    currentReadAloudIndex: 0,
    readAloudResults: [],
    isInReadAloudPhase: false
  });

  // Generate 15 Read Aloud tasks (3 per CEFR band)
  const generateReadAloudTasks = (): ReadAloudSentence[] => {
    const allSentences = [
      ...a1Sentences,
      ...a2Sentences, 
      ...b1Sentences,
      ...b2Sentences,
      ...c1Sentences
    ];

    // Group by CEFR band
    const sentencesByBand = {
      A1: a1Sentences,
      A2: a2Sentences,
      B1: b1Sentences,
      B2: b2Sentences,
      C1: c1Sentences
    };

    // Select 3 random sentences from each band
    const selectedTasks: ReadAloudSentence[] = [];
    Object.entries(sentencesByBand).forEach(([band, sentences]) => {
      const shuffled = [...sentences].sort(() => Math.random() - 0.5);
      selectedTasks.push(...shuffled.slice(0, 3));
    });

    return selectedTasks;
  };

  const initializeReadAloudPhase = () => {
    const tasks = generateReadAloudTasks();
    setState({
      readAloudTasks: tasks,
      currentReadAloudIndex: 0,
      readAloudResults: [],
      isInReadAloudPhase: true
    });
    return tasks;
  };

  const submitReadAloudResult = (result: any) => {
    setState(prev => ({
      ...prev,
      readAloudResults: [...prev.readAloudResults, result]
    }));
  };

  const moveToNextReadAloud = () => {
    setState(prev => {
      const nextIndex = prev.currentReadAloudIndex + 1;
      return {
        ...prev,
        currentReadAloudIndex: nextIndex,
        isInReadAloudPhase: nextIndex < prev.readAloudTasks.length
      };
    });
  };

  const completeReadAloudPhase = () => {
    setState(prev => ({
      ...prev,
      isInReadAloudPhase: false
    }));
  };

  const resetReadAloudPhase = () => {
    setState({
      readAloudTasks: [],
      currentReadAloudIndex: 0,
      readAloudResults: [],
      isInReadAloudPhase: false
    });
  };

  const getCurrentReadAloudTask = (): ReadAloudSentence | null => {
    if (!state.isInReadAloudPhase || state.currentReadAloudIndex >= state.readAloudTasks.length) {
      return null;
    }
    return state.readAloudTasks[state.currentReadAloudIndex];
  };

  const getReadAloudProgress = () => ({
    current: state.currentReadAloudIndex + 1,
    total: state.readAloudTasks.length,
    completed: state.readAloudResults.length
  });

  const getAggregatedReadAloudScore = () => {
    if (state.readAloudResults.length === 0) return 0;
    
    const totalScore = state.readAloudResults.reduce((sum, result) => sum + result.score, 0);
    return totalScore / state.readAloudResults.length;
  };

  return {
    // State
    readAloudTasks: state.readAloudTasks,
    currentReadAloudIndex: state.currentReadAloudIndex,
    readAloudResults: state.readAloudResults,
    isInReadAloudPhase: state.isInReadAloudPhase,
    
    // Methods
    initializeReadAloudPhase,
    submitReadAloudResult,
    moveToNextReadAloud,
    completeReadAloudPhase,
    resetReadAloudPhase,
    getCurrentReadAloudTask,
    getReadAloudProgress,
    getAggregatedReadAloudScore
  };
};