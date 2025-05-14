
// Type definitions for Speech Analysis components

// Web Speech API types
export interface Window {
  SpeechRecognition?: new () => SpeechRecognition;
  webkitSpeechRecognition?: new () => SpeechRecognition;
}

export interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: any) => void) | null;
  onend: ((event: Event) => void) | null;
}

export interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

export interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

export interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

export interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

// Voice Activity Detection options
export interface VADOptions {
  threshold: number; // Energy threshold for voice detection
  voicingProbabilityThreshold: number; // Probability threshold for voice detection
  silenceTimeThreshold: number; // Silence duration (in ms) to consider speech ended
}

// Automatic Speech Recognition options
export interface ASROptions {
  language: string; // Language code (e.g., 'en-US')
  continuous: boolean; // Whether to continuously recognize speech
  interimResults: boolean; // Whether to return interim results
}

// Default options
export const defaultVADOptions: VADOptions = {
  threshold: 0.05,
  voicingProbabilityThreshold: 0.6,
  silenceTimeThreshold: 1500, // 1.5 seconds of silence
};

export const defaultASROptions: ASROptions = {
  language: 'en-US',
  continuous: true,
  interimResults: true,
};
