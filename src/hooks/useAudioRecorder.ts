
import { useState, useRef } from 'react';
import { VoiceActivityDetector } from '@/utils/speechAnalysisUtils';
import { analyzeAudioFeatures, AudioAnalysisResult } from '@/utils/audioAnalysisUtils';
import { convertToWav } from '@/utils/audio/convertToWav';

interface UseAudioRecorderOptions {
  onRecordingComplete?: (blob: Blob, analysis?: AudioAnalysisResult) => void;
  autoStopSilenceMs?: number; // Time in ms to auto-stop after silence
}

export const useAudioRecorder = (options: UseAudioRecorderOptions = {}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioAnalysis, setAudioAnalysis] = useState<AudioAnalysisResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const vadRef = useRef<VoiceActivityDetector | null>(null);
  
  // Default to 4 seconds of silence (increased from 2 seconds)
  const silenceTimeThreshold = options.autoStopSilenceMs || 4000;
  
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1
        }
      });
      streamRef.current = stream;
      
      // Monitor microphone track state
      const firstTrack = stream.getAudioTracks()[0];
      if (firstTrack) {
        try {
          const settings = (firstTrack as any).getSettings ? (firstTrack as any).getSettings() : {};
          console.log('Audio track settings:', settings);
        } catch {}
        firstTrack.onmute = () => console.warn('Microphone track muted by the system or browser');
        firstTrack.onunmute = () => console.log('Microphone track unmuted');
        if ((firstTrack as any).muted) {
          console.warn('Microphone track currently muted. Please check OS/browser input settings.');
        }
      }
      
      // Determine supported MIME type
      let mimeType = 'audio/webm';
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4';
      } else if (MediaRecorder.isTypeSupported('audio/wav')) {
        mimeType = 'audio/wav';
      }
      
      console.log('Using MediaRecorder with MIME type:', mimeType);
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType, audioBitsPerSecond: 128000 });
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (e) => {
        console.log('Data available, chunk size:', e.data.size);
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };
      
      mediaRecorderRef.current.onstop = async () => {
        console.log('MediaRecorder stopped, chunks:', audioChunksRef.current.length);
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        console.log('Created blob, size:', audioBlob.size);
        
        // Normalize to WAV for consistent playback across browsers
        let finalBlob = audioBlob;
        try {
          const wavBlob = await convertToWav(audioBlob);
          if (wavBlob && wavBlob.size > 0) {
            finalBlob = wavBlob;
            console.log('Normalized recording to WAV, size:', finalBlob.size);
          } else {
            console.warn('WAV conversion returned empty blob, keeping original recording');
          }
        } catch (convErr) {
          console.error('Failed to convert audio to WAV, keeping original:', convErr);
        }

        setAudioBlob(finalBlob);
        
        // Process audio features
        setIsProcessing(true);
        try {
          const analysis = await analyzeAudioFeatures(finalBlob);
          setAudioAnalysis(analysis);
          
          if (options.onRecordingComplete) {
            options.onRecordingComplete(finalBlob, analysis);
          }
        } catch (error) {
          console.error("Error analyzing audio:", error);
        } finally {
          setIsProcessing(false);
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
      
      // Start recording with time slices to ensure data events fire
      mediaRecorderRef.current.start(1000); // Request data every 1000ms
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
    setAudioAnalysis(null);
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
    audioAnalysis,
    isProcessing,
    startRecording,
    stopRecording,
    resetRecording,
    formatTime
  };
};
