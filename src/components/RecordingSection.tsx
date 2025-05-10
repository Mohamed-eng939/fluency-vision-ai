
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { toast } from '../components/ui/use-toast';
import { SpeakingPrompt } from '../types/assessment';
import { Mic, MicOff, Volume2, AlertTriangle, AudioWaveform } from 'lucide-react';
import { VoiceActivityDetector, SpeechRecognitionService, processAudioForAssessment } from '../utils/speechAnalysisUtils';

interface RecordingSectionProps {
  prompt: SpeakingPrompt | null;
  onRecordingComplete: (audioBlob: Blob) => void;
}

const RecordingSection: React.FC<RecordingSectionProps> = ({ prompt, onRecordingComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [visualizerData, setVisualizerData] = useState<number[]>(Array(30).fill(0));
  const [speechDetected, setSpeechDetected] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const vadRef = useRef<VoiceActivityDetector | null>(null);
  const asrRef = useRef<SpeechRecognitionService | null>(null);
  
  useEffect(() => {
    return () => {
      // Cleanup
      cleanupResources();
    };
  }, []);
  
  const cleanupResources = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    if (vadRef.current) {
      vadRef.current.stop();
    }
    
    if (asrRef.current) {
      asrRef.current.stop();
    }
  };
  
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
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      // Set up audio context and analyzer
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      
      source.connect(analyser);
      analyserRef.current = analyser;
      
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      dataArrayRef.current = dataArray;
      
      // Set up media recorder
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      
      audioChunksRef.current = [];
      recorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      
      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        
        // Process the audio with our enhanced analysis
        try {
          // We'll just call the original handler for now
          // In a real implementation, we'd process the audio first
          onRecordingComplete(audioBlob);
        } catch (error) {
          console.error('Error processing audio:', error);
          toast({
            title: "Processing error",
            description: "There was a problem processing your recording.",
            variant: "destructive"
          });
        }
      };
      
      // Set up Voice Activity Detection
      const vad = new VoiceActivityDetector();
      vadRef.current = vad;
      vad.init(stream);
      vad.setOnSpeechStart(() => {
        setSpeechDetected(true);
        // Visual feedback for speech detection
        toast({
          title: "Speech detected",
          description: "We can hear you speaking.",
          variant: "default"
        });
      });
      vad.setOnSpeechEnd(() => {
        setSpeechDetected(false);
      });
      
      // Set up Speech Recognition if supported
      if (SpeechRecognitionService.isSupported()) {
        const asr = new SpeechRecognitionService({
          language: 'en-US',
          continuous: true,
          interimResults: true
        });
        
        asrRef.current = asr;
        
        asr.onResult((text, isFinal) => {
          if (isFinal) {
            setTranscript(prev => prev ? `${prev} ${text}` : text);
            setInterimTranscript("");
          } else {
            setInterimTranscript(text);
          }
        });
        
        asr.onError((error) => {
          console.error('Speech recognition error:', error);
        });
        
        asr.start();
      }
      
      // Start recording
      recorder.start();
      setIsRecording(true);
      setTimeLeft(prompt.timeLimit);
      
      // Set up timer
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
      cleanupResources();
      
      setIsRecording(false);
      setTimeLeft(0);
      setTranscript("");
      setInterimTranscript("");
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
      
      if (vadRef.current && streamRef.current) {
        vadRef.current.init(streamRef.current);
      }
      
      if (asrRef.current) {
        asrRef.current.start();
      }
      
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
      
      if (vadRef.current) {
        vadRef.current.stop();
      }
      
      if (asrRef.current) {
        asrRef.current.stop();
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
      <h2 className="text-xl font-semibold mb-4 text-assessment-blue flex items-center gap-2">
        Record Your Response
        {isRecording && speechDetected && (
          <AudioWaveform className="h-5 w-5 text-assessment-teal animate-pulse" />
        )}
      </h2>
      
      {isRecording && (
        <>
          <div className="visualizer mb-4">
            <div className="visualizer-bar">
              {visualizerData.map((value, index) => (
                <span
                  key={index}
                  style={{ 
                    height: `${value}%`,
                    backgroundColor: speechDetected ? '#38b2ac' : undefined
                  }}
                  className={`transition-all duration-100 ${isPaused ? "opacity-30" : ""}`}
                />
              ))}
            </div>
          </div>
          
          <div className="flex justify-between items-center mb-2">
            <div className="text-sm font-medium flex items-center gap-1">
              {isPaused ? "Paused" : (
                speechDetected ? (
                  <>
                    <Mic className="h-4 w-4 text-assessment-teal" />
                    <span className="text-assessment-teal">Speaking detected</span>
                  </>
                ) : (
                  "Recording"
                )
              )}
            </div>
            <div className={`text-sm font-medium ${timeLeft < 10 ? "text-assessment-error" : ""}`}>
              Time left: {formatTime(timeLeft)}
            </div>
          </div>
          
          <Progress 
            value={progressPercentage} 
            className={`h-2 mb-4 ${speechDetected ? "bg-assessment-teal/20" : ""}`}
          />
          
          {(transcript || interimTranscript) && (
            <div className="mt-4 mb-4 p-3 bg-gray-50 rounded-md border text-sm max-h-32 overflow-y-auto">
              <p className="font-medium text-xs text-gray-500 mb-1">Live transcript:</p>
              <p>
                {transcript}{' '}
                <span className="text-gray-400">{interimTranscript}</span>
              </p>
            </div>
          )}
        </>
      )}
      
      <div className="flex gap-2 mt-4">
        {!isRecording ? (
          <Button
            className="bg-assessment-blue hover:bg-assessment-lightBlue text-white w-full"
            onClick={startRecording}
            disabled={!prompt}
          >
            <Mic className="mr-2 h-4 w-4" />
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
              <MicOff className="mr-2 h-4 w-4" />
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

      {!isRecording && SpeechRecognitionService.isSupported() === false && (
        <div className="mt-4 flex items-center gap-2 p-2 bg-amber-50 border border-amber-200 rounded text-amber-700 text-xs">
          <AlertTriangle className="h-4 w-4" />
          <span>
            Live transcription is not available in this browser. For best results, use Chrome, Edge, or Safari.
          </span>
        </div>
      )}
    </div>
  );
};

export default RecordingSection;
