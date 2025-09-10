import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useReadAloudTask } from '@/hooks/readAloud/useReadAloudTask';
import { ReadAloudTask } from '../readAloud/ReadAloudTask';
import { 
  a1Sentences, 
  a2Sentences, 
  b1Sentences, 
  b2Sentences, 
  c1Sentences,
  ReadAloudSentence 
} from '@/data/readAloud/sentenceBank';

interface ReadAloudAssessmentStepProps {
  sessionId: string;
  currentIndex: number;
  totalTasks: number;
  cefrLevel?: string;
  onComplete: (results: any) => void;
  onNext: () => void;
  onFinish: () => void;
}

const ReadAloudAssessmentStep: React.FC<ReadAloudAssessmentStepProps> = ({
  sessionId,
  currentIndex,
  totalTasks,
  cefrLevel = 'A1',
  onComplete,
  onNext,
  onFinish
}) => {
  // Get the appropriate sentence based on current index and CEFR level
  const getSentenceForIndex = (index: number, level: string): ReadAloudSentence | null => {
    const levelToSentences: Record<string, ReadAloudSentence[]> = {
      'A1': a1Sentences,
      'A2': a2Sentences,
      'B1': b1Sentences,
      'B2': b2Sentences,
      'C1': c1Sentences
    };
    
    const sentences = levelToSentences[level] || [];
    
    if (index >= 0 && index < sentences.length && Array.isArray(sentences)) {
      return sentences[index] || null;
    }
    
    return null;
  };

  const currentSentence = getSentenceForIndex(currentIndex, cefrLevel);
  const currentLevel = currentSentence?.band || cefrLevel;

  // Debug instrumentation for RA sentence resolution
  React.useEffect(() => {
    console.info('[RA_STEP]', { 
      sessionId, 
      currentIndex, 
      cefrLevel, 
      totalTasks, 
      hasSentence: !!currentSentence,
      sentenceId: currentSentence?.id 
    });
    if (!currentSentence) {
      console.warn('[RA_SENTENCE_NULL]', { currentIndex, cefrLevel, totalTasks });
    }
  }, [sessionId, currentIndex, cefrLevel, totalTasks, currentSentence]);

  // Auto-advance if sentence cannot be resolved to avoid stall
  React.useEffect(() => {
    if (!currentSentence) {
      const t = setTimeout(() => {
        if (currentIndex < totalTasks - 1) onNext();
        else onFinish();
      }, 1500);
      return () => clearTimeout(t);
    }
  }, [currentSentence, currentIndex, totalTasks, onNext, onFinish]);

  const handleTaskComplete = (result: any) => {
    onComplete({
      ...result,
      questionId: `RA_${currentLevel}_${currentIndex + 1}`,
      cefrLevel: currentLevel,
      sentenceId: currentSentence?.id
    });
    
    // Check if we have more Read Aloud tasks
    if (currentIndex < totalTasks - 1) {
      onNext();
    } else {
      // All Read Aloud tasks completed
      onFinish();
    }
  };

  if (!currentSentence) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Read Aloud Task...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">Setting up pronunciation assessment...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>
            Read Aloud Assessment - {currentLevel} Task {currentIndex + 1} of {totalTasks}
          </CardTitle>
          <p className="text-muted-foreground">
            Read the sentence aloud clearly and naturally. Your pronunciation will be assessed.
          </p>
          <div className="text-sm text-muted-foreground">
            CEFR Level: {currentLevel} | Sentence {currentIndex + 1} of {totalTasks}
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="text-lg font-medium p-4 bg-muted rounded-lg">
              {currentSentence.sentence}
            </div>
          </div>
          
          <ReadAloudTask
            sessionId={sessionId}
            onComplete={(results) => {
              if (Array.isArray(results) && results.length > 0) {
                handleTaskComplete(results[results.length - 1]);
              } else if (results && !Array.isArray(results)) {
                // Fallback: handle single result object
                handleTaskComplete(results);
              }
            }}
            onProgress={(current, total) => {
              console.log(`Read Aloud progress: ${current}/${total}`);
            }}
          />
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => onNext()}>
          Skip Task
        </Button>
        
        {currentIndex === totalTasks - 1 && (
          <Button onClick={onFinish}>
            Complete Assessment
          </Button>
        )}
      </div>
    </div>
  );
};

export default ReadAloudAssessmentStep;