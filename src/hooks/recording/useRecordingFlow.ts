
import { useState, useEffect } from 'react';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { AudioAnalysisResult } from '@/utils/audioAnalysisUtils';
import { usePronunciationApi } from '@/hooks/usePronunciationApi';
import { useManualEntryState } from './useManualEntryState';
import { useRecordingSubmission } from './useRecordingSubmission';
import { RecordingFlowCallbacks } from './types';

export const useRecordingFlow = (
  onRecordingComplete: (audioBlob: Blob, transcript?: string, audioAnalysis?: AudioAnalysisResult) => void,
  delayAnalysis: boolean = true // Always defer analysis for assessment flow
) => {
  const [isSpeechRecognitionSupported, setIsSpeechRecognitionSupported] = useState<boolean>(true);
  const { isPronunciationApiAvailable } = usePronunciationApi();
  
  const callbacks: RecordingFlowCallbacks = {
    onRecordingComplete,
    delayAnalysis
  };
  
  const {
    isRecording,
    recordingTime,
    audioBlob,
    audioAnalysis,
    isProcessing,
    startRecording,
    stopRecording,
    resetRecording,
    formatTime
  } = useAudioRecorder({
    autoStopSilenceMs: 4000
  });
  
  const { 
    transcript, 
    isListening, 
    startListening, 
    stopListening, 
    resetTranscript, 
    isSupported 
  } = useSpeechRecognition();

  const {
    isManualEntryMode,
    manualTranscript,
    setManualTranscript,
    toggleEntryMode,
    resetManualEntry
  } = useManualEntryState(isSupported);

  const {
    isQuickSubmitting,
    setIsQuickSubmitting,
    submitAudioRecording,
    submitManualTranscript,
    submitEmpty
  } = useRecordingSubmission(callbacks);
  
  // Check browser compatibility on mount
  useEffect(() => {
    setIsSpeechRecognitionSupported(isSupported);
  }, [isSupported]);
  
  // Handle start recording with speech recognition
  const handleStartRecording = async () => {
    const started = await startRecording();
    if (started) {
      startListening();
    }
  };
  
  // Handle stop recording
  const handleStopRecording = () => {
    stopRecording();
    stopListening();
  };
  
  // Handle submit recording - immediate storage without analysis
  const handleSubmit = async () => {
    if (audioBlob) {
      await submitAudioRecording(audioBlob, transcript, recordingTime);
    } else if (isManualEntryMode && manualTranscript) {
      submitManualTranscript(manualTranscript);
    } else {
      submitEmpty();
    }
  };
  
  // Handle reset recording
  const handleReset = () => {
    resetRecording();
    resetTranscript();
    resetManualEntry();
    setIsQuickSubmitting(false);
  };
  
  return {
    // State
    isRecording,
    recordingTime,
    audioBlob,
    audioAnalysis,
    isProcessing: isProcessing || isQuickSubmitting,
    transcript,
    isManualEntryMode,
    isSpeechRecognitionSupported,
    isPronunciationApiAvailable,
    manualTranscript,
    isQuickSubmitting,
    
    // Actions
    handleStartRecording,
    handleStopRecording,
    handleSubmit,
    handleReset,
    setManualTranscript,
    toggleEntryMode,
    formatTime
  };
};
