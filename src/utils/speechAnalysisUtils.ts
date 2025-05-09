
// Speech Analysis Utilities
// This file contains functions for speech analysis, including VAD and ASR integration

interface VADOptions {
  threshold: number; // Energy threshold for voice detection
  voicingProbabilityThreshold: number; // Probability threshold for voice detection
  silenceTimeThreshold: number; // Silence duration (in ms) to consider speech ended
}

interface ASROptions {
  language: string; // Language code (e.g., 'en-US')
  continuous: boolean; // Whether to continuously recognize speech
  interimResults: boolean; // Whether to return interim results
}

// Default VAD options
export const defaultVADOptions: VADOptions = {
  threshold: 0.05,
  voicingProbabilityThreshold: 0.6,
  silenceTimeThreshold: 1500, // 1.5 seconds of silence
};

// Default ASR options
export const defaultASROptions: ASROptions = {
  language: 'en-US',
  continuous: true,
  interimResults: true,
};

/**
 * Voice Activity Detection service
 * Detects when speech begins and ends in an audio stream
 */
export class VoiceActivityDetector {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private options: VADOptions;
  private speaking: boolean = false;
  private silenceStart: number = 0;
  private onSpeechStart: (() => void) | null = null;
  private onSpeechEnd: (() => void) | null = null;
  private animationFrameId: number | null = null;

  constructor(options: Partial<VADOptions> = {}) {
    this.options = { ...defaultVADOptions, ...options };
  }

  /**
   * Initialize the VAD with an audio stream
   */
  public init(stream: MediaStream): void {
    this.stop();
    
    this.audioContext = new AudioContext();
    const source = this.audioContext.createMediaStreamSource(stream);
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 512;
    this.analyser.smoothingTimeConstant = 0.5;
    source.connect(this.analyser);
    
    this.speaking = false;
    this.silenceStart = 0;
    
    this.detectSpeech();
  }

  /**
   * Set callback for speech start event
   */
  public setOnSpeechStart(callback: () => void): void {
    this.onSpeechStart = callback;
  }

  /**
   * Set callback for speech end event
   */
  public setOnSpeechEnd(callback: () => void): void {
    this.onSpeechEnd = callback;
  }

  /**
   * Stop the VAD
   */
  public stop(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.analyser = null;
  }

  /**
   * Main speech detection loop
   */
  private detectSpeech(): void {
    if (!this.analyser) return;

    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);
    
    // Calculate voice energy
    const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
    const normalizedEnergy = average / 255;

    // Calculate voicing probability (simple method)
    const voicingProbability = this.calculateVoicingProbability(dataArray);
    
    // Check if speaking
    const isSpeaking = 
      normalizedEnergy > this.options.threshold && 
      voicingProbability > this.options.voicingProbabilityThreshold;
    
    // State transitions
    if (!this.speaking && isSpeaking) {
      this.speaking = true;
      this.silenceStart = 0;
      if (this.onSpeechStart) this.onSpeechStart();
    } else if (this.speaking && !isSpeaking) {
      if (this.silenceStart === 0) {
        this.silenceStart = performance.now();
      } else if (performance.now() - this.silenceStart > this.options.silenceTimeThreshold) {
        this.speaking = false;
        this.silenceStart = 0;
        if (this.onSpeechEnd) this.onSpeechEnd();
      }
    } else if (isSpeaking) {
      // Reset silence timer if speaking again
      this.silenceStart = 0;
    }

    // Continue loop
    this.animationFrameId = requestAnimationFrame(() => this.detectSpeech());
  }

  /**
   * Calculate voicing probability based on spectral characteristics
   * This is a simplified method, real VAD uses more complex algorithms
   */
  private calculateVoicingProbability(frequencyData: Uint8Array): number {
    // Focus on the frequency range where speech is most present (approximately 85-255 Hz)
    const speechBandStart = Math.floor(85 * frequencyData.length / 22050);
    const speechBandEnd = Math.floor(255 * frequencyData.length / 22050);
    
    let speechBandEnergy = 0;
    let totalEnergy = 0;
    
    for (let i = 0; i < frequencyData.length; i++) {
      if (i >= speechBandStart && i <= speechBandEnd) {
        speechBandEnergy += frequencyData[i];
      }
      totalEnergy += frequencyData[i];
    }
    
    // If there's very little total energy, it's definitely not speech
    if (totalEnergy < 1000) return 0;
    
    // Calculate the proportion of energy in the speech band
    return speechBandEnergy / totalEnergy;
  }

  /**
   * Get the current VAD state
   */
  public isSpeaking(): boolean {
    return this.speaking;
  }
}

