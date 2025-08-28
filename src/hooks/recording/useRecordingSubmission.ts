
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { AudioAnalysisResult } from '@/utils/audioAnalysisUtils';
import { useAudioValidation } from './useAudioValidation';
import { RecordingFlowCallbacks } from './types';

export const useRecordingSubmission = (callbacks: RecordingFlowCallbacks) => {
  const [isQuickSubmitting, setIsQuickSubmitting] = useState<boolean>(false);
  const { validateAudioBlob, validateManualTranscript, showValidationError } = useAudioValidation();

  const submitAudioRecording = async (
    audioBlob: Blob,
    transcript: string,
    recordingTime: number
  ) => {
    const validationResult = validateAudioBlob(audioBlob, recordingTime);
    if (!validationResult.isValid) {
      showValidationError(validationResult);
      return;
    }

    console.log(`Submitting audio for immediate storage: ${audioBlob.size} bytes, transcript: ${transcript?.length || 0} chars`);
    
    try {
      setIsQuickSubmitting(true);
      console.log("Storing recording without analysis for batch processing at test completion");
      
      // Create minimal analysis object for storage
      const minimalAnalysis: AudioAnalysisResult = {
        wpm: 0, // Will be calculated during batch processing
        totalWords: transcript ? transcript.trim().split(/\s+/).length : 0,
        pauseCount: 0,
        pauseDuration: 0,
        pauseRatio: 0,
        speakingDuration: recordingTime, // seconds
        totalDuration: recordingTime
      };
      
      callbacks.onRecordingComplete(audioBlob, transcript, minimalAnalysis);
      setIsQuickSubmitting(false);
      
    } catch (error) {
      console.error("Storage error:", error);
      setIsQuickSubmitting(false);
      toast({
        title: "Storage Error",
        description: "Failed to save recording. Please try again.",
        variant: "destructive"
      });
    }
  };

  const submitManualTranscript = (manualTranscript: string) => {
    const validationResult = validateManualTranscript(manualTranscript);
    if (!validationResult.isValid) {
      showValidationError(validationResult);
      return;
    }
    
    // Create a minimal audio blob for manual entry
    const emptyBlob = new Blob([''], { type: 'audio/wav' });
    callbacks.onRecordingComplete(emptyBlob, manualTranscript);
  };

  const submitEmpty = () => {
    console.error("No audio or transcript to submit");
    toast({
      title: "No Response", 
      description: "Please record audio or enter text before submitting.",
      variant: "destructive"
    });
  };

  return {
    isQuickSubmitting,
    setIsQuickSubmitting,
    submitAudioRecording,
    submitManualTranscript,
    submitEmpty
  };
};
