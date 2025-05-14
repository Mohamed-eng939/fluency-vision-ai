
import { VADOptions, defaultVADOptions } from './types';

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
