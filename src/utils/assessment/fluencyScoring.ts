import { AudioAnalysisResult } from "../../types/assessment";
import { detectHesitationMarkers } from "../audio/hesitationDetector";

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
  }
  
  return score;
};

/**
 * Detect repetitions in the transcript
 * Identifies consecutive repeated words or phrases
 */
export const detectRepetitions = (transcript: string): { 
  count: number; 
  repetitions: string[]; 
  examples: string[];
} => {
  if (!transcript) {
    return { count: 0, repetitions: [], examples: [] };
  }
  
  // Normalize transcript (lowercase, remove extra spaces)
  const normalizedText = transcript.toLowerCase()
    .replace(/[.,!?;:"""'']/g, '') // Remove punctuation
    .replace(/\s+/g, ' ')          // Normalize spaces
    .trim();
  
  const words = normalizedText.split(' ');
  const repetitions: string[] = [];
  const examples: string[] = [];
  
  // Check for consecutive repetitions (e.g., "I I I")
  for (let i = 0; i < words.length - 1; i++) {
    if (words[i] && words[i] === words[i + 1]) {
      // Find how many consecutive repetitions
      let repetitionEnd = i + 1;
      while (repetitionEnd < words.length && words[repetitionEnd] === words[i]) {
        repetitionEnd++;
      }
      
      // If we found a sequence of at least 2 same words
      if (repetitionEnd - i >= 2) {
        const repeatedWord = words[i];
        const repetitionPhrase = Array(repetitionEnd - i).fill(repeatedWord).join(' ');
        repetitions.push(repetitionPhrase);
        examples.push(repetitionPhrase);
        
        // Skip ahead to avoid counting the same repetition multiple times
        i = repetitionEnd - 1;
      }
    }
  }
  
  // Check for small window repetitions (not consecutive but close)
  const windowSize = 5;
  const wordCounts = new Map<string, number[]>();
  
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    if (!word || word.length <= 1) continue; // Skip very short words
    
    if (!wordCounts.has(word)) {
      wordCounts.set(word, [i]);
    } else {
      const positions = wordCounts.get(word)!;
      
      // Check if this is a close repetition (within window)
      if (i - positions[positions.length - 1] <= windowSize) {
        // Only count it if we haven't already detected it as consecutive
        const isAlreadyCounted = repetitions.some(rep => rep.includes(word));
        
        if (!isAlreadyCounted && positions.length === 1) {
          // This is the first time we're counting this as a repetition
          repetitions.push(`${word} ... ${word}`);
          examples.push(`${word} ... ${word}`);
        }
      }
      
      positions.push(i);
      wordCounts.set(word, positions);
    }
  }
  
  return { 
    count: repetitions.length, 
    repetitions, 
    examples: examples.slice(0, 5) // Limit examples to 5
  };
};

/**
 * Apply penalties based on repetition count
 */
export const applyRepetitionPenalties = (baseScore: number, repetitionCount: number): number => {
  let penaltyScore = baseScore;
  const penalty = calculateRepetitionPenalty(repetitionCount);
  
  // Apply penalty and CEFR cap
  penaltyScore -= penalty;
  
  // Apply CEFR alignment ceiling: cap at 6.5 (B1-B2 level) for high repetition
  if (repetitionCount > 10) {
    penaltyScore = Math.min(penaltyScore, 6.5);
  }
  
  // Ensure score doesn't go below 1.0
  return Math.max(1.0, penaltyScore);
};

/**
 * Calculate repetition penalty based on count
 */
export const calculateRepetitionPenalty = (repetitionCount: number): number => {
  if (repetitionCount <= 2) {
    return 0; // No penalty for 1-2 repetitions
  } else if (repetitionCount <= 5) {
    return 0.5; // -0.5 for 3-5 repetitions
  } else if (repetitionCount <= 10) {
    return 1.0; // -1.0 for 6-10 repetitions
  } else {
    return 1.5; // -1.5 for >10 repetitions (maximum penalty)
  }
};

/**
 * Apply penalties based on hesitation markers/filler words
 */
export const applyHesitationPenalties = (baseScore: number, transcript: string): number => {
  // Get hesitation markers from transcript
  const hesitationAnalysis = detectHesitationMarkers(transcript);
  const markerCount = hesitationAnalysis.count;
  
  let penaltyScore = baseScore;
  
  // Apply penalties based on marker count
  if (markerCount >= 3 && markerCount <= 5) {
    // 3-5 markers: -0.5 penalty
    penaltyScore -= 0.5;
  } else if (markerCount >= 6 && markerCount <= 10) {
    // 6-10 markers: -1.0 penalty
    penaltyScore -= 1.0;
  } else if (markerCount > 10) {
    // >10 markers: -1.5 penalty
    penaltyScore -= 1.5;
    
    // Apply CEFR alignment ceiling: cap at 7.0 (B2 level) for high hesitation
    penaltyScore = Math.min(penaltyScore, 7.0);
  }
  
  // Ensure score doesn't go below 1.0
  return Math.max(1.0, penaltyScore);
};

/**
 * Calculate fluency score based on syllables per minute (SPM)
 * 
 * New scoring criteria:
 * - <90 SPM → 3.0 (slow, hesitant)
 * - 90–120 SPM → 5.0–6.5 (moderate)
 * - 120–160 SPM → 7.0–8.5 (conversational)
 * - >160 SPM → 9.0+ (fast, possibly too fast)
 * 
 * With penalties:
 * - Deduct 1.0 if more than 2 repetitions detected
 * - Deduct 0.5 for 2+ pause segments > 800ms
 */
export const calculateFluencyScoreFromSyllables = (spm: number, pauseRatio: number): number => {
  // Base score based on syllables per minute
  let score = 0;
  
  // Apply the new scoring criteria
  if (spm >= 160) {
    score = 9.0;
  } else if (spm >= 150) {
    score = 8.5;
  } else if (spm >= 140) {
    score = 8.0;
  } else if (spm >= 130) {
    score = 7.5;
  } else if (spm >= 120) {
    score = 7.0;
  } else if (spm >= 110) {
    score = 6.5;
  } else if (spm >= 100) {
    score = 6.0;
  } else if (spm >= 90) {
    score = 5.0;
  } else if (spm >= 80) {
    score = 4.0;
  } else if (spm >= 70) {
    score = 3.5;
  } else {
    score = 3.0; // Default for slow, hesitant speech
  }
  
  // Apply penalties for excessive pausing (high pause ratio)
  // This serves as a proxy for detecting repeated pause segments > 800ms
  if (pauseRatio > 0.3) {
    score -= 0.5; // Deduction for multiple long pauses
  }
  
  // In a production system, we would implement repetition detection
  // For now, we're assuming we don't have that data
  
  // Ensure score is between 1-10
  return Math.max(1, Math.min(10, score));
};

/**
 * Estimate syllable count from English text
 * This is a simplified algorithm - a more accurate algorithm would use a dictionary
 */
export const estimateSyllableCount = (text: string): number => {
  if (!text) return 0;
  
  const words = text.toLowerCase().split(/\s+/);
  let count = 0;
  
  for (const word of words) {
    if (word.length <= 3) {
      // Short words generally have 1 syllable
      count += 1;
      continue;
    }
    
    // Count vowel groups as syllables
    const vowelGroups = word.match(/[aeiouy]+/g);
    if (!vowelGroups) {
      count += 1;
      continue;
    }
    
    let syllables = vowelGroups.length;
    
    // Subtract silent 'e' at the end
    if (word.endsWith('e') && syllables > 1) {
      syllables--;
    }
    
    // Add the syllables for this word
    count += syllables || 1;
  }
  
  return Math.max(count, 1);
};
