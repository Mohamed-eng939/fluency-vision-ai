
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Mic, MicOff } from "lucide-react";
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { getWhisperXTranscription } from '@/utils/whisperXService';
import { toast } from "@/hooks/use-toast";
import { AudioAnalysisResult } from '@/utils/audio/types';

interface MicTestProps {
  onComplete: (audioBlob: Blob, transcript: string, analysis: AudioAnalysisResult | null) => void;
  onSkip?: () => void;
}

const MicTest: React.FC<MicTestProps> = ({ onComplete, onSkip }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recordingProgress, setRecordingProgress] = useState(0);
  const [referenceVoiceData, setReferenceVoiceData] = useState<{
    audioBlob: Blob;
    transcript: string;
    analysis: AudioAnalysisResult | null;
  } | null>(null);
  
  // Target recording duration (15 seconds)
  const TARGET_DURATION = 15;
  
  // Use our existing audio recorder hook
  const {
    isRecording,
    recordingTime,
    audioBlob,
    audioAnalysis,
    startRecording,
    stopRecording,
    resetRecording
  } = useAudioRecorder({
    autoStopSilenceMs: 5000 // 5 seconds silence auto-stop
  });
  
  // Update recording progress bar
  useEffect(() => {
    if (isRecording) {
      const progress = Math.min(100, (recordingTime / TARGET_DURATION) * 100);
      setRecordingProgress(progress);
      
      // Auto stop after target duration
      if (recordingTime >= TARGET_DURATION) {
        stopRecording();
      }
    }
  }, [recordingTime, isRecording, stopRecording]);
  
  // Function to handle starting the mic test
  const handleStartTest = async () => {
    resetRecording();
    setTranscript('');
    const success = await startRecording();
    if (!success) {
      toast({
        title: "Microphone access denied",
        description: "Please allow microphone access and try again.",
        variant: "destructive"
      });
    }
  };
  
  // Function to handle stopping the mic test
  const handleStopTest = async () => {
    stopRecording();
    
    if (!audioBlob) {
      toast({
        title: "No audio recorded",
        description: "Please try recording again.",
        variant: "destructive"
      });
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Process audio with WhisperX
      const whisperResult = await getWhisperXTranscription(audioBlob, 'reference-voice');
      
      if (whisperResult.transcription_failed) {
        throw new Error("Failed to transcribe audio");
      }
      
      // Store transcript
      setTranscript(whisperResult.transcript);
      
      // Store reference voice data
      const referenceData = {
        audioBlob,
        transcript: whisperResult.transcript,
        analysis: {
          wpm: (whisperResult.word_segments.length / whisperResult.total_duration) * 60,
          totalWords: whisperResult.word_segments.length,
          pauseCount: whisperResult.pause_durations.length,
          pauseDuration: whisperResult.silence_time,
          pauseRatio: whisperResult.total_duration > 0 
            ? whisperResult.silence_time / whisperResult.total_duration
            : 0,
          speakingDuration: whisperResult.speaking_time,
          totalDuration: whisperResult.total_duration,
          wordTimings: whisperResult.word_segments,
          pauseDurations: whisperResult.pause_durations
        } as AudioAnalysisResult
      };
      
      setReferenceVoiceData(referenceData);
      
      // Call onComplete with the reference data
      onComplete(audioBlob, whisperResult.transcript, referenceData.analysis);
      
      toast({
        title: "Microphone test successful",
        description: "Your voice has been recorded successfully."
      });
    } catch (error) {
      console.error("Mic test failed:", error);
      toast({
        title: "Mic test failed",
        description: "There was an issue processing your audio.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <div className="bg-white rounded-lg p-6 shadow-md space-y-4">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-800">Microphone Check</h2>
        <p className="text-gray-600 mt-2">
          Say something about yourself. For example:
          <br />
          <em className="font-medium">
            "Hi, my name is ___, and I'm going to tell you about myself."
          </em>
          <br />
          This helps us check your microphone and prepare for the test. This is not scored.
        </p>
      </div>
      
      {isRecording ? (
        // Recording in progress
        <div className="space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <div className="h-4 w-4 bg-red-500 rounded-full animate-pulse"></div>
            <span className="font-medium">Recording... {recordingTime}s</span>
          </div>
          <Progress value={recordingProgress} className="w-full" />
          <Button 
            variant="destructive" 
            className="w-full"
            onClick={handleStopTest}
          >
            <MicOff className="mr-2 h-4 w-4" /> Stop Recording
          </Button>
        </div>
      ) : audioBlob ? (
        // Recording complete
        <div className="space-y-4">
          <div className="rounded-lg bg-gray-50 p-3">
            <audio controls src={URL.createObjectURL(audioBlob)} className="w-full" />
          </div>
          
          {isProcessing ? (
            <div className="text-center py-2">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-gray-800"></div>
              <p className="mt-2 text-sm font-medium">Processing audio...</p>
            </div>
          ) : transcript ? (
            <div className="bg-gray-50 p-3 rounded-md">
              <h3 className="font-medium text-gray-700 mb-1">Transcript:</h3>
              <p className="text-sm">{transcript}</p>
            </div>
          ) : null}
          
          <div className="flex flex-wrap gap-3 justify-between">
            <Button 
              variant="outline" 
              onClick={handleStartTest}
            >
              <Mic className="mr-2 h-4 w-4" /> Record Again
            </Button>
            <Button 
              onClick={() => {
                if (referenceVoiceData) {
                  onComplete(
                    referenceVoiceData.audioBlob, 
                    referenceVoiceData.transcript, 
                    referenceVoiceData.analysis
                  );
                } else if (onSkip) {
                  onSkip();
                }
              }}
            >
              Continue to Assessment
            </Button>
          </div>
        </div>
      ) : (
        // Ready to record
        <div className="space-y-4">
          <Button 
            className="w-full"
            onClick={handleStartTest}
          >
            <Mic className="mr-2 h-4 w-4" /> Start Recording
          </Button>
          
          {onSkip && (
            <Button 
              variant="outline" 
              className="w-full"
              onClick={onSkip}
            >
              Skip Mic Check
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default MicTest;
