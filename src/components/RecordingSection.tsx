
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { SpeakingPrompt } from '@/types/assessment';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { AudioAnalysisResult } from '@/utils/audioAnalysisUtils';
import { getPronunciationScore } from '@/utils/pronunciationScoreApi';
import { toast } from '@/hooks/use-toast';
import { usePronunciationApi } from '@/hooks/usePronunciationApi';

// Import refactored components
import PromptAudioControls from './assessment/PromptAudioControls';
import PromptHeader from './assessment/PromptHeader';
import ApiStatusIndicator from './assessment/ApiStatusIndicator';
import RecordingFlowController from './assessment/RecordingFlowController';
import ManualEntryController from './assessment/ManualEntryController';
import RecordingStatus from './assessment/RecordingStatus';

interface RecordingSectionProps {
  prompt: SpeakingPrompt | null;
  onRecordingComplete: (audioBlob: Blob, transcript?: string, audioAnalysis?: AudioAnalysisResult) => void;
}

const RecordingSection: React.FC<RecordingSectionProps> = ({ prompt, onRecordingComplete }) => {
  const [isSpeechRecognitionSupported, setIsSpeechRecognitionSupported] = useState<boolean>(true);
  const [isManualEntryMode, setIsManualEntryMode] = useState<boolean>(false);
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
  
  // Handle submit recording with enhanced pronunciation scoring
  const handleSubmit = async () => {
    if (audioBlob) {
      try {
        if (isPronunciationApiAvailable && transcript) {
          // Show processing toast
          toast({
            title: "Analyzing pronunciation",
            description: "This may take a few seconds...",
          });
          
          // Get enhanced pronunciation score from the API
          const pronunciationResult = await getPronunciationScore(
            audioBlob, 
            transcript, 
            audioAnalysis || {} as AudioAnalysisResult
          );
          
          // Create enhanced audio analysis with pronunciation data
          const enhancedAnalysis = {
            ...(audioAnalysis || {}),
            pronunciationScore: pronunciationResult.score,
            cefrLevel: pronunciationResult.cefrLevel,
            pronunciationDetails: pronunciationResult.details
          };
          
          // Submit enhanced analysis
          onRecordingComplete(audioBlob, transcript, enhancedAnalysis as any);
          
          // Show success toast
          toast({
            title: "Pronunciation analysis complete",
            description: `Score: ${pronunciationResult.score.toFixed(1)}/10 (${pronunciationResult.cefrLevel})`,
          });
          
        } else {
          // Fallback to basic analysis
          onRecordingComplete(audioBlob, transcript, audioAnalysis || undefined);
        }
      } catch (error) {
        console.error("Pronunciation analysis error:", error);
        // Fallback to basic analysis on error
        onRecordingComplete(audioBlob, transcript, audioAnalysis || undefined);
        
        // Show error toast
        toast({
          title: "Pronunciation analysis failed",
          description: "Using fallback scoring method instead.",
          variant: "destructive"
        });
      }
    }
  };
  
  // Handle reset recording
  const handleReset = () => {
    resetRecording();
    resetTranscript();
  };
  
  // Handle manual transcript entry
  const handleManualTranscriptSubmit = (manualTranscript: string) => {
    if (!audioBlob) {
      // Create an empty audio blob if none exists
      const emptyBlob = new Blob([], { type: 'audio/wav' });
      onRecordingComplete(emptyBlob, manualTranscript);
    } else {
      onRecordingComplete(audioBlob, manualTranscript);
    }
  };
  
  // Handle manual audio submission
  const handleManualAudioSubmit = (uploadedAudioBlob: Blob) => {
    setIsManualEntryMode(true);
    if (uploadedAudioBlob) {
      onRecordingComplete(uploadedAudioBlob, transcript);
    }
  };
  
  // Toggle between recording and manual entry modes
  const toggleEntryMode = () => {
    setIsManualEntryMode(!isManualEntryMode);
    resetRecording();
    resetTranscript();
  };
  
  if (!prompt) return null;
  
  return (
    <Card className="mb-8 border-assessment-teal/20">
      <CardContent className="p-6">
        <PromptHeader prompt={prompt} />
        
        <div className="mb-4">
          <PromptAudioControls text={prompt.text} />
        </div>
        
        <div className="mb-4">
          <ApiStatusIndicator isApiAvailable={isPronunciationApiAvailable} />
          
          <RecordingFlowController
            isManualEntryMode={isManualEntryMode}
            isRecording={isRecording}
            recordingTime={recordingTime}
            audioBlob={audioBlob}
            transcript={transcript}
            isSpeechRecognitionSupported={isSpeechRecognitionSupported}
            onStartRecording={handleStartRecording}
            onStopRecording={handleStopRecording}
            onSubmit={handleSubmit}
            onReset={handleReset}
            onToggleEntryMode={toggleEntryMode}
            formatTime={formatTime}
          />
          
          <ManualEntryController
            isManualEntryMode={isManualEntryMode}
            isSpeechRecognitionSupported={isSpeechRecognitionSupported}
            onTranscriptSubmit={handleManualTranscriptSubmit}
            onAudioSubmit={handleManualAudioSubmit}
            onToggleEntryMode={toggleEntryMode}
          />
          
          <RecordingStatus isProcessing={isProcessing} />
        </div>
      </CardContent>
    </Card>
  );
};

export default RecordingSection;
