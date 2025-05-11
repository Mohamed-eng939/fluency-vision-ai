
import { useState } from 'react';

interface UseSpeechSynthesisOptions {
  lang?: string;
  rate?: number;
  pitch?: number;
}

export const useSpeechSynthesis = (options: UseSpeechSynthesisOptions = {}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const defaultOptions = {
    lang: 'en-US',
    rate: 1,
    pitch: 1,
    ...options,
  };

  const speak = (text: string) => {
    if (!('speechSynthesis' in window)) {
      console.error('Speech synthesis not supported in this browser');
      return;
    }

    // Create utterance
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set properties
    utterance.lang = defaultOptions.lang;
    utterance.rate = defaultOptions.rate;
    utterance.pitch = defaultOptions.pitch;
    
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
    
    setIsPlaying(true);
    
    // Add event handlers
    utterance.onend = () => {
      setIsPlaying(false);
    };
    
    utterance.onerror = () => {
      setIsPlaying(false);
    };
    
    // Speak
    window.speechSynthesis.speak(utterance);
  };

  const cancel = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    }
  };

  return {
    speak,
    cancel,
    isPlaying
  };
};
