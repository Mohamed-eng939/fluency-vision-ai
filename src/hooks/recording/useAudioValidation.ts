
import { toast } from '@/hooks/use-toast';
import { AudioValidationResult } from './types';

export const useAudioValidation = () => {
  const validateAudioBlob = (audioBlob: Blob, recordingTime: number): AudioValidationResult => {
    console.log('Validating audio blob:', {
      size: audioBlob.size,
      type: audioBlob.type,
      recordingTime
    });
    
    // Enhanced validation with user feedback
    if (!audioBlob || audioBlob.size === 0) {
      console.error("Audio blob is empty - cannot submit");
      return {
        isValid: false,
        errorTitle: "Recording Error",
        errorMessage: "The audio recording is empty. Please check your microphone and try recording again."
      };
    }
    
    // Minimum recording length check - reduced threshold for compressed audio
    if (audioBlob.size < 100) { // Very small threshold to account for different formats
      return {
        isValid: false,
        errorTitle: "Recording Too Short",
        errorMessage: "The recording appears to be too short. Please record a longer response."
      };
    }
    
    // Check recording duration
    if (recordingTime < 1) {
      return {
        isValid: false,
        errorTitle: "Recording Too Short", 
        errorMessage: "Please record for at least 1 second."
      };
    }
    
    return { isValid: true };
  };

  const validateManualTranscript = (transcript: string): AudioValidationResult => {
    if (transcript.trim().length < 10) {
      return {
        isValid: false,
        errorTitle: "Response Too Short",
        errorMessage: "Please provide a more detailed written response."
      };
    }
    
    return { isValid: true };
  };

  const showValidationError = (result: AudioValidationResult) => {
    if (!result.isValid && result.errorTitle && result.errorMessage) {
      toast({
        title: result.errorTitle,
        description: result.errorMessage,
        variant: "destructive"
      });
    }
  };

  return {
    validateAudioBlob,
    validateManualTranscript,
    showValidationError
  };
};
