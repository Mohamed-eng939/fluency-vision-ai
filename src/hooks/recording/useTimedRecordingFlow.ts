
import { useState, useEffect, useRef, useCallback } from 'react';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { AudioAnalysisResult } from '@/utils/audioAnalysisUtils';
import { useRecordingSubmission } from './useRecordingSubmission';
import { RecordingFlowCallbacks } from './types';

const READING_PHASE_SECONDS = 10;
const RECORDING_PHASE_SECONDS = 60;

export type TimedPhase = 'reading' | 'recording' | 'submitting';

export const useTimedRecordingFlow = (
  onRecordingComplete: (audioBlob: Blob, transcript?: string, audioAnalysis?: AudioAnalysisResult) => void,
) => {
  const [phase, setPhase] = useState<TimedPhase>('reading');
  const [readingTimeLeft, setReadingTimeLeft] = useState(READING_PHASE_SECONDS);
  const [recordingTimeLeft, setRecordingTimeLeft] = useState(RECORDING_PHASE_SECONDS);
  const hasSubmittedRef = useRef(false);
  const readingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const callbacks: RecordingFlowCallbacks = {
    onRecordingComplete,
    delayAnalysis: true,
  };

  const {
    isQuickSubmitting,
    setIsQuickSubmitting,
    submitAudioRecording,
    submitManualTranscript,
    submitEmpty,
  } = useRecordingSubmission(callbacks);

  // VAD silence callback - will auto-submit
  const handleSilenceAutoStop = useCallback(() => {
    console.log('VAD silence detected, auto-submitting');
    // The audioRecorder will stop recording via its own callback,
    // we just need to trigger submission in the next tick
    // (audioBlob will be set by the onstop handler)
  }, []);

  const {
    isRecording,
    recordingTime,
    audioBlob,
    audioAnalysis,
    isProcessing,
    startRecording,
    stopRecording,
    resetRecording,
    formatTime,
  } = useAudioRecorder({
    autoStopSilenceMs: 4000,
    maxDurationSeconds: RECORDING_PHASE_SECONDS,
    onSilenceAutoStop: handleSilenceAutoStop,
  });

  const {
    transcript,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition();

  // === Reading phase countdown ===
  useEffect(() => {
    if (phase !== 'reading') return;

    readingTimerRef.current = setInterval(() => {
      setReadingTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(readingTimerRef.current!);
          readingTimerRef.current = null;
          setPhase('recording');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (readingTimerRef.current) {
        clearInterval(readingTimerRef.current);
        readingTimerRef.current = null;
      }
    };
  }, [phase]);

  // === Auto-start recording when phase switches to 'recording' ===
  useEffect(() => {
    if (phase !== 'recording') return;

    hasSubmittedRef.current = false;
    const doStart = async () => {
      const started = await startRecording();
      if (started) {
        startListening();
      }
    };
    doStart();

    // Start recording countdown
    setRecordingTimeLeft(RECORDING_PHASE_SECONDS);
    recordingTimerRef.current = setInterval(() => {
      setRecordingTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(recordingTimerRef.current!);
          recordingTimerRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // === Auto-submit when recording stops and audioBlob is available ===
  useEffect(() => {
    if (phase === 'recording' && !isRecording && audioBlob && !hasSubmittedRef.current) {
      hasSubmittedRef.current = true;
      setPhase('submitting');

      const doSubmit = async () => {
        await submitAudioRecording(audioBlob, transcript, recordingTime);
      };
      doSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRecording, audioBlob, phase]);

  // === Also handle when recordingTimeLeft hits 0 (max duration timer in useAudioRecorder handles actual stop) ===
  useEffect(() => {
    if (phase === 'recording' && recordingTimeLeft === 0 && isRecording) {
      stopRecording();
      stopListening();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recordingTimeLeft, phase, isRecording]);

  // Manual submit
  const handleEarlySubmit = useCallback(() => {
    if (phase !== 'recording' || hasSubmittedRef.current) return;
    stopRecording();
    stopListening();
    // The useEffect above will handle submission when audioBlob is ready
  }, [phase, stopRecording, stopListening]);

  // Reset for next question
  const resetForNextQuestion = useCallback(() => {
    resetRecording();
    resetTranscript();
    setIsQuickSubmitting(false);
    hasSubmittedRef.current = false;
    setPhase('reading');
    setReadingTimeLeft(READING_PHASE_SECONDS);
    setRecordingTimeLeft(RECORDING_PHASE_SECONDS);
  }, [resetRecording, resetTranscript, setIsQuickSubmitting]);

  return {
    phase,
    readingTimeLeft,
    recordingTimeLeft,
    isRecording,
    recordingTime,
    audioBlob,
    transcript,
    isProcessing: isProcessing || isQuickSubmitting,
    formatTime,
    handleEarlySubmit,
    resetForNextQuestion,
  };
};
