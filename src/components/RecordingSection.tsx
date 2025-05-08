
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { toast } from '../components/ui/use-toast';
import { SpeakingPrompt } from '../types/assessment';

interface RecordingSectionProps {
  prompt: SpeakingPrompt | null;
  onRecordingComplete: (audioBlob: Blob) => void;
}

const RecordingSection: React.FC<RecordingSectionProps> = ({ prompt, onRecordingComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [visualizerData, setVisualizerData] = useState<number[]>(Array(30).fill(0));
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    return () => {
      // Cleanup
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);
  
  const startRecording = async () => {
    if (!prompt) {
      toast({
        title: "No prompt selected",
        description: "Please select a speaking prompt before recording.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      
      source.connect(analyser);
      analyserRef.current = analyser;
      
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      dataArrayRef.current = dataArray;
      
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      
      audioChunksRef.current = [];
      recorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      
      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        onRecordingComplete(audioBlob);
      };
      
      recorder.start();
      setIsRecording(true);
      setTimeLeft(prompt.timeLimit);
      
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            stopRecording();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      // Start visualizer
      updateVisualizer();
      
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Microphone access denied",
        description: "Please allow microphone access to record your speech.",
        variant: "destructive"
      });
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      setIsRecording(false);
      setTimeLeft(0);
    }
  };
  
  const togglePause = () => {
    if (isPaused) {
      // Resume
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.resume();
      }
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            stopRecording();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      updateVisualizer();
    } else {
      // Pause
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.pause();
      }
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }
    
    setIsPaused(!isPaused);
  };
  
  const updateVisualizer = () => {
    if (!analyserRef.current || !dataArrayRef.current) return;
    
    analyserRef.current.getByteFrequencyData(dataArrayRef.current);
    const data = [...dataArrayRef.current];
    
    // Get average levels for visualization
    const numberOfBars = 30;
    const segmentLength = Math.floor(data.length / numberOfBars);
    
    const reducedData = [];
    for (let i = 0; i < numberOfBars; i++) {
      const startIndex = i * segmentLength;
      const segment = data.slice(startIndex, startIndex + segmentLength);
      const average = segment.reduce((a, b) => a + b, 0) / segment.length;
      reducedData.push(Math.min(100, average));
    }
    
    setVisualizerData(reducedData);
    
    animationFrameRef.current = requestAnimationFrame(updateVisualizer);
  };
  
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const progressPercentage = prompt && isRecording 
    ? ((prompt.timeLimit - timeLeft) / prompt.timeLimit) * 100
    : 0;
  
  return (
    <div className="recorder-container mb-8">
      <h2 className="text-xl font-semibold mb-4 text-assessment-blue">Record Your Response</h2>
      
      {isRecording && (
        <>
          <div className="visualizer mb-4">
            <div className="visualizer-bar">
              {visualizerData.map((value, index) => (
                <span
                  key={index}
                  style={{ height: `${value}%` }}
                  className={isPaused ? "opacity-30" : ""}
                />
              ))}
            </div>
          </div>
          
          <div className="flex justify-between items-center mb-2">
            <div className="text-sm font-medium">
              {isPaused ? "Paused" : "Recording"}
            </div>
            <div className={`text-sm font-medium ${timeLeft < 10 ? "text-assessment-error" : ""}`}>
              Time left: {formatTime(timeLeft)}
            </div>
          </div>
          
          <Progress value={progressPercentage} className="h-2 mb-4" />
        </>
      )}
      
      <div className="flex gap-2 mt-4">
        {!isRecording ? (
          <Button
            className="bg-assessment-blue hover:bg-assessment-lightBlue text-white w-full"
            onClick={startRecording}
            disabled={!prompt}
          >
            Start Recording
          </Button>
        ) : (
          <>
            <Button
              variant="outline"
              className="w-1/3"
              onClick={togglePause}
            >
              {isPaused ? "Resume" : "Pause"}
            </Button>
            <Button
              className="bg-assessment-error hover:bg-red-600 text-white w-2/3"
              onClick={stopRecording}
            >
              Stop Recording
            </Button>
          </>
        )}
      </div>
      
      {!prompt && (
        <p className="text-sm text-gray-500 text-center mt-4">
          Select a speaking prompt to enable recording
        </p>
      )}
    </div>
  );
};

export default RecordingSection;
