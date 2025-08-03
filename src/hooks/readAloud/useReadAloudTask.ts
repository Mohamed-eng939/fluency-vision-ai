import { useState, useCallback } from 'react';
import { 
  ReadAloudSentence, 
  ReadAloudResult, 
  ReadAloudError,
  getSentencesByBand, 
  allSentences 
} from '@/data/readAloud/sentenceBank';

export interface ReadAloudSession {
  sessionId: string;
  selectedSentences: ReadAloudSentence[];
  completedSentences: ReadAloudResult[];
  currentIndex: number;
  isCompleted: boolean;
}

export interface ReadAloudTaskManager {
  session: ReadAloudSession | null;
  currentSentence: ReadAloudSentence | null;
  initializeTask: (sessionId: string) => void;
  submitResult: (result: ReadAloudResult) => void;
  moveToNext: () => boolean;
  getAggregatedScore: () => {
    totalScore: number;
    bandScores: Record<string, number>;
    cefrLevel: string;
    averageScore: number;
  };
  reset: () => void;
}

const CEFR_BANDS = ['A1', 'A2', 'B1', 'B2', 'C1'] as const;
const SENTENCES_PER_BAND = 3;

export const useReadAloudTask = (): ReadAloudTaskManager => {
  const [session, setSession] = useState<ReadAloudSession | null>(null);

  // Select 3 random sentences from each CEFR band
  const selectSentencesForTest = useCallback((sessionId: string): ReadAloudSentence[] => {
    const selectedSentences: ReadAloudSentence[] = [];
    
    CEFR_BANDS.forEach(band => {
      const bandSentences = getSentencesByBand(band);
      
      if (bandSentences.length < SENTENCES_PER_BAND) {
        console.warn(`Insufficient sentences for band ${band}. Expected ${SENTENCES_PER_BAND}, found ${bandSentences.length}`);
      }
      
      // Shuffle and select 3 sentences from this band
      const shuffled = [...bandSentences].sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, Math.min(SENTENCES_PER_BAND, bandSentences.length));
      
      selectedSentences.push(...selected);
    });
    
    // Optionally shuffle the final order, or keep band-grouped
    return selectedSentences.sort(() => Math.random() - 0.5);
  }, []);

  const initializeTask = useCallback((sessionId: string) => {
    const selectedSentences = selectSentencesForTest(sessionId);
    
    const newSession: ReadAloudSession = {
      sessionId,
      selectedSentences,
      completedSentences: [],
      currentIndex: 0,
      isCompleted: false
    };
    
    setSession(newSession);
    console.log(`Read Aloud task initialized with ${selectedSentences.length} sentences`);
  }, [selectSentencesForTest]);

  const submitResult = useCallback((result: ReadAloudResult) => {
    if (!session) return;
    
    setSession(prev => {
      if (!prev) return prev;
      
      return {
        ...prev,
        completedSentences: [...prev.completedSentences, result]
      };
    });
  }, [session]);

  const moveToNext = useCallback((): boolean => {
    if (!session) return false;
    
    const nextIndex = session.currentIndex + 1;
    const hasMore = nextIndex < session.selectedSentences.length;
    
    setSession(prev => {
      if (!prev) return prev;
      
      return {
        ...prev,
        currentIndex: nextIndex,
        isCompleted: !hasMore
      };
    });
    
    return hasMore;
  }, [session]);

  const getAggregatedScore = useCallback(() => {
    if (!session || session.completedSentences.length === 0) {
      return {
        totalScore: 0,
        bandScores: {},
        cefrLevel: 'A1',
        averageScore: 0
      };
    }
    
    // Calculate band-specific scores
    const bandScores: Record<string, number[]> = {};
    let totalScore = 0;
    
    session.completedSentences.forEach(result => {
      const sentence = session.selectedSentences.find(s => s.id === result.sentenceId);
      if (sentence) {
        if (!bandScores[sentence.band]) {
          bandScores[sentence.band] = [];
        }
        bandScores[sentence.band].push(result.score);
        totalScore += result.score;
      }
    });
    
    // Calculate average scores per band
    const averageBandScores: Record<string, number> = {};
    Object.entries(bandScores).forEach(([band, scores]) => {
      averageBandScores[band] = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    });
    
    const averageScore = totalScore / session.completedSentences.length;
    const maxPossibleScore = session.selectedSentences.length * 5; // 5 is max score per sentence
    const percentageScore = (totalScore / maxPossibleScore) * 100;
    
    // Map to CEFR level based on percentage
    let cefrLevel = 'A1';
    if (percentageScore >= 90) cefrLevel = 'C1';
    else if (percentageScore >= 80) cefrLevel = 'B2';
    else if (percentageScore >= 65) cefrLevel = 'B1';
    else if (percentageScore >= 50) cefrLevel = 'A2';
    
    return {
      totalScore,
      bandScores: averageBandScores,
      cefrLevel,
      averageScore
    };
  }, [session]);

  const reset = useCallback(() => {
    setSession(null);
  }, []);

  const currentSentence = session && session.currentIndex < session.selectedSentences.length
    ? session.selectedSentences[session.currentIndex]
    : null;

  return {
    session,
    currentSentence,
    initializeTask,
    submitResult,
    moveToNext,
    getAggregatedScore,
    reset
  };
};
