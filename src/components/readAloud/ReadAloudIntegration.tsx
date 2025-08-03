import React, { useState } from 'react';
import { ReadAloudTask } from './ReadAloudTask';
import { ReadAloudResults } from './ReadAloudResults';
import { ReadAloudResult } from '@/data/readAloud/sentenceBank';

interface ReadAloudIntegrationProps {
  sessionId: string;
  onComplete: (finalScore: number, cefrLevel: string) => void;
}

export const ReadAloudIntegration: React.FC<ReadAloudIntegrationProps> = ({
  sessionId,
  onComplete
}) => {
  const [results, setResults] = useState<ReadAloudResult[] | null>(null);
  
  const handleTaskComplete = (taskResults: ReadAloudResult[]) => {
    setResults(taskResults);
    
    // Calculate final pronunciation score
    const totalScore = taskResults.reduce((sum, result) => sum + result.score, 0);
    const averageScore = totalScore / taskResults.length;
    const maxPossibleScore = taskResults.length * 5;
    const percentageScore = (totalScore / maxPossibleScore) * 100;
    
    // Map to CEFR level
    let cefrLevel = 'A1';
    if (percentageScore >= 90) cefrLevel = 'C1';
    else if (percentageScore >= 80) cefrLevel = 'B2';
    else if (percentageScore >= 65) cefrLevel = 'B1';
    else if (percentageScore >= 50) cefrLevel = 'A2';
    
    onComplete(averageScore, cefrLevel);
  };
  
  if (results) {
    return <ReadAloudResults results={results} />;
  }
  
  return (
    <ReadAloudTask
      sessionId={sessionId}
      onComplete={handleTaskComplete}
    />
  );
};