/**
 * Speech-to-Text recognition service using the Web Speech API
 */
export class SpeechRecognitionService {
  private recognition: any = null;
  private options: ASROptions;
  private isListening: boolean = false;
  private transcript: string = '';
  private onResultCallback: ((transcript: string, isFinal: boolean) => void) | null = null;
  private onErrorCallback: ((error: any) => void) | null = null;

  constructor(options: Partial<ASROptions> = {}) {
    this.options = { ...defaultASROptions, ...options };
    
    // Check if browser supports SpeechRecognition
    const SpeechRecognition = 
      window.SpeechRecognition || 
      (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.configureRecognition();
    } else {
      console.error('Speech recognition not supported in this browser');
    }
  }

  /**
   * Configure the speech recognition instance
   */
  private configureRecognition(): void {
    if (!this.recognition) return;

    this.recognition.continuous = this.options.continuous;
    this.recognition.interimResults = this.options.interimResults;
    this.recognition.lang = this.options.language;

    this.recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      this.transcript = finalTranscript || this.transcript;
      
      if (this.onResultCallback) {
        if (finalTranscript) {
          this.onResultCallback(finalTranscript, true);
        } else if (interimTranscript) {
          this.onResultCallback(interimTranscript, false);
        }
      }
    };

    this.recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event);
      if (this.onErrorCallback) {
        this.onErrorCallback(event);
      }
    };

    this.recognition.onend = () => {
      this.isListening = false;
      if (this.options.continuous && this.isListening) {
        // Restart if continuous mode is enabled
        this.recognition.start();
      }
    };
  }

  /**
   * Start speech recognition
   */
  public start(): boolean {
    if (!this.recognition) return false;

    try {
      this.recognition.start();
      this.isListening = true;
      return true;
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      return false;
    }
  }

  /**
   * Stop speech recognition
   */
  public stop(): void {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
        this.isListening = false;
      } catch (error) {
        console.error('Error stopping speech recognition:', error);
      }
    }
  }

  /**
   * Set callback for recognition results
   */
  public onResult(callback: (transcript: string, isFinal: boolean) => void): void {
    this.onResultCallback = callback;
  }

  /**
   * Set callback for errors
   */
  public onError(callback: (error: any) => void): void {
    this.onErrorCallback = callback;
  }

  /**
   * Get the current transcript
   */
  public getTranscript(): string {
    return this.transcript;
  }

  /**
   * Check if speech recognition is supported
   */
  public static isSupported(): boolean {
    return !!(window.SpeechRecognition || (window as any).webkitSpeechRecognition);
  }
}

/**
 * Analyze audio for speech quality metrics
 * This is a placeholder implementation that would ideally
 * integrate with a more sophisticated analysis service
 */
export const analyzeSpeechMetrics = async (audioBlob: Blob): Promise<{ 
  fluency: number;
  pronunciation: number;
  prosody: number;
  speechRate: number;
  pausePattern: number;
  confidenceScore: number;
}> => {
  // This is a mock implementation
  // In a real application, this would connect to a backend service
  // or use a client-side ML model for analysis
  
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 1000));

  return {
    fluency: Math.random() * 4 + 6, // 6-10 scale
    pronunciation: Math.random() * 4 + 6,
    prosody: Math.random() * 4 + 6,
    speechRate: Math.random() * 50 + 130, // Words per minute (typical range 130-180)
    pausePattern: Math.random() * 4 + 6,
    confidenceScore: Math.random() * 0.3 + 0.7 // 0.7-1.0
  };
};

/**
 * Enhanced audio processing for assessment
 */
export const processAudioForAssessment = async (audioBlob: Blob): Promise<{
  audioUrl: string;
  duration: number;
  metrics: {
    fluency: number;
    pronunciation: number;
    prosody: number;
    speechRate: number;
    pausePattern: number;
    confidenceScore: number;
  };
}> => {
  // Create a URL for the audio
  const audioUrl = URL.createObjectURL(audioBlob);
  
  // Get audio duration
  const duration = await getAudioDuration(audioBlob);
  
  // Analyze speech metrics
  const metrics = await analyzeSpeechMetrics(audioBlob);
  
  return {
    audioUrl,
    duration,
    metrics
  };
};

/**
 * Get the duration of an audio blob
 */
const getAudioDuration = async (audioBlob: Blob): Promise<number> => {
  return new Promise((resolve) => {
    const audio = new Audio();
    audio.src = URL.createObjectURL(audioBlob);
    
    audio.onloadedmetadata = () => {
      resolve(audio.duration);
    };
    
    // Fallback if metadata loading fails
    audio.onerror = () => {
      resolve(0);
    };
  });
};
