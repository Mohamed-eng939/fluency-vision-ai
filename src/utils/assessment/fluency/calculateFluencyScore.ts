
import { detectHesitationMarkers } from "../../audio/hesitationDetector";
import { detectRepetitions } from "./repetitionDetector";
import { analyzePauseQuality } from "./pauseQualityAnalyzer";
import { calculateFluencyScoreFromSyllables } from "./syllableScoring";
import { estimateSyllableCount } from "./syllableCounter";
import { applyHesitationPenalties } from "./hesitationScoring";
import { applyRepetitionPenalties, calculateRepetitionPenalty } from "./repetitionScoring";
import { applyPauseQualityPenalties } from "./pauseQualityScoring";

/**
 * Detect discourse markers that improve flow and cohesion
 */
const detectDiscourseMarkers = (transcript: string): string[] => {
  const markers = [
    'because', 'but', 'however', 'so', 'even though', 'in addition',
    'therefore', 'moreover', 'furthermore', 'although', 'nevertheless',
    'consequently', 'on the other hand', 'for example', 'in contrast',
    'meanwhile', 'subsequently', 'thus', 'hence', 'whereas'
  ];
  
  const found: string[] = [];
  const lowerTranscript = transcript.toLowerCase();
  
  markers.forEach(marker => {
    if (lowerTranscript.includes(marker)) {
      found.push(marker);
    }
  });
  
  return found;
};

/**
 * Calculate fluency score with CEFR-aligned assessment
 * Updated to reflect human assessment patterns from IELTS/PTE
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

  // Apply clarity buffer for slow but clear speakers
  if (syllablesPerMinute < 90 && transcript) {
    const discourseMarkers = detectDiscourseMarkers(transcript);
    if (discourseMarkers.length > 0) {
      score = Math.min(6.0, score + 0.5); // Clarity buffer up to 6.0
      console.log("Applied clarity buffer for slow but clear speech:", score);
    }
  }

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
    
    // Store penalty flags for smart capping
    let repetitionPenaltyApplied = false;
    let hesitationPenaltyApplied = false;
    let pausePenaltyApplied = false;

    // Apply repetition penalties with updated logic
    const originalScore = score;
    score = applyRepetitionPenalties(score, repetitionAnalysis.count);
    repetitionPenaltyApplied = score < originalScore;
    
    // Apply hesitation marker penalties with updated logic
    const scoreBeforeHesitation = score;
    score = applyHesitationPenalties(score, transcript);
    hesitationPenaltyApplied = score < scoreBeforeHesitation;
    
    // Store the hesitation analysis in audioMetrics for feedback generation
    const hesitationAnalysis = detectHesitationMarkers(transcript);
    if (audioMetrics) {
      audioMetrics.hesitationCount = hesitationAnalysis.count;
      audioMetrics.hesitationRatio = hesitationAnalysis.ratio;
      audioMetrics.hesitationMarkers = hesitationAnalysis.markers;
    }
    
    // Apply pause quality penalties with updated logic
    const scoreBeforePause = score;
    score = applyPauseQualityPenalties(score, audioMetrics, transcript);
    pausePenaltyApplied = score < scoreBeforePause;

    // Apply discourse marker bonus (cohesion recognition)
    const discourseMarkers = detectDiscourseMarkers(transcript);
    if (discourseMarkers.length >= 2) {
      score += 0.5;
      console.log(`Applied +0.5 discourse marker bonus for ${discourseMarkers.length} markers:`, discourseMarkers.slice(0, 3));
    }

    // Apply smart capping only when multiple severe penalties are triggered
    const multiplePenalties = [repetitionPenaltyApplied, hesitationPenaltyApplied, pausePenaltyApplied].filter(Boolean).length;
    if (multiplePenalties >= 2) {
      const pauseRatio = audioMetrics.pauseRatio || 0;
      const repetitionCount = repetitionAnalysis.count;
      const hesitationCount = hesitationAnalysis.count;

      // Cap at 7.5 only if both hesitation and pause issues are severe
      if (hesitationCount >= 13 && pauseRatio > 0.3) {
        score = Math.min(score, 7.5);
        console.log("Applied severe fluency cap at 7.5 due to multiple severe issues");
      }
      // Cap at 7.0 only if repetition + other severe issues
      else if (repetitionCount >= 12 && (hesitationCount >= 8 || pauseRatio > 0.3)) {
        score = Math.min(score, 7.0);
        console.log("Applied repetition cap at 7.0 due to multiple issues");
      }
    }
  }
  
  console.log("Final fluency score after penalties and bonuses:", score);
  
  // Ensure minimum score is 3.0 (updated from 1.0)
  return Math.max(3.0, Math.min(10.0, score));
};
