
import { useState, useRef, useEffect } from 'react';

interface UseSpeechRecognitionResult {
  transcript: string;
  isListening: boolean;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  isSupported: boolean;
}

// Use a different approach to declare the global interfaces to avoid conflicts
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void; // Add abort method
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: any) => void) | null;
  onend: ((event: Event) => void) | null;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

// Modify the global declaration to fix conflicts
declare global {
  var SpeechRecognition: {
    new (): SpeechRecognition;
  } | undefined;
  var webkitSpeechRecognition: {
    new (): SpeechRecognition;
  } | undefined;
}

export const useSpeechRecognition = (): UseSpeechRecognitionResult => {
  const [transcript, setTranscript] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSupported, setIsSupported] = useState<boolean>(false);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  
  useEffect(() => {
    // Check if browser supports SpeechRecognition
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsSupported(Boolean(SpeechRecognitionAPI));
    
    return () => {
      // Cleanup function
      if (recognitionRef.current) {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.abort();
      }
    };
  }, []);
  
  const startListening = () => {
    if (!isSupported) {
      console.warn('Speech recognition is not supported in this browser.');
      return;
    }
    
    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }
    
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      console.warn('Speech recognition is not supported in this browser.');
      return;
    }
    
    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          setTranscript(prev => prev + event.results[i][0].transcript);
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      if (interimTranscript) {
        setTranscript(prevTranscript => prevTranscript + interimTranscript);
      }
    };
    
    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
    };
    
    recognition.onend = () => {
      setIsListening(false);
    };
    
    try {
      recognition.start();
      setIsListening(true);
      recognitionRef.current = recognition;
    } catch (error) {
      console.error('Error starting speech recognition:', error);
    }
  };
  
  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
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
    resetTranscript,
    isSupported
  };
};
