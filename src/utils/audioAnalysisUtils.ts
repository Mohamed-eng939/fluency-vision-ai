
// Audio Analysis Utilities
// This file contains functions for analyzing audio features

/**
 * Options for audio analysis
 */
interface AudioAnalysisOptions {
  sampleRate?: number;
  fftSize?: number;
}

/**
 * Results from audio analysis
 */
export interface AudioAnalysisResult {
  wpm: number;           // Words per minute
  totalWords: number;    // Total word count
  pauseCount: number;    // Number of pauses detected
  pauseDuration: number; // Total pause duration in seconds
  pauseRatio: number;    // Ratio of pause time to total time
  speakingDuration: number; // Duration of actual speech in seconds
  totalDuration: number; // Total duration in seconds
}

/**
 * Analyze audio features from an audio blob
 */
export const analyzeAudioFeatures = async (
  audioBlob: Blob,
  transcript?: string,
  options: AudioAnalysisOptions = {}
): Promise<AudioAnalysisResult> => {
  const defaultResult: AudioAnalysisResult = {
    wpm: 0,
    totalWords: 0,
    pauseCount: 0,
    pauseDuration: 0,
    pauseRatio: 0,
    speakingDuration: 0,
    totalDuration: 0
  };

  try {
    // Convert blob to array buffer
    const arrayBuffer = await audioBlob.arrayBuffer();
    const audioContext = new AudioContext();
    
    // Decode the audio data
    const audioData = await audioContext.decodeAudioData(arrayBuffer);
    const duration = audioData.duration;
    
    // Create analyzer and process
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = options.fftSize || 2048;
    
    // Get audio data
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const source = audioContext.createBufferSource();
    source.buffer = audioData;
    source.connect(analyser);
    
    // Calculate words and pauses
    let wordCount = 0;
    let pauseCount = 0;
    let pauseDuration = 0;
    
    // If transcript provided, use it for word count
    if (transcript) {
      // Count words in transcript (split by whitespace)
      const words = transcript.trim().split(/\s+/).filter(word => word.length > 0);
      wordCount = words.length;
    }
    
    // Direct audio analysis for pause detection
    // This is a simplified version that would be enhanced with more sophisticated algorithms
    const sampleRate = audioData.sampleRate;
    const audioArray = new Float32Array(audioData.length);
    audioData.copyFromChannel(audioArray, 0);
    
    // Detect silence segments (simplified)
    let isSilence = false;
    let silenceStart = 0;
    const silenceThreshold = 0.05; // Adjust based on requirements
    const minSilenceDuration = 0.3; // 300ms as minimum silence to count as pause
    
    for (let i = 0; i < audioArray.length; i += 256) { // Step size for efficiency
      // Calculate average amplitude in window
      let sum = 0;
      for (let j = 0; j < 256 && i + j < audioArray.length; j++) {
        sum += Math.abs(audioArray[i + j]);
      }
      const avgAmplitude = sum / Math.min(256, audioArray.length - i);
      
      const currentTime = i / sampleRate;
      if (!isSilence && avgAmplitude < silenceThreshold) {
        // Start of silence
        isSilence = true;
        silenceStart = currentTime;
      } else if (isSilence && (avgAmplitude >= silenceThreshold)) {
        // End of silence
        isSilence = false;
        const silenceDuration = currentTime - silenceStart;
        if (silenceDuration >= minSilenceDuration) {
          pauseCount++;
          pauseDuration += silenceDuration;
        }
      }
    }
    
    // Calculate final metrics
    const speakingDuration = duration - pauseDuration;
    const pauseRatio = pauseDuration / duration;
    
    // Calculate WPM
    const minutes = speakingDuration / 60;
    const wpm = minutes > 0 ? wordCount / minutes : 0;
    
    return {
      wpm,
      totalWords: wordCount,
      pauseCount,
      pauseDuration,
      pauseRatio,
      speakingDuration,
      totalDuration: duration
    };
  } catch (error) {
    console.error('Error analyzing audio:', error);
    return defaultResult;
  }
};

/**
 * Calculate speaking rate stats from transcript and duration
 */
export const calculateSpeakingRate = (
  transcript: string,
  durationSeconds: number
): { wpm: number; totalWords: number } => {
  const words = transcript.trim().split(/\s+/).filter(word => word.length > 0);
  const totalWords = words.length;
  const minutes = durationSeconds / 60;
  const wpm = minutes > 0 ? totalWords / minutes : 0;
  
  return { wpm, totalWords };
};

/**
 * Detect hesitation markers in transcript
 * (um, uh, er, hmm, like, you know, etc.)
 */
export const detectHesitationMarkers = (transcript: string): {
  count: number;
  markers: string[];
  ratio: number;
} => {
  const hesitationWords = ['um', 'uh', 'er', 'hmm', 'like', 'you know', 'i mean', 'well'];
  const words = transcript.toLowerCase().split(/\s+/);
  
  const markers: string[] = [];
  hesitationWords.forEach(marker => {
    const regex = new RegExp(`\\b${marker}\\b`, 'gi');
    const matches = transcript.toLowerCase().match(regex) || [];
    markers.push(...matches);
  });
  
  return {
    count: markers.length,
    markers,
    ratio: words.length > 0 ? markers.length / words.length : 0
  };
};
