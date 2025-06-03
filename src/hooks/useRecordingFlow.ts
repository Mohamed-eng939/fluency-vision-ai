
import { useState, useEffect } from 'react';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { AudioAnalysisResult } from '@/utils/audioAnalysisUtils';
import { getPronunciationScore } from '@/utils/pronunciationScoreApi';
import { analyzeProsody, ProsodyAnalysisResult } from '@/utils/assessment/prosodyApi';
import { toast } from '@/hooks/use-toast';
import { usePronunciationApi } from '@/hooks/usePronunciationApi';
import { SpeakingPrompt } from '@/types/assessment';

export const useRecordingFlow = (
  onRecordingComplete: (audioBlob: Blob, transcript?: string, audioAnalysis?: AudioAnalysisResult) => void
) => {
  const [isSpeechRecognitionSupported, setIsSpeechRecognitionSupported] = useState<boolean>(true);
  const [isManualEntryMode, setIsManualEntryMode] = useState<boolean>(false);
  const [manualTranscript, setManualTranscript] = useState<string>('');
  const [isProsodyAnalyzing, setIsProsodyAnalyzing] = useState<boolean>(false);
  const { isPronunciationApiAvailable } = usePronunciationApi();
  
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
    autoStopSilenceMs: 4000 // Auto-stop after 4 seconds of silence
  });
  
  const { 
    transcript, 
    isListening, 
    startListening, 
    stopListening, 
    resetTranscript, 
    isSupported 
  } = useSpeechRecognition();
  
  // Check browser compatibility on mount
  useEffect(() => {
    setIsSpeechRecognitionSupported(isSupported);
    
    // If speech recognition is not supported, switch to manual entry mode
    if (!isSupported) {
      setIsManualEntryMode(true);
    }
  }, [isSupported]);
  
  // Convert blob to file for prosody analysis
  const blobToFile = (blob: Blob): File => {
    return new File([blob], 'recording.wav', { type: 'audio/wav' });
  };
  
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
  
  // Handle submit recording with enhanced pronunciation and prosody scoring
  const handleSubmit = async () => {
    if (audioBlob) {
      try {
        let enhancedAnalysis = audioAnalysis || {} as AudioAnalysisResult;
        
        // Show processing toast
        toast({
          title: "Analyzing speech",
          description: "Analyzing pronunciation and prosody...",
        });
        
        // Run pronunciation analysis if available
        if (isPronunciationApiAvailable && transcript) {
          try {
            const pronunciationResult = await getPronunciationScore(
              audioBlob, 
              transcript, 
              audioAnalysis || {} as AudioAnalysisResult
            );
            
            enhancedAnalysis = {
              ...enhancedAnalysis,
              pronunciationScore: pronunciationResult.score,
              pronunciationDetails: {
                ...enhancedAnalysis.pronunciationDetails,
                pronunciation_score: pronunciationResult.score,
                cefr_level: pronunciationResult.cefrLevel,
                ...pronunciationResult.details
              }
            };
          } catch (error) {
            console.error("Pronunciation analysis error:", error);
          }
        }
        
        // Run prosody analysis
        setIsProsodyAnalyzing(true);
        try {
          const audioFile = blobToFile(audioBlob);
          const prosodyResult = await analyzeProsody(audioFile);
          
          enhancedAnalysis = {
            ...enhancedAnalysis,
            prosodyAnalysis: {
              ...prosodyResult,
              analysisTimestamp: Date.now()
            }
          };
          
          toast({
            title: "Analysis complete",
            description: `Prosody CEFR level: ${prosodyResult.cefr_level || 'Unknown'}`,
          });
        } catch (error) {
          console.error("Prosody analysis error:", error);
          toast({
            title: "Prosody analysis failed",
            description: "Using fallback analysis methods.",
            variant: "destructive"
          });
        } finally {
          setIsProsodyAnalyzing(false);
        }
        
        // Submit enhanced analysis
        onRecordingComplete(audioBlob, transcript, enhancedAnalysis);
        
      } catch (error) {
        console.error("Speech analysis error:", error);
        onRecordingComplete(audioBlob, transcript, audioAnalysis || undefined);
        
        toast({
          title: "Analysis failed",
          description: "Using basic scoring method instead.",
          variant: "destructive"
        });
      }
    } else if (isManualEntryMode && manualTranscript) {
      // Create an empty audio blob if none exists
      const emptyBlob = new Blob([], { type: 'audio/wav' });
      onRecordingComplete(emptyBlob, manualTranscript);
    }
  };
  
  // Handle reset recording
  const handleReset = () => {
    resetRecording();
    resetTranscript();
    setManualTranscript('');
    setIsProsodyAnalyzing(false);
  };
  
  // Toggle between recording and manual entry modes
  const toggleEntryMode = () => {
    setIsManualEntryMode(!isManualEntryMode);
    handleReset();
  };
  
  return {
    // State
    isRecording,
    recordingTime,
    audioBlob,
    audioAnalysis,
    isProcessing: isProcessing || isProsodyAnalyzing,
    transcript,
    isManualEntryMode,
    isSpeechRecognitionSupported,
    isPronunciationApiAvailable,
    isProsodyAnalyzing,
    manualTranscript,
    
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
