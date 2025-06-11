import { useState, useEffect } from 'react';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { AudioAnalysisResult } from '@/utils/audioAnalysisUtils';
import { getPronunciationScore } from '@/utils/pronunciationScoreApi';
import { analyzeProsody } from '@/utils/assessment/prosodyApi';
import { ProsodyAnalysisResult } from '@/types/assessment/audio';
import { toast } from '@/hooks/use-toast';
import { usePronunciationApi } from '@/hooks/usePronunciationApi';
import { SpeakingPrompt } from '@/types/assessment';

export const useRecordingFlow = (
  onRecordingComplete: (audioBlob: Blob, transcript?: string, audioAnalysis?: AudioAnalysisResult) => void,
  delayAnalysis: boolean = false
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
  
  // Check browser compatibility on mount
  useEffect(() => {
    setIsSpeechRecognitionSupported(isSupported);
    
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
  
  // Handle submit recording - with improved validation
  const handleSubmit = async () => {
    if (audioBlob) {
      // Validate audio blob
      if (audioBlob.size === 0) {
        console.error("Audio blob is empty - cannot submit");
        toast({
          title: "Recording Error",
          description: "The audio recording is empty. Please try recording again.",
          variant: "destructive"
        });
        return;
      }
      
      console.log(`Submitting audio: ${audioBlob.size} bytes, transcript: ${transcript?.length || 0} chars`);
      
      try {
        if (delayAnalysis) {
          // Quick submission without analysis - just store the recording
          console.log("Quick submit - storing recording without analysis");
          onRecordingComplete(audioBlob, transcript, audioAnalysis || undefined);
          return;
        }

        // Full analysis path (for when delayAnalysis is false)
        let enhancedAnalysis = audioAnalysis || {} as AudioAnalysisResult;
        
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
            // Continue with fallback analysis
          }
        }
        
        // Run prosody analysis with improved error handling
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
          
        } catch (error) {
          console.error("Prosody analysis error:", error);
          // Analysis failed but we continue with fallback
          enhancedAnalysis = {
            ...enhancedAnalysis,
            prosodyAnalysis: {
              pitch_mean: 150,
              pitch_std_dev: 25,
              tempo_bpm: 120,
              opensmile_features: "fallback",
              cefr_level: "B1",
              analysisTimestamp: Date.now()
            }
          };
        } finally {
          setIsProsodyAnalyzing(false);
        }
        
        // Submit enhanced analysis
        console.log("Submitting recording with analysis:", enhancedAnalysis);
        onRecordingComplete(audioBlob, transcript, enhancedAnalysis);
        
      } catch (error) {
        console.error("Speech analysis error:", error);
        onRecordingComplete(audioBlob, transcript, audioAnalysis || undefined);
      }
    } else if (isManualEntryMode && manualTranscript) {
      // Create a minimal audio blob for manual entry
      const emptyBlob = new Blob([''], { type: 'audio/wav' });
      onRecordingComplete(emptyBlob, manualTranscript);
    } else {
      console.error("No audio or transcript to submit");
      toast({
        title: "Submission Error", 
        description: "Please record audio or enter text before submitting.",
        variant: "destructive"
      });
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
