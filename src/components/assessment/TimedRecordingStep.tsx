
import React, { useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pause, CheckCircle, Clock, Mic, Send } from 'lucide-react';
import { SpeakingPrompt, AudioAnalysisResult } from '@/types/assessment';
import { useTimedRecordingFlow } from '@/hooks/recording/useTimedRecordingFlow';

interface TimedRecordingStepProps {
  prompt: SpeakingPrompt;
  currentIndex: number;
  totalPrompts: number;
  onRecordingComplete: (audioBlob: Blob, transcript?: string, audioAnalysis?: AudioAnalysisResult) => void;
  onPause: () => void;
  onFinishNow: () => void;
  isProcessing: boolean;
}

const TimedRecordingStep: React.FC<TimedRecordingStepProps> = ({
  prompt,
  currentIndex,
  totalPrompts,
  onRecordingComplete,
  onPause,
  onFinishNow,
  isProcessing,
}) => {
  const {
    phase,
    readingTimeLeft,
    recordingTimeLeft,
    isRecording,
    transcript,
    isProcessing: flowProcessing,
    handleEarlySubmit,
    resetForNextQuestion,
  } = useTimedRecordingFlow(onRecordingComplete);

  // Reset when prompt changes (new question)
  useEffect(() => {
    resetForNextQuestion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prompt.id]);

  const progressPercent = ((currentIndex + 1) / totalPrompts) * 100;

  if (phase === 'submitting') {
    return (
      <Card className="max-w-3xl mx-auto">
        <CardContent className="p-12 text-center">
          <CheckCircle className="h-16 w-16 text-primary mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Response Saved!</h3>
          <p className="text-muted-foreground flex items-center justify-center gap-2">
            <Clock className="h-4 w-4" />
            Analysis will run when test is complete
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-assessment-blue">Quick Assessment</h2>
          <div className="text-sm font-medium">
            Question {currentIndex + 1} of {totalPrompts}
          </div>
        </div>
        <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
          <div
            className="bg-assessment-blue h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Prompt text */}
        <div className="p-4 bg-muted/50 rounded-lg">
          <h3 className="font-semibold mb-2 capitalize">{prompt.category.replace('_', ' ')}</h3>
          <p className="text-foreground">{prompt.text}</p>
          {prompt.hint && (
            <p className="text-sm text-muted-foreground mt-2 italic">{prompt.hint}</p>
          )}
        </div>

        {/* Phase UI */}
        {phase === 'reading' && (
          <div className="text-center space-y-4 py-6">
            <Mic className="h-12 w-12 mx-auto text-muted-foreground/40" />
            <div>
              <p className="text-lg font-medium text-muted-foreground">Read the question</p>
              <p className="text-sm text-muted-foreground mt-1">Recording starts automatically in</p>
            </div>
            <div className="text-5xl font-bold text-assessment-blue tabular-nums">
              {readingTimeLeft}
            </div>
            <p className="text-xs text-muted-foreground">seconds</p>
          </div>
        )}

        {phase === 'recording' && (
          <div className="text-center space-y-4 py-4">
            {/* Recording indicator */}
            <div className="flex items-center justify-center gap-3">
              <span className="relative flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive/40 opacity-75" />
                <span className="relative inline-flex rounded-full h-4 w-4 bg-destructive" />
              </span>
              <span className="text-lg font-medium text-destructive">Recording</span>
            </div>

            {/* Countdown */}
            <div className="text-4xl font-bold tabular-nums text-foreground">
              {Math.floor(recordingTimeLeft / 60)}:{(recordingTimeLeft % 60).toString().padStart(2, '0')}
            </div>

            {/* Countdown bar */}
            <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
              <div
                className="bg-destructive h-2 rounded-full transition-all duration-1000 ease-linear"
                style={{ width: `${(recordingTimeLeft / 60) * 100}%` }}
              />
            </div>

            {/* Transcript preview */}
            {transcript && (
              <div className="text-left p-3 bg-muted/50 rounded-lg max-h-24 overflow-y-auto">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Transcript: </span>
                  {transcript}
                </p>
              </div>
            )}

            {/* Early submit button */}
            <Button
              size="lg"
              onClick={handleEarlySubmit}
              disabled={isProcessing || flowProcessing}
              className="mt-4"
            >
              <Send className="h-4 w-4 mr-2" />
              Submit Response
            </Button>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between border-t pt-4">
        <Button variant="outline" onClick={onPause}>
          <Pause className="mr-2 h-4 w-4" /> Pause Test
        </Button>
        <Button variant="ghost" onClick={onFinishNow}>
          Finish & Process Now
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TimedRecordingStep;
