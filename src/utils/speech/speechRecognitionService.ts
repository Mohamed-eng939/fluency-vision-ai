
import { ASROptions, defaultASROptions, SpeechRecognition, SpeechRecognitionEvent } from './types';

/**
 * Speech-to-Text recognition service using the Web Speech API
 */
export class SpeechRecognitionService {
  private recognition: SpeechRecognition | null = null;
  private options: ASROptions;
  private isListening: boolean = false;
  private transcript: string = '';
  private onResultCallback: ((transcript: string, isFinal: boolean) => void) | null = null;
  private onErrorCallback: ((error: any) => void) | null = null;

  constructor(options: Partial<ASROptions> = {}) {
    this.options = { ...defaultASROptions, ...options };
    
    // Check if browser supports SpeechRecognition
    const SpeechRecognition = 
      (window as any).SpeechRecognition || 
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

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
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
    return !!(
      (window as any).SpeechRecognition || 
      (window as any).webkitSpeechRecognition
    );
  }
}
