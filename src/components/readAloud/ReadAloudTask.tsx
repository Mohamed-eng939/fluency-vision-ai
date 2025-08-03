import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Mic, MicOff, Play, Pause } from 'lucide-react';
import { useReadAloudTask } from '@/hooks/readAloud/useReadAloudTask';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { scoreReadAloudSentence } from '@/utils/readAloud/pronunciationScoring';
import { ReadAloudResult } from '@/data/readAloud/sentenceBank';

interface ReadAloudTaskProps {
  sessionId: string;
  onComplete: (results: ReadAloudResult[]) => void;
  onProgress?: (current: number, total: number) => void;
}

export const ReadAloudTask: React.FC<ReadAloudTaskProps> = ({
  sessionId,
  onComplete,
  onProgress
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
  
  const { isRecording, startRecording, stopRecording, audioBlob } = useAudioRecorder();
  const { transcript, isListening, startListening, stopListening } = useSpeechRecognition();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  
  // Initialize task on mount
  useEffect(() => {
    if (!session) {
      initializeTask(sessionId);
    }
  }, [sessionId, session, initializeTask]);
  
  // Update progress
  useEffect(() => {
    if (session && onProgress) {
      onProgress(session.currentIndex, session.selectedSentences.length);
    }
  }, [session, onProgress]);
  
  // Handle task completion
  useEffect(() => {
    if (session && session.isCompleted && session.completedSentences.length > 0) {
      onComplete(session.completedSentences);
    }
  }, [session, onComplete]);
  
  const handleStartRecording = async () => {
    if (!currentSentence) return;
    
    try {
      await startRecording();
      startListening();
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  };
  
  const handleStopRecording = async () => {
    stopRecording();
    stopListening();
  };
  
  const handleSubmitRecording = async () => {
    if (!currentSentence || !audioBlob) return;
    
    setIsProcessing(true);
    
    try {
      // Score the pronunciation
      const result = scoreReadAloudSentence(
        currentSentence.sentence,
        transcript || '',
        {
          words: transcript ? transcript.split(' ') : [],
          confidenceScores: [0.8], // Placeholder - would come from actual ASR
          speechRate: 120,
          pauseCount: 0,
          totalDuration: 5000,
          speakingDuration: 4500
        }
      );
      
      // Set the sentence ID
      result.sentenceId = currentSentence.id;
      
      // Submit the result
      submitResult(result);
      
      // Move to next sentence or complete
      const hasMore = moveToNext();
      if (!hasMore) {
        // Task completed
        console.log('Read Aloud task completed');
      }
      
    } catch (error) {
      console.error('Error processing recording:', error);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleSkip = () => {
    if (!currentSentence) return;
    
    // Submit a minimal result for skipped sentence
    const skippedResult: ReadAloudResult = {
      sentenceId: currentSentence.id,
      score: 0,
      errors: [{ type: 'omission', description: 'Sentence skipped' }],
      transcription: '',
      confidence: 0
    };
    
    submitResult(skippedResult);
    moveToNext();
  };
  
  if (!session || !currentSentence) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading Read Aloud task...</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (showInstructions) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Read Aloud Task Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground space-y-2">
            <p>You will read 15 sentences aloud, 3 from each CEFR level (A1-C1).</p>
            <p>For each sentence:</p>
            <ul className="list-disc ml-6 space-y-1">
              <li>Read the sentence clearly and naturally</li>
              <li>Speak at a normal pace - don't rush</li>
              <li>Try to minimize hesitations and fillers</li>
              <li>You can re-record if needed</li>
            </ul>
            <p>Your pronunciation will be scored on accuracy, fluency, and clarity.</p>
          </div>
          <Button onClick={() => setShowInstructions(false)} className="w-full">
            Start Read Aloud Task
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  const progress = (session.currentIndex / session.selectedSentences.length) * 100;
  
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Read Aloud Task</span>
          <span className="text-sm font-normal text-muted-foreground">
            {session.currentIndex + 1} of {session.selectedSentences.length}
          </span>
        </CardTitle>
        <Progress value={progress} className="w-full" />
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Current sentence */}
        <div className="p-4 bg-muted rounded-lg">
          <div className="text-xs text-muted-foreground mb-2">
            Level: {currentSentence.band}
          </div>
          <div className="text-lg font-medium leading-relaxed">
            {currentSentence.sentence}
          </div>
        </div>
        
        {/* Recording controls */}
        <div className="text-center space-y-4">
          {!isRecording && !audioBlob && (
            <Button
              onClick={handleStartRecording}
              size="lg"
              className="w-full"
            >
              <Mic className="w-4 h-4 mr-2" />
              Start Recording
            </Button>
          )}
          
          {isRecording && (
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-muted-foreground">Recording...</span>
              </div>
              <Button
                onClick={handleStopRecording}
                variant="outline"
                size="lg"
                className="w-full"
              >
                <MicOff className="w-4 h-4 mr-2" />
                Stop Recording
              </Button>
            </div>
          )}
          
          {audioBlob && !isRecording && (
            <div className="space-y-4">
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-sm text-green-700 dark:text-green-300">
                  Recording completed
                </p>
                {transcript && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Transcription: "{transcript}"
                  </p>
                )}
              </div>
              
              <div className="flex space-x-2">
                <Button
                  onClick={handleSubmitRecording}
                  disabled={isProcessing}
                  className="flex-1"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    'Submit & Continue'
                  )}
                </Button>
                
                <Button
                  onClick={handleStartRecording}
                  variant="outline"
                  disabled={isProcessing}
                >
                  Re-record
                </Button>
              </div>
            </div>
          )}
        </div>
        
        {/* Skip button */}
        <div className="text-center">
          <Button
            onClick={handleSkip}
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            disabled={isProcessing}
          >
            Skip this sentence
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};