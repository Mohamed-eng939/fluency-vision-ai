
import { PronunciationDetails } from "../audioAnalysisUtils";

/**
 * Calculate pronunciation score based on the revised criteria
 * with integration of MFA results when available
 */
export const calculatePronunciationScore = (
  audioMetrics: any,
  transcript: string
): number => {
  // Check if we have detailed pronunciation analysis from MFA
  if (audioMetrics.pronunciationDetails) {
    const details: PronunciationDetails = audioMetrics.pronunciationDetails;
    
    // Calculate score based on MFA pronunciation analysis
    let score = details.pronunciation_score;
    
    // Convert from IELTS 1-9 scale to our 1-10 scale
    return 1 + (score / 9) * 9;
  }
  
  // Default max score is 7.0 unless all criteria are met
  let baseScore = 7.0;
  
  // Get relevant metrics
  const confidenceScore = audioMetrics.confidenceScore || 0.7;
  const speechRate = audioMetrics.speechRate || 0;
  
  // Assume transcript coverage is high if there's a transcript
  // In a real system, this would compare expected vs. actual content
  const transcriptCoverage = transcript ? 
    (transcript.length > 20 ? 0.9 : 0.8) : 
    0.7;
  
  // Check if audio passes all criteria for higher scoring
  const highClarity = confidenceScore >= 0.75;
  const sufficientSpeechRate = speechRate >= 100;
  const goodCoverage = transcriptCoverage >= 0.9;
  
  // Simple repetition check - looking for repeated phrases
  // This is a simplified approach, in a real system would use NLP
  const words = transcript.split(' ');
  const hasRepetition = words.length >= 8 && 
    new Set(words).size < words.length * 0.8;
  
  // Only allow scores above 7 if all criteria are met
  if (highClarity && sufficientSpeechRate && !hasRepetition && goodCoverage) {
    baseScore = audioMetrics.pronunciation || 8.0;
  }
  
  // Apply deductions
  let finalScore = baseScore;
  
  if (confidenceScore < 0.7) {
    finalScore -= 1.0;
  }
  
  if (transcriptCoverage < 0.85) {
    finalScore -= 0.5;
  }
  
  // Check for monotone speech (low intonation variance)
  // In a real system, this would analyze pitch variations
  // Here we're using a simplified approach based on prosody
  const intonationVariance = audioMetrics.prosody ? 
    (audioMetrics.prosody > 7 ? 0.9 : 0.7) : 
    0.7;
  
  if (intonationVariance < 0.8) {
    finalScore -= 0.5;
  }
  
  // Ensure score is between 1 and 10
  return Math.max(1, Math.min(10, finalScore));
};
