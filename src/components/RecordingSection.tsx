
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Mic, MicOff, Play, Square, Volume2 } from 'lucide-react';
import { SpeakingPrompt } from '@/types/assessment';

interface RecordingSectionProps {
  prompt: SpeakingPrompt | null;
  onRecordingComplete: (audioBlob: Blob, transcript?: string) => void;
}

const RecordingSection: React.FC<RecordingSectionProps> = ({ prompt, onRecordingComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [transcript, setTranscript] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [promptAudio, setPromptAudio] = useState<HTMLAudioElement | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const speechRecognitionRef = useRef<any>(null);

  // Initialize Web Speech API
  useEffect(() => {
    // Check for Speech Recognition API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      speechRecognitionRef.current = new SpeechRecognition();
      speechRecognitionRef.current.continuous = true;
      speechRecognitionRef.current.interimResults = true;
      
      speechRecognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        
        setTranscript(finalTranscript || interimTranscript);
      };
    }
  }, []);

  // Generate TTS audio for prompt when prompt changes
  useEffect(() => {
    if (prompt && prompt.text) {
      generatePromptAudio(prompt.text);
    }
  }, [prompt]);

  // Generate audio for the prompt using Web Speech API
  const generatePromptAudio = (text: string) => {
    // Check if the Web Speech API is available
    if ('speechSynthesis' in window) {
      // Create a new instance of SpeechSynthesisUtterance
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set properties
      utterance.lang = 'en-US';
      utterance.rate = 1; // Speed - normal
      utterance.pitch = 1; // Pitch - normal
      
      // Get available voices
      const voices = window.speechSynthesis.getVoices();
      
      // Try to find a good voice
      const preferredVoice = voices.find(voice => 
        voice.name.includes('Google') || 
        voice.name.includes('Natural') || 
        voice.name.includes('Daniel') ||
        voice.name.includes('Samantha')
      );
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      
      // Create an Audio element from the speech synthesis
      const audio = new Audio();
      
      // Using a hack to convert speech synthesis to Audio element
      const speechSynthesisToAudio = () => {
        return new Promise<void>(resolve => {
          utterance.onend = () => {
            window.speechSynthesis.cancel(); // Stop speaking
            resolve();
          };
          window.speechSynthesis.speak(utterance);
        });
      };
      
      // Set the prompt audio
      setPromptAudio(audio);
    }
  };

  // Play the prompt audio
  const playPromptAudio = () => {
    if ('speechSynthesis' in window && prompt) {
      const utterance = new SpeechSynthesisUtterance(prompt.text);
      
      utterance.lang = 'en-US';
      utterance.rate = 1;
      utterance.pitch = 1;
      
      setIsPlaying(true);
      
      utterance.onend = () => {
        setIsPlaying(false);
      };
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };
      
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
        
        // Stop all tracks on the stream
        stream.getTracks().forEach(track => track.stop());
      };
      
      // Start speech recognition if available
      if (speechRecognitionRef.current) {
        setTranscript('');
        speechRecognitionRef.current.start();
      }
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (err) {
      console.error("Error accessing microphone:", err);
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      
      // Stop speech recognition
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stop();
      }
      
      // Clear timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      setIsRecording(false);
    }
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const handleSubmit = () => {
    if (audioBlob) {
      onRecordingComplete(audioBlob, transcript);
    }
  };
  
  if (!prompt) return null;
  
  return (
    <Card className="mb-8 border-assessment-teal/20">
      <CardContent className="p-6">
        <div className="text-lg font-medium mb-6 text-assessment-blue">
          {prompt.text}
        </div>
        
        <div className="mb-4">
          <Button 
            type="button"
            variant="outline"
            className="flex items-center gap-2 mb-4"
            onClick={playPromptAudio}
            disabled={isPlaying}
          >
            {isPlaying ? (
              <span className="flex items-center gap-2">
                <Volume2 className="h-4 w-4 animate-pulse" /> Playing Audio...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Volume2 className="h-4 w-4" /> Listen to Prompt
              </span>
            )}
          </Button>
        </div>
        
        <div className="mb-4">
          <div className="text-sm text-gray-500 mb-2">
            Category: <span className="text-assessment-blue">{prompt.category}</span> | 
            Difficulty: <span className="text-assessment-blue">{prompt.difficulty}</span> | 
            Time: <span className="text-assessment-blue">{prompt.timeLimit} min</span>
          </div>
          
          {!isRecording && !audioBlob && (
            <Button 
              className="bg-assessment-teal hover:bg-assessment-lightBlue text-white"
              onClick={startRecording}
            >
              <Mic className="h-4 w-4 mr-2" />
              Start Recording
            </Button>
          )}
          
          {isRecording && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Button 
                  variant="destructive" 
                  onClick={stopRecording}
                >
                  <Square className="h-4 w-4 mr-2" />
                  Stop Recording
                </Button>
                <div className="animate-pulse text-red-500 flex items-center">
                  <MicOff className="h-4 w-4 mr-2" />
                  Recording: {formatTime(recordingTime)}
                </div>
              </div>
              
              {transcript && (
                <div className="bg-gray-50 p-3 rounded-md text-sm italic">
                  <div className="font-medium text-gray-700 mb-1">Transcript (real-time):</div>
                  {transcript}
                </div>
              )}
            </div>
          )}
          
          {audioBlob && (
            <div className="space-y-4">
              <div>
                <audio controls src={URL.createObjectURL(audioBlob)} className="w-full"></audio>
              </div>
              
              {transcript && (
                <div className="bg-gray-50 p-3 rounded-md text-sm">
                  <div className="font-medium text-gray-700 mb-1">Transcript:</div>
                  {transcript}
                </div>
              )}
              
              <div className="flex items-center gap-4">
                <Button 
                  className="bg-assessment-teal hover:bg-assessment-lightBlue text-white"
                  onClick={handleSubmit}
                >
                  Submit Recording
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setAudioBlob(null);
                    setTranscript('');
                  }}
                >
                  Record Again
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecordingSection;
