
import React, { useState } from 'react';
import { SpeakingPrompt } from '@/types/assessment';
import { AudioAnalysisResult } from '@/utils/audioAnalysisUtils';

// Import components
import RecordingContainer from './assessment/RecordingContainer';
import RecordingFlowController from './assessment/RecordingFlowController';
import RecordingStatus from './assessment/RecordingStatus';
import MicTest from './assessment/MicTest';

interface RecordingSectionProps {
  prompt: SpeakingPrompt | null;
  onRecordingComplete: (audioBlob: Blob, transcript?: string, audioAnalysis?: AudioAnalysisResult) => void;
}

const RecordingSection: React.FC<RecordingSectionProps> = ({ prompt, onRecordingComplete }) => {
  // Whether the user needs to complete the mic test
  const [showMicTest, setShowMicTest] = useState(true);
  // Reference voice data for speaker verification
  const [referenceVoice, setReferenceVoice] = useState<{
    audioBlob: Blob;
    transcript: string;
    analysis: AudioAnalysisResult | null;
  } | null>(null);
  
  const [isProcessing, setIsProcessing] = useState(false);
  
  if (!prompt) return null;
  
  const handleMicTestComplete = (audioBlob: Blob, transcript: string, analysis: AudioAnalysisResult | null) => {
    // Store reference voice data for future speaker verification
    setReferenceVoice({
      audioBlob,
      transcript,
      analysis
    });
    
    // Hide mic test and show main recording interface
    setShowMicTest(false);
  };
  
  const skipMicTest = () => {
    setShowMicTest(false);
  };
  
  const handleRecordingComplete = (audioBlob: Blob, transcript?: string, audioAnalysis?: AudioAnalysisResult) => {
    setIsProcessing(true);
    
    // Add a small delay to simulate processing
    setTimeout(() => {
      onRecordingComplete(audioBlob, transcript, audioAnalysis);
      setIsProcessing(false);
    }, 500);
  };
  
  return (
    <div>
      {showMicTest ? (
        <MicTest 
          onComplete={handleMicTestComplete}
          onSkip={skipMicTest}
        />
      ) : (
        <>
          <RecordingFlowController
            selectedPrompt={prompt}
            onComplete={handleRecordingComplete}
            onCancel={() => {}}
            isProcessing={isProcessing}
          />
          
          <RecordingStatus isProcessing={isProcessing} />
        </>
      )}
    </div>
  );
};

export default RecordingSection;
