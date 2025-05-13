
import { AssessmentMetrics, CEFRLevel } from '../../types/assessment';
import { PronunciationDetails } from '../audioAnalysisUtils';

/**
 * Calculate total score from metrics
 */
export const calculateTotalScore = (metrics: AssessmentMetrics): number => {
  const { fluency, grammar, pronunciation, prosody, vocabulary, syntax, coherence } = metrics;
  const sum = fluency + grammar + pronunciation + prosody + vocabulary + syntax + coherence;
  // Convert to a score out of 100
  return Math.round((sum / 70) * 100);
};

/**
 * Determine CEFR level based on total score
 */
export const determineCEFRLevel = (score: number): CEFRLevel => {
  if (score >= 95) return 'C2';
  if (score >= 85) return 'C1+';
  if (score >= 80) return 'C1';
  if (score >= 75) return 'B2+';
  if (score >= 65) return 'B2';
  if (score >= 55) return 'B1+';
  if (score >= 50) return 'B1';
  if (score >= 45) return 'A2+';
  if (score >= 35) return 'A2';
  if (score >= 25) return 'A1+';
  if (score >= 15) return 'A1';
  return 'Pre-A1';
};

/**
 * Calculate a criterion score based on audio metrics and transcript
 */
export const calculateCriterionScore = (
  criterion: string,
  audioMetrics: any,
  transcript: string
): number => {
  switch (criterion) {
    case 'Fluency & Coherence':
    case 'Fluency':
      return audioMetrics.fluency;
    case 'Pronunciation':
      // Use enhanced pronunciation score if available
      if (audioMetrics.pronunciationScore !== undefined) {
        return audioMetrics.pronunciationScore;
      }
      return calculatePronunciationScore(audioMetrics, transcript);
    case 'Prosody':
      return audioMetrics.pausePattern;
    // For other criteria, we'd need deeper text analysis
    // This is a placeholder implementation
    default:
      // Return a value between 6-9 for now
      return Math.random() * 3 + 6;
  }
};

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

/**
 * Get specific feedback for a criterion based on score and level
 */
export const getCriterionFeedback = (criterion: string, score: number, level: string): string => {
  // This would be expanded with much more detailed, criterion-specific feedback
  if (score > 8) {
    return `Your ${criterion} shows excellent mastery at ${level} level. Keep up the great work!`;
  } else if (score > 6) {
    return `Your ${criterion} is good for ${level} level, showing solid competence with minor areas to improve.`;
  } else if (score > 4) {
    return `Your ${criterion} is adequate for ${level} level, but shows several areas where focused practice would help.`;
  } else {
    return `Your ${criterion} needs significant improvement to meet ${level} level standards. Consider focused practice.`;
  }
};
