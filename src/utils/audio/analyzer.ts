import { analyzeSpeechRate } from './speechRate';
import { detectHesitationMarkers } from './hesitationDetector';
import { AudioAnalysisResult } from './types';

/**
 * Analyze audio features from audio blob and transcript
 */
export const analyzeAudioFeatures = async (
  audioBlob: Blob,
  transcript?: string
): Promise<AudioAnalysisResult> => {
  // Get audio duration
  const audioContext = new AudioContext();
  const arrayBuffer = await audioBlob.arrayBuffer();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  const durationSeconds = audioBuffer.duration;
  
  // Calculate speaking rate
  const { wpm, totalWords } = transcript ? analyzeSpeechRate(transcript, durationSeconds) : { wpm: 0, totalWords: 0 };
  
  // Detect hesitation markers
  const hesitationAnalysis = transcript ? detectHesitationMarkers(transcript) : { count: 0, markers: [], ratio: 0 };
  
  return {
    wpm,
    totalWords,
    pauseCount: 0, // Placeholder
    pauseDuration: 0, // Placeholder
    pauseRatio: 0, // Placeholder
    speakingDuration: durationSeconds,
    totalDuration: durationSeconds,
    hesitationCount: hesitationAnalysis.count,
    hesitationRatio: hesitationAnalysis.ratio,
    hesitationMarkers: hesitationAnalysis.markers
  };
};

/**
 * Enhanced audio analysis that integrates WhisperX transcription data
 */
export async function enhanceAudioAnalysisWithWhisperX(
  basicAnalysis: AudioAnalysisResult, 
  whisperResult: any
): Promise<AudioAnalysisResult> {
  if (whisperResult.transcription_failed) {
    // If WhisperX failed, return the basic analysis
    console.warn("WhisperX transcription failed, using basic analysis only");
    return basicAnalysis;
  }
  
  // Import the whisperXService to calculate advanced metrics
  const { calculateAdvancedMetrics } = await import('../whisperXService');
  const advancedMetrics = calculateAdvancedMetrics(whisperResult);
  
  // Create enhanced analysis by combining basic analysis with WhisperX data
  const enhancedAnalysis: AudioAnalysisResult = {
    ...basicAnalysis,
    
    // Update with actual word count from WhisperX
    totalWords: whisperResult.word_segments.length,
    
    // Add word-level timing data
    wordTimings: whisperResult.word_segments,
    
    // Add pause information
    pauseDurations: whisperResult.pause_durations,
    pauseCount: whisperResult.pause_durations.length,
    pauseDuration: whisperResult.silence_time,
    
    // Add speaking/silence time
    speakingDuration: whisperResult.speaking_time,
    totalDuration: whisperResult.total_duration,
    pauseRatio: whisperResult.total_duration > 0 
      ? whisperResult.silence_time / whisperResult.total_duration
      : 0,
      
    // Add advanced metrics
    mlrScore: advancedMetrics.mlrScore,
    articulationRate: advancedMetrics.articulationRate,
    
    // Calculate updated WPM using precise duration
    wpm: whisperResult.total_duration > 0
      ? (whisperResult.word_segments.length / whisperResult.total_duration) * 60
      : basicAnalysis.wpm
  };
  
  return enhancedAnalysis;
}
