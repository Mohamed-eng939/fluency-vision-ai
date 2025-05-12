
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { SpeakingPrompt } from '@/types/assessment';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import PromptAudioControls from './assessment/PromptAudioControls';
import RecordingControls from './assessment/RecordingControls';
import AudioSubmission from './assessment/AudioSubmission';
import ManualTranscriptEntry from './assessment/ManualTranscriptEntry';
import { AudioAnalysisResult } from '@/utils/audioAnalysisUtils';

interface RecordingSectionProps {
  prompt: SpeakingPrompt | null;
  onRecordingComplete: (audioBlob: Blob, transcript?: string, audioAnalysis?: AudioAnalysisResult) => void;
}

const RecordingSection: React.FC<RecordingSectionProps> = ({ prompt, onRecordingComplete }) => {
  const [isSpeechRecognitionSupported, setIsSpeechRecognitionSupported] = useState<boolean>(true);
  const [isManualEntryMode, setIsManualEntryMode] = useState<boolean>(false);
  
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
    autoStopSilenceMs: 4000 // Auto-stop after 4 seconds of silence (increased from 2 seconds)
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
  
  // Handle submit recording
  const handleSubmit = () => {
    if (audioBlob) {
      onRecordingComplete(audioBlob, transcript, audioAnalysis || undefined);
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
        <div className="text-lg font-medium mb-6 text-assessment-blue">
          {prompt.text}
        </div>
        
        <div className="mb-4">
          <PromptAudioControls text={prompt.text} />
        </div>
        
        <div className="mb-4">
          <div className="text-sm text-gray-500 mb-2">
            Category: <span className="text-assessment-blue">{prompt.category}</span> | 
            Difficulty: <span className="text-assessment-blue">{prompt.difficulty}</span> | 
            Time: <span className="text-assessment-blue">{prompt.timeLimit} min</span>
          </div>
          
          {/* Show recording controls or manual entry based on mode */}
          {!isManualEntryMode ? (
            <>
              {!isRecording && !audioBlob && (
                <div className="space-y-4">
                  <RecordingControls 
                    isRecording={false}
                    recordingTime={recordingTime}
                    onStartRecording={handleStartRecording}
                    onStopRecording={handleStopRecording}
                    formatTime={formatTime}
                  />
                  
                  {/* Option to switch to manual entry */}
                  <div className="mt-4 text-center">
                    <button 
                      onClick={toggleEntryMode}
                      className="text-sm text-gray-500 underline hover:text-assessment-blue"
                    >
                      Switch to manual entry
                    </button>
                  </div>
                </div>
              )}
              
              {isRecording && (
                <RecordingControls 
                  isRecording={true}
                  recordingTime={recordingTime}
                  onStartRecording={handleStartRecording}
                  onStopRecording={handleStopRecording}
                  formatTime={formatTime}
                />
              )}
              
              {transcript && isRecording && (
                <div className="bg-gray-50 p-3 rounded-md text-sm italic mt-4">
                  <div className="font-medium text-gray-700 mb-1">Transcript (real-time):</div>
                  {transcript}
                </div>
              )}
              
              {audioBlob && (
                <AudioSubmission
                  audioBlob={audioBlob}
                  transcript={transcript}
                  onSubmit={handleSubmit}
                  onReset={handleReset}
                />
              )}
            </>
          ) : (
            <>
              <ManualTranscriptEntry 
                onTranscriptSubmit={handleManualTranscriptSubmit}
                onAudioSubmit={handleManualAudioSubmit}
              />
              
              {/* Option to switch back to recording mode if supported */}
              {isSpeechRecognitionSupported && (
                <div className="mt-4 text-center">
                  <button 
                    onClick={toggleEntryMode}
                    className="text-sm text-gray-500 underline hover:text-assessment-blue"
                  >
                    Switch to recording mode
                  </button>
                </div>
              )}
            </>
          )}
          
          {isProcessing && (
            <div className="mt-4 text-center">
              <div className="animate-pulse text-assessment-blue">
                <p>Analyzing audio features...</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecordingSection;
