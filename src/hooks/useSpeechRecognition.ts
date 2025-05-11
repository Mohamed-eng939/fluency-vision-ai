
import { useState, useRef, useEffect } from 'react';

interface UseSpeechRecognitionProps {
  onTranscript?: (transcript: string) => void;
  continuous?: boolean;
  interimResults?: boolean;
  lang?: string;
}

export const useSpeechRecognition = ({
  onTranscript,
  continuous = true,
  interimResults = true,
  lang = 'en-US'
}: UseSpeechRecognitionProps = {}) => {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Initialize speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = continuous;
      recognitionRef.current.interimResults = interimResults;
      recognitionRef.current.lang = lang;
      
      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        
        const currentTranscript = finalTranscript || interimTranscript;
        setTranscript(prevTranscript => finalTranscript ? currentTranscript : prevTranscript);
        
        if (onTranscript) {
          onTranscript(currentTranscript);
        }
      };
    }
    
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore errors when stopping inactive recognition
        }
      }
    };
  }, [continuous, interimResults, lang, onTranscript]);

  const startListening = () => {
    if (!recognitionRef.current) {
      console.error('Speech recognition not supported in this browser');
      return false;
    }
    
    try {
      recognitionRef.current.start();
      setIsListening(true);
      return true;
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      return false;
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
        setIsListening(false);
      } catch (error) {
        console.error('Error stopping speech recognition:', error);
      }
    }
  };
  
  const resetTranscript = () => {
    setTranscript('');
  };

  return {
    transcript,
    isListening,
    startListening,
    stopListening,
    resetTranscript
  };
};
