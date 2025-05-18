
import { useState } from 'react';
import { CEFRLevel, AssessmentResult } from '@/types/assessment';

export const useAssessmentScoring = (requiredConsistentScores: number = 4) => {
  // Result storage
  const [finalResult, setFinalResult] = useState<AssessmentResult | null>(null);
  const [consistentScores, setConsistentScores] = useState<{
    level: CEFRLevel;
    count: number;
  }>({ level: 'A1', count: 0 });
  
  // Check for scoring consistency
  const checkConsistency = (currentLevel: CEFRLevel) => {
    if (consistentScores.level === currentLevel) {
      const newCount = consistentScores.count + 1;
      setConsistentScores({
        level: currentLevel,
        count: newCount
      });
      return newCount;
    } else {
      setConsistentScores({
        level: currentLevel,
        count: 1
      });
      return 1;
    }
  };
  
  // Check if assessment should finish
  const shouldFinishAssessment = (
    consistencyCount: number, 
    currentIndex: number, 
    totalPrompts: number
  ) => {
    return (
      // If we've reached consistent scores threshold
      consistencyCount >= requiredConsistentScores ||
      // Or if we've gone through all prompts
      currentIndex >= totalPrompts - 1
    );
  };
  
  // Reset scoring
  const resetScoring = () => {
    setFinalResult(null);
    setConsistentScores({ level: 'A1', count: 0 });
  };
  
  return {
    finalResult,
    setFinalResult,
    consistentScores,
    checkConsistency,
    shouldFinishAssessment,
    resetScoring
  };
};
