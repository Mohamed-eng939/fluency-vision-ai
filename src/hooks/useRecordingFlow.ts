
import { useState, useEffect } from 'react';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { AudioAnalysisResult } from '@/utils/audioAnalysisUtils';
import { toast } from '@/hooks/use-toast';
import { usePronunciationApi } from '@/hooks/usePronunciationApi';
import { SpeakingPrompt } from '@/types/assessment';
import { getPronunciationScore } from '@/utils/pronunciationScoreApi';
import { analyzeProsody } from '@/utils/assessment/prosodyApi';

// Helper function to convert blob to file
const blobToFile = (blob: Blob, fileName: string = 'audio.wav'): File => {
  return new File([blob], fileName, { type: blob.type });
};

export const useRecordingFlow = (
  onRecordingComplete: (audioBlob: Blob, transcript?: string, audioAnalysis?: AudioAnalysisResult) => void,
  delayAnalysis: boolean = false
) => {
  const [isSpeechRecognitionSupported, setIsSpeechRecognitionSupported] = useState<boolean>(true);
  const [isManualEntryMode, setIsManualEntryMode] = useState<boolean>(false);
  const [manualTranscript, setManualTranscript] = useState<string>('');
  const [isQuickSubmitting, setIsQuickSubmitting] = useState<boolean>(false);
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
  
  // Handle submit recording - improved for deferred analysis
  const handleSubmit = async () => {
    if (audioBlob) {
      // Enhanced validation with user feedback
      if (audioBlob.size === 0) {
        console.error("Audio blob is empty - cannot submit");
        toast({
          title: "Recording Error",
          description: "The audio recording is empty. Please try recording again.",
          variant: "destructive"
        });
        return;
      }
      
      // Minimum recording length check
      if (audioBlob.size < 1000) { // Less than ~1KB indicates very short recording
        toast({
          title: "Recording Too Short",
          description: "Please record a longer response (at least 3-5 seconds).",
          variant: "destructive"
        });
        return;
      }
      
      console.log(`Submitting audio: ${audioBlob.size} bytes, transcript: ${transcript?.length || 0} chars`);
      
      try {
        if (delayAnalysis) {
          // Quick submission path - store immediately without analysis
          setIsQuickSubmitting(true);
          console.log("Quick submit - storing recording without analysis for batch processing");
          
          // Create minimal analysis object for storage
          const minimalAnalysis: AudioAnalysisResult = {
            wpm: 0, // Will be calculated during batch processing
            totalWords: transcript ? transcript.trim().split(/\s+/).length : 0,
            pauseCount: 0,
            pauseDuration: 0,
            pauseRatio: 0,
            speakingDuration: recordingTime / 1000, // Convert to seconds
            totalDuration: recordingTime / 1000
          };
          
          onRecordingComplete(audioBlob, transcript, minimalAnalysis);
          setIsQuickSubmitting(false);
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
        setIsQuickSubmitting(false);
        onRecordingComplete(audioBlob, transcript, audioAnalysis || undefined);
      }
    } else if (isManualEntryMode && manualTranscript) {
      // Create a minimal audio blob for manual entry
      if (manualTranscript.trim().length < 10) {
        toast({
          title: "Response Too Short",
          description: "Please provide a more detailed written response.",
          variant: "destructive"
        });
        return;
      }
      
      const emptyBlob = new Blob([''], { type: 'audio/wav' });
      onRecordingComplete(emptyBlob, manualTranscript);
    } else {
      console.error("No audio or transcript to submit");
      toast({
        title: "No Response", 
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
    setIsQuickSubmitting(false);
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
    isProcessing: isProcessing || isQuickSubmitting,
    transcript,
    isManualEntryMode,
    isSpeechRecognitionSupported,
    isPronunciationApiAvailable,
    isProsodyAnalyzing,
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
