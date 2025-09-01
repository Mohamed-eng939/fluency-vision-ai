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
import { useAudioUpload } from '@/hooks/useAudioUpload';
import { useSupabaseStorage } from '@/hooks/assessment/useSupabaseStorage';
import { AssessmentResult, SpeakingPrompt } from '@/types/assessment';

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
  
  const { isRecording, startRecording, stopRecording, audioBlob, recordingTime, resetRecording } = useAudioRecorder();
  const { transcript, isListening, startListening, stopListening } = useSpeechRecognition();
  const { uploadAudio } = useAudioUpload();
  const { storePromptResponse } = useSupabaseStorage();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [watchdogFired, setWatchdogFired] = useState(false);
  const watchdogRef = React.useRef<number | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);
  
  // Initialize task on mount
  useEffect(() => {
    if (!session) {
      initializeTask(sessionId);
    }
  }, [sessionId, session, initializeTask]);
  
  // Update progress
  useEffect(() => {
    if (session && session.selectedSentences && onProgress) {
      onProgress(session.currentIndex, session.selectedSentences.length);
    }
   }, [session, onProgress]);
  
  // Log init for each RA item
  useEffect(() => {
    if (session && currentSentence) {
      console.info('[RA_INIT]', {
        sessionId,
        readAloudIndex: session.currentIndex,
        total: session.selectedSentences?.length,
        sentence_id: currentSentence.id,
        band: currentSentence.band
      });
    }
  }, [session, currentSentence, sessionId]);
  
  // Handle task completion
  useEffect(() => {
    if (session && session.selectedSentences && session.isCompleted && session.completedSentences.length > 0) {
      onComplete(session.completedSentences);
    }
   }, [session, onComplete]);
  
  // Log when blob becomes available
  useEffect(() => {
    if (audioBlob) {
      console.info('[REC_STOP]', { size: audioBlob.size, type: audioBlob.type, durationSec: recordingTime });
    }
  }, [audioBlob, recordingTime]);

  // Cleanup watchdog on unmount
  useEffect(() => {
    return () => {
      if (watchdogRef.current) {
        window.clearTimeout(watchdogRef.current);
      }
    };
  }, []);
  
  const handleStartRecording = async () => {
    if (!currentSentence) return;
    try {
      setLastError(null);
      setWatchdogFired(false);
      resetRecording();
      const ok = await startRecording();
      if (ok) {
        console.info('[REC_START]', { mime: 'auto', band: currentSentence.band, sentence_id: currentSentence.id });
        startListening();
      } else {
        console.warn('[REC_START_FAIL] getUserMedia failed');
      }
    } catch (error) {
      console.error('[REC_START_FAIL]', error);
    }
  };
  
  const handleStopRecording = async () => {
    try {
      console.info('[REC_STOP_REQUEST]');
      stopRecording();
      stopListening();
    } catch (e) {
      console.error('[REC_STOP_FAIL]', e);
    }
  };
  
  const handleSubmitRecording = async () => {
    if (!currentSentence || !audioBlob) {
      console.warn('[SUBMIT_ABORT] Missing sentence or audioBlob');
      return;
    }

    setIsProcessing(true);
    setLastError(null);

    // Start watchdog
    if (watchdogRef.current) window.clearTimeout(watchdogRef.current);
    watchdogRef.current = window.setTimeout(() => {
      console.warn('[WATCHDOG] Submission taking too long, showing Retry/Skip');
      setWatchdogFired(true);
    }, 20000);

    try {
      // Optional duration guard
      if (typeof recordingTime === 'number' && recordingTime < 1) {
        console.warn('[REC_SHORT] durationSec < 1s');
      }

      // 1) Score locally
      const raScore = scoreReadAloudSentence(
        currentSentence.sentence,
        transcript || '',
        {
          words: transcript ? transcript.split(' ') : [],
          confidenceScores: [0.8],
          speechRate: 120,
          pauseCount: 0,
          totalDuration: Math.max(1, recordingTime) * 1000,
          speakingDuration: Math.max(1, recordingTime - 0.2) * 1000
        }
      );
      raScore.sentenceId = currentSentence.id;

      // 2) Upload audio
      console.info('[UPLOAD_BEGIN]', { assessmentId: sessionId, sentenceId: currentSentence.id, size: audioBlob.size, type: audioBlob.type });
      let audioPath: string | null = null;
      try {
        const upload = await uploadAudio(audioBlob, sessionId, currentSentence.id);
        audioPath = upload.path || null;
        if (audioPath) {
          console.info('[UPLOAD_OK]', { path: audioPath });
        } else {
          console.warn('[UPLOAD_FAIL] No path returned');
        }
      } catch (e: any) {
        console.error('[UPLOAD_FAIL]', e?.message || e);
        setLastError(e?.message || String(e));
      }

      // 3) Prepare response
      const difficulty = (currentSentence.band === 'A1' || currentSentence.band === 'A2')
        ? 'beginner'
        : (currentSentence.band === 'B1' || currentSentence.band === 'B2')
        ? 'intermediate'
        : 'advanced';

      const raPrompt: SpeakingPrompt = {
        id: `RA-${currentSentence.id}`,
        text: currentSentence.sentence,
        category: 'read_aloud',
        difficulty,
        timeLimit: 60,
        cefrLevel: currentSentence.band as any,
        isReadAloud: true,
        topic: 'Read Aloud'
      };

      const pron = Math.max(0, Math.min(100, raScore.score * 20));
      const errorFlags: string[] = [];
      if (!audioPath) errorFlags.push('upload_failed');

      const raResult: AssessmentResult = {
        metrics: {
          fluency: 0,
          grammar: 0,
          pronunciation: pron,
          vocabulary: 0,
          syntax: 0,
          coherence: 0,
          prosody: 0
        },
        totalScore: pron,
        cefrLevel: currentSentence.band as any,
        feedback: {
          fluency: '',
          grammar: '',
          pronunciation: currentSentence.feedback?.[0] || 'Pronunciation feedback',
          vocabulary: '',
          syntax: '',
          coherence: '',
          prosody: '',
          overall: `Read Aloud (${currentSentence.band})${errorFlags.length ? ' | flags: ' + errorFlags.join(',') : ''}`
        },
        transcript: transcript || '',
        audioUrl: audioPath || undefined
      };

      // 4) Store response row
      let saved = false;
      try {
        const ok = await storePromptResponse(
          sessionId,
          raPrompt,
          raResult,
          session?.currentIndex || 0,
          transcript || '',
          audioPath || undefined
        );
        saved = !!ok;
        if (saved) console.info('[SAVE_OK]');
        else console.warn('[SAVE_FAIL] storePromptResponse returned false');
      } catch (e: any) {
        console.error('[SAVE_FAIL]', e?.message || e);
        setLastError(e?.message || String(e));
      }

      // 5) Advance flow regardless
      submitResult(raScore);
      const hasMore = moveToNext();
      console.info(hasMore ? '[ADVANCE]' : '[DONE]', {
        from: session?.currentIndex,
        to: (session?.currentIndex || 0) + 1
      });

      // Reset local recorder for next item
      resetRecording();
      setWatchdogFired(false);

    } catch (error: any) {
      console.error('[SUBMIT_FAIL]', error?.message || error);
      setLastError(error?.message || String(error));
    } finally {
      setIsProcessing(false);
      if (watchdogRef.current) {
        window.clearTimeout(watchdogRef.current);
      }
    }
  };
  
  const handleSkip = async () => {
    if (!currentSentence) return;

    const skippedResult: ReadAloudResult = {
      sentenceId: currentSentence.id,
      score: 0,
      errors: [{ type: 'omission', description: 'Sentence skipped' }],
      transcription: transcript || '',
      confidence: 0
    };

    // Try to store a minimal response as well
    try {
      const raPrompt: SpeakingPrompt = {
        id: `RA-${currentSentence.id}`,
        text: currentSentence.sentence,
        category: 'read_aloud',
        difficulty: (currentSentence.band === 'A1' || currentSentence.band === 'A2') ? 'beginner' : (currentSentence.band === 'B1' || currentSentence.band === 'B2') ? 'intermediate' : 'advanced',
        timeLimit: 60,
        cefrLevel: currentSentence.band as any,
        isReadAloud: true,
        topic: 'Read Aloud'
      };

      const raResult: AssessmentResult = {
        metrics: { fluency: 0, grammar: 0, pronunciation: 0, vocabulary: 0, syntax: 0, coherence: 0, prosody: 0 },
        totalScore: 0,
        cefrLevel: currentSentence.band as any,
        feedback: { fluency: '', grammar: '', pronunciation: 'Skipped', vocabulary: '', syntax: '', coherence: '', prosody: '', overall: 'Skipped | flags: skipped' },
        transcript: transcript || '',
        audioUrl: undefined
      };

      const ok = await storePromptResponse(
        sessionId,
        raPrompt,
        raResult,
        session?.currentIndex || 0,
        transcript || '',
        undefined
      );
      if (ok) console.info('[SAVE_OK] skipped');
      else console.warn('[SAVE_FAIL] skipped');
    } catch (e) {
      console.error('[SAVE_FAIL] skipped', e);
    }

    submitResult(skippedResult);
    const hasMore = moveToNext();
    console.info(hasMore ? '[ADVANCE]' : '[DONE]');
    resetRecording();
  };
  
  if (!session || !currentSentence) {
    console.warn('[RA_LOADING]', {
      hasSession: !!session,
      index: session?.currentIndex,
      total: session?.selectedSentences?.length
    });
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
  
  const progress = session?.selectedSentences?.length 
    ? (session.currentIndex / session.selectedSentences.length) * 100 
    : 0;
  
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Read Aloud Task</span>
          <span className="text-sm font-normal text-muted-foreground">
            {session.currentIndex + 1} of {session.selectedSentences?.length || 0}
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

        {/* Watchdog fallback UI */}
        {watchdogFired && (
          <div className="p-4 rounded-md border border-destructive/30 bg-destructive/5 space-y-3">
            <div className="text-sm">Submission is taking longer than expected.</div>
            <div className="flex gap-2">
              <Button onClick={handleSubmitRecording} disabled={isProcessing} className="flex-1">Retry Submit</Button>
              <Button onClick={handleSkip} variant="outline" disabled={isProcessing} className="flex-1">Skip</Button>
            </div>
            {lastError && (
              <div className="text-xs text-muted-foreground break-words">Last error: {lastError}</div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};