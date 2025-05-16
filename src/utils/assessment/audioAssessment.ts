
/**
 * Re-export audio assessment functionality from modularized files
 */

// Export audio analysis functionality
export { 
  analyzeAudio, 
  generateFeedback 
} from './audio/audioAnalysisCore';

// Export speaking response scoring functionality
export { 
  scoreSpeakingResponse 
} from './speaking/speakingResponseScoring';
