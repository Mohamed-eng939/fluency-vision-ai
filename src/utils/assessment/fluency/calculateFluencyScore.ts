import { detectHesitationMarkers } from "../../audio/hesitationDetector";
import { detectRepetitions } from "./repetitionDetector";
import { analyzePauseQuality } from "./pauseQualityAnalyzer";
import { calculateFluencyScoreFromSyllables } from "./syllableScoring";
import { estimateSyllableCount } from "./syllableCounter";
import { applyHesitationPenalties } from "./hesitationScoring";
import { applyRepetitionPenalties, calculateRepetitionPenalty } from "./repetitionScoring";
import { applyPauseQualityPenalties } from "./pauseQualityScoring";

/**
 * Calculate fluency score based on syllables per minute instead of WPM
 */
export const calculateFluencyScore = (
  audioMetrics: any,
  transcript: string
): number => {
  // If we have syllables per minute data, use it
  if (audioMetrics.syllablesPerMinute !== undefined) {
    // Get base score from SPM
    let score = calculateFluencyScoreFromSyllables(audioMetrics.syllablesPerMinute, audioMetrics.pauseRatio || 0.2);
    
    // Apply repetition penalties if transcript is available
    if (transcript) {
      // Analyze repetitions in the transcript
      const repetitionAnalysis = detectRepetitions(transcript);
      
      // Store repetition data in metrics for feedback generation
      if (audioMetrics) {
        audioMetrics.repetitionCount = repetitionAnalysis.count;
        audioMetrics.repetitions = repetitionAnalysis.repetitions;
        
        // Add repetition justification to fluency justification
        if (repetitionAnalysis.count > 0) {
          const repetitionImpact = calculateRepetitionPenalty(repetitionAnalysis.count);
          const repetitionJustification = 
            `Detected ${repetitionAnalysis.count} repeated words/phrases` + 
            (repetitionAnalysis.examples.length > 0 ? 
            ` including '${repetitionAnalysis.examples.slice(0, 2).join("', '")}'. ` : ". ") + 
            `Repetition reduced fluency by ${repetitionImpact.toFixed(1)} points.`;
            
          audioMetrics.fluencyJustification = audioMetrics.fluencyJustification
            ? `${audioMetrics.fluencyJustification} ${repetitionJustification}`
            : repetitionJustification;
        }
      }
      
      // Apply repetition penalties
      score = applyRepetitionPenalties(score, repetitionAnalysis.count);
      
      // Apply hesitation marker penalties
      score = applyHesitationPenalties(score, transcript);
      
      // Store the hesitation analysis in audioMetrics for feedback generation
      const hesitationAnalysis = detectHesitationMarkers(transcript);
      if (audioMetrics) {
        audioMetrics.hesitationCount = hesitationAnalysis.count;
        audioMetrics.hesitationRatio = hesitationAnalysis.ratio;
        audioMetrics.hesitationMarkers = hesitationAnalysis.markers;
      }
      
      // Apply pause quality penalties
      score = applyPauseQualityPenalties(score, audioMetrics, transcript);
    }
    
    return score;
  }
  
  // Otherwise, estimate syllable count from transcript and calculate SPM
  const syllableCount = estimateSyllableCount(transcript);
  const durationInMinutes = audioMetrics.totalDuration ? audioMetrics.totalDuration / 60 : 1;
  const estimatedSyllablesPerMinute = syllableCount / durationInMinutes;
  
  // Get base score using estimated syllables per minute
  let score = calculateFluencyScoreFromSyllables(estimatedSyllablesPerMinute, audioMetrics.pauseRatio || 0.2);
  
  // Apply repetition and hesitation penalties
  if (transcript) {
    // Analyze repetitions
    const repetitionAnalysis = detectRepetitions(transcript);
    
    // Store repetition data in metrics for feedback generation
    if (audioMetrics) {
      audioMetrics.repetitionCount = repetitionAnalysis.count;
      audioMetrics.repetitions = repetitionAnalysis.repetitions;
      
      // Add repetition justification to fluency justification
      if (repetitionAnalysis.count > 0) {
        const repetitionImpact = calculateRepetitionPenalty(repetitionAnalysis.count);
        const repetitionJustification = 
          `Detected ${repetitionAnalysis.count} repeated words/phrases` + 
          (repetitionAnalysis.examples.length > 0 ? 
          ` including '${repetitionAnalysis.examples.slice(0, 2).join("', '")}'. ` : ". ") + 
          `Repetition reduced fluency by ${repetitionImpact.toFixed(1)} points.`;
          
        audioMetrics.fluencyJustification = audioMetrics.fluencyJustification
          ? `${audioMetrics.fluencyJustification} ${repetitionJustification}`
          : repetitionJustification;
      }
    }
    
    // Apply repetition penalties
    score = applyRepetitionPenalties(score, repetitionAnalysis.count);
    
    // Apply hesitation marker penalties
    score = applyHesitationPenalties(score, transcript);
    
    // Store the hesitation analysis in audioMetrics for feedback generation
    const hesitationAnalysis = detectHesitationMarkers(transcript);
    if (audioMetrics) {
      audioMetrics.hesitationCount = hesitationAnalysis.count;
      audioMetrics.hesitationRatio = hesitationAnalysis.ratio;
      audioMetrics.hesitationMarkers = hesitationAnalysis.markers;
    }
    
    // Apply pause quality penalties
    score = applyPauseQualityPenalties(score, audioMetrics, transcript);
  }
  
  return score;
};
