
import { detectHesitationMarkers } from "../../audio/hesitationDetector";
import { detectRepetitions } from "./repetitionDetector";
import { analyzePauseQuality } from "./pauseQualityAnalyzer";
import { calculateFluencyScoreFromSyllables } from "./syllableScoring";
import { estimateSyllableCount } from "./syllableCounter";
import { applyHesitationPenalties } from "./hesitationScoring";
import { applyRepetitionPenalties, calculateRepetitionPenalty } from "./repetitionScoring";
import { applyPauseQualityPenalties } from "./pauseQualityScoring";

/**
 * Calculate fluency score with fallback for missing metrics
 * Updated with more balanced fallback SPM estimation
 */
export const calculateFluencyScore = (
  audioMetrics: any,
  transcript: string
): number => {
  console.log("Calculating fluency score with metrics:", {
    syllablesPerMinute: audioMetrics.syllablesPerMinute,
    wpm: audioMetrics.wpm,
    totalWords: audioMetrics.totalWords,
    speakingDuration: audioMetrics.speakingDuration,
    totalDuration: audioMetrics.totalDuration
  });

  // Fallback calculation if syllablesPerMinute is missing or zero
  let syllablesPerMinute = audioMetrics.syllablesPerMinute;
  
  if (!syllablesPerMinute || syllablesPerMinute === 0) {
    console.log("syllablesPerMinute missing, calculating fallback");
    
    // Estimate from transcript and duration
    if (transcript && audioMetrics.speakingDuration > 0) {
      const estimatedSyllables = estimateSyllableCount(transcript);
      const durationInMinutes = audioMetrics.speakingDuration / 60;
      syllablesPerMinute = estimatedSyllables / durationInMinutes;
      
      console.log("Fallback calculation:", {
        estimatedSyllables,
        durationInMinutes,
        syllablesPerMinute
      });
    } else if (audioMetrics.wpm && audioMetrics.wpm > 0) {
      // Estimate from WPM (average 1.5 syllables per word)
      syllablesPerMinute = audioMetrics.wpm * 1.5;
      console.log("Estimated from WPM:", syllablesPerMinute);
    } else if (transcript && audioMetrics.totalDuration > 0) {
      // Last resort: use total duration instead of speaking duration
      const estimatedSyllables = estimateSyllableCount(transcript);
      const durationInMinutes = audioMetrics.totalDuration / 60;
      syllablesPerMinute = estimatedSyllables / durationInMinutes;
      
      console.log("Last resort calculation with total duration:", {
        estimatedSyllables,
        totalDurationMinutes: durationInMinutes,
        syllablesPerMinute
      });
    } else {
      // Adaptive default fallback based on transcript length
      const wordCount = transcript ? transcript.trim().split(/\s+/).length : 0;
      if (wordCount > 80) {
        syllablesPerMinute = 125; // Higher base for longer responses
      } else if (wordCount > 50) {
        syllablesPerMinute = 120; // Standard base
      } else {
        syllablesPerMinute = 115; // Lower base for shorter responses
      }
      console.log("Using adaptive default fallback SPM:", syllablesPerMinute, "for word count:", wordCount);
    }
    
    // Store the calculated value back to metrics
    audioMetrics.syllablesPerMinute = syllablesPerMinute;
  }

  // Ensure WPM is calculated if missing
  if ((!audioMetrics.wpm || audioMetrics.wpm === 0) && transcript && audioMetrics.speakingDuration > 0) {
    const words = transcript.trim().split(/\s+/).filter(word => word.length > 0);
    const totalWords = words.length;
    const durationInMinutes = audioMetrics.speakingDuration / 60;
    audioMetrics.wpm = totalWords / durationInMinutes;
    audioMetrics.totalWords = totalWords;
    
    console.log("Calculated WPM fallback:", {
      totalWords,
      durationInMinutes,
      wpm: audioMetrics.wpm
    });
  }

  // Get base score from SPM
  let score = calculateFluencyScoreFromSyllables(
    syllablesPerMinute, 
    audioMetrics.pauseRatio || 0.2
  );
  
  console.log("Base fluency score from SPM:", score);

  // Apply penalties if transcript is available
  if (transcript) {
    // Analyze repetitions in the transcript with improved detection
    const repetitionAnalysis = detectRepetitions(transcript);
    
    // Store repetition data in metrics for feedback generation
    if (audioMetrics) {
      audioMetrics.repetitionCount = repetitionAnalysis.count;
      audioMetrics.repetitions = repetitionAnalysis.repetitions;
      
      // Add repetition justification to fluency justification
      if (repetitionAnalysis.count > 4) { // Updated threshold
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
  
  console.log("Final fluency score after penalties:", score);
  
  return Math.max(1.0, Math.min(10.0, score));
};
