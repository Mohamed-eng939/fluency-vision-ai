
import React, { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { SpeakingPrompt } from '@/types/assessment';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import PromptAudioControls from './assessment/PromptAudioControls';
import RecordingControls from './assessment/RecordingControls';
import AudioSubmission from './assessment/AudioSubmission';

interface RecordingSectionProps {
  prompt: SpeakingPrompt | null;
  onRecordingComplete: (audioBlob: Blob, transcript?: string) => void;
}

const RecordingSection: React.FC<RecordingSectionProps> = ({ prompt, onRecordingComplete }) => {
  const {
    isRecording,
    recordingTime,
    audioBlob,
    startRecording,
    stopRecording,
    resetRecording,
    formatTime
  } = useAudioRecorder({
    autoStopSilenceMs: 2000 // Auto-stop after 2 seconds of silence
  });
  
  const { 
    transcript, 
    isListening, 
    startListening, 
    stopListening, 
    resetTranscript 
  } = useSpeechRecognition();
  
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
      onRecordingComplete(audioBlob, transcript);
    }
  };
  
  // Handle reset recording
  const handleReset = () => {
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
          
          {!isRecording && !audioBlob && (
            <RecordingControls 
              isRecording={false}
              recordingTime={recordingTime}
              onStartRecording={handleStartRecording}
              onStopRecording={handleStopRecording}
              formatTime={formatTime}
            />
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
        </div>
      </CardContent>
    </Card>
  );
};

export default RecordingSection;
