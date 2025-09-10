import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import RecordingContainer from './RecordingContainer';
import RecordingFlowController from './RecordingFlowController';
import { 
  a1Sentences, 
  a2Sentences, 
  b1Sentences, 
  b2Sentences, 
  c1Sentences,
  ReadAloudSentence 
} from '@/data/readAloud/sentenceBank';
import { AudioAnalysisResult } from '@/types/assessment';

interface ReadAloudAssessmentStepProps {
  sessionId: string;
  currentIndex: number;
  totalTasks: number;
  cefrLevel: string;
  onComplete: (audioBlob: Blob, transcript?: string, audioAnalysis?: AudioAnalysisResult) => void;
  onNext: () => void;
  onFinish: () => void;
}

const ReadAloudAssessmentStep: React.FC<ReadAloudAssessmentStepProps> = ({
  sessionId,
  currentIndex,
  totalTasks,
  cefrLevel,
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

  // Create a mock prompt for the read aloud sentence
  const readAloudPrompt = React.useMemo(() => {
    if (!currentSentence) return null;
    
    const difficulty = (cefrLevel === 'A1' || cefrLevel === 'A2') ? 'beginner' : 
                      (cefrLevel === 'B1' || cefrLevel === 'B2') ? 'intermediate' : 'advanced';
    
    return {
      id: `RA_${cefrLevel}_${currentIndex + 1}`,
      text: `Read the following sentence aloud clearly and naturally: "${currentSentence.sentence}"`,
      category: 'read_aloud' as const,
      difficulty: difficulty as 'beginner' | 'intermediate' | 'advanced',
      timeLimit: 60,
      cefrLevel: cefrLevel as any,
      isReadAloud: true,
      topic: 'Read Aloud',
      sentence: currentSentence.sentence
    };
  }, [currentSentence, cefrLevel, currentIndex]);

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

  const handleRecordingComplete = (audioBlob: Blob, transcript?: string, audioAnalysis?: AudioAnalysisResult) => {
    console.log('Read Aloud recording completed:', { 
      cefrLevel, 
      currentIndex, 
      sentence: currentSentence?.sentence,
      transcriptLength: transcript?.length 
    });
    
    // Create enhanced audio analysis for read aloud
    const enhancedAudioAnalysis: AudioAnalysisResult = {
      ...audioAnalysis,
      readAloudScore: 85, // Mock score for now
      pronunciationScore: 85,
      band: cefrLevel as any
    };
    
    onComplete(audioBlob, transcript, enhancedAudioAnalysis);
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
            Read Aloud Assessment - {cefrLevel} Task {currentIndex + 1} of {totalTasks}
          </CardTitle>
          <p className="text-muted-foreground">
            Read the sentence aloud clearly and naturally. Your pronunciation will be assessed.
          </p>
          <div className="text-sm text-muted-foreground">
            CEFR Level: {cefrLevel} | Sentence {currentIndex + 1} of {totalTasks}
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="text-lg font-medium p-4 bg-muted rounded-lg">
              {currentSentence.sentence}
            </div>
          </div>
          
          {readAloudPrompt && (
            <RecordingFlowController
              selectedPrompt={readAloudPrompt}
              onComplete={handleRecordingComplete}
              onCancel={onNext}
              isProcessing={false}
              delayAnalysis={false}
            />
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onNext}>
          Skip Task
        </Button>
        
        {currentIndex === totalTasks - 1 ? (
          <Button onClick={onFinish}>
            Complete Read Aloud Tasks
          </Button>
        ) : (
          <Button onClick={onNext}>
            Next Task
          </Button>
        )}
      </div>
    </div>
  );
};

export default ReadAloudAssessmentStep;