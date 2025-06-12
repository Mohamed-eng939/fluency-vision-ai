
import { toast } from '@/hooks/use-toast';
import { AudioValidationResult } from './types';

export const useAudioValidation = () => {
  const validateAudioBlob = (audioBlob: Blob, recordingTime: number): AudioValidationResult => {
    // Enhanced validation with user feedback
    if (audioBlob.size === 0) {
      console.error("Audio blob is empty - cannot submit");
      return {
        isValid: false,
        errorTitle: "Recording Error",
        errorMessage: "The audio recording is empty. Please try recording again."
      };
    }
    
    // Minimum recording length check
    if (audioBlob.size < 1000) { // Less than ~1KB indicates very short recording
      return {
        isValid: false,
        errorTitle: "Recording Too Short",
        errorMessage: "Please record a longer response (at least 3-5 seconds)."
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
