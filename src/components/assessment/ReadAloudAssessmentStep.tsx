import React from 'react';
import { ReadAloudTask } from '../readAloud/ReadAloudTask';
import { useReadAloudTask } from '@/hooks/readAloud/useReadAloudTask';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ReadAloudAssessmentStepProps {
  sessionId: string;
  currentIndex: number;
  totalTasks: number;
  onComplete: (results: any) => void;
  onNext: () => void;
  onFinish: () => void;
}

const ReadAloudAssessmentStep: React.FC<ReadAloudAssessmentStepProps> = ({
  sessionId,
  currentIndex,
  totalTasks,
  onComplete,
  onNext,
  onFinish
}) => {
  const {
    session,
    currentSentence,
    initializeTask,
    submitResult,
    moveToNext,
    getAggregatedScore,
    reset
  } = useReadAloudTask();

  React.useEffect(() => {
    if (!session) {
      initializeTask(sessionId);
    }
  }, [sessionId, session, initializeTask]);

  const handleTaskComplete = (result: any) => {
    submitResult(result);
    onComplete(result);
    
    // Check if we have more sentences
    if (currentIndex < totalTasks - 1) {
      moveToNext();
      onNext();
    } else {
      // All Read Aloud tasks completed
      const aggregatedScore = getAggregatedScore();
      onComplete({
        ...result,
        aggregatedScore,
        isComplete: true
      });
      onFinish();
    }
  };

  if (!session || !currentSentence) {
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
            Read Aloud Assessment - Task {currentIndex + 1} of {totalTasks}
          </CardTitle>
          <p className="text-muted-foreground">
            Read the sentence aloud clearly and naturally. Your pronunciation will be assessed.
          </p>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="text-sm text-muted-foreground mb-2">
              CEFR Level: {currentSentence.band}
            </div>
            <div className="text-lg font-medium p-4 bg-muted rounded-lg">
              {currentSentence.sentence}
            </div>
          </div>
          
          <ReadAloudTask
            sessionId={sessionId}
            onComplete={(results) => {
              if (results.length > 0) {
                handleTaskComplete(results[results.length - 1]);
              }
            }}
            onProgress={(current, total) => {
              console.log(`Read Aloud progress: ${current}/${total}`);
            }}
          />
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => reset()}>
          Reset Task
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