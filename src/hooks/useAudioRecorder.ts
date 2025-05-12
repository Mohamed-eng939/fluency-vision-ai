
import { useState, useRef } from 'react';
import { VoiceActivityDetector } from '@/utils/speechAnalysisUtils';

interface UseAudioRecorderOptions {
  onRecordingComplete?: (blob: Blob) => void;
  autoStopSilenceMs?: number; // Time in ms to auto-stop after silence
}

export const useAudioRecorder = (options: UseAudioRecorderOptions = {}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const vadRef = useRef<VoiceActivityDetector | null>(null);
  
  // Default to 4 seconds of silence (increased from 2 seconds)
  const silenceTimeThreshold = options.autoStopSilenceMs || 4000;
  
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };
      
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
        
        if (options.onRecordingComplete) {
          options.onRecordingComplete(audioBlob);
        }
        
        // Stop all tracks on the stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
        
        // Clean up VAD
        if (vadRef.current) {
          vadRef.current.stop();
          vadRef.current = null;
        }
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      // Initialize voice activity detection
      if (silenceTimeThreshold > 0) {
        vadRef.current = new VoiceActivityDetector({
          silenceTimeThreshold: silenceTimeThreshold
        });
        
        vadRef.current.setOnSpeechEnd(() => {
          console.log(`Auto-stopping recording after ${silenceTimeThreshold/1000} seconds of silence detected`);
          stopRecording();
        });
        
        vadRef.current.init(stream);
      }
      
      return true;
    } catch (err) {
      console.error("Error accessing microphone:", err);
      return false;
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      
      // Clear timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      setIsRecording(false);
      return true;
    }
    return false;
  };
  
  const resetRecording = () => {
    setAudioBlob(null);
    setRecordingTime(0);
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  return {
    isRecording,
    recordingTime,
    audioBlob,
    startRecording,
    stopRecording,
    resetRecording,
    formatTime
  };
};
