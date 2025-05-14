
/**
 * Fallback coherence scoring methods when semantic similarity is not available
 */

import { extractEntities } from '../textAnalysisUtils';

/**
 * Calculate coherence score using traditional markers and text structure
 */
export const calculateTraditionalCoherenceScore = (
  transcript: string,
  markerCounts: Record<string, number>,
  markerTypeCount: number,
  sentences: string[],
  words: string[],
  avgWordsPerSentence: number,
  propositionCount: number,
  frontLoadedMarker: boolean,
  isLowerLevel: boolean
): number => {
  // Reduced default base score unless there's diversity in marker types
  let score = 4.5; // Reduced from 5.0
  
  // Only use the original base score if we have 2+ types of discourse markers
  if (markerTypeCount >= 2) {
    // Base score on discourse marker usage (original logic)
    if (markerCounts.total >= 5) score = 8;
    else if (markerCounts.total >= 4) score = 7;
    else if (markerCounts.total >= 3) score = 6.5;
    else if (markerCounts.total >= 2) score = 6;
    else if (markerCounts.total >= 1) score = 5.5;
  } else {
    // Lower base score for limited marker diversity
    if (markerCounts.total >= 5) score = 7.5;
    else if (markerCounts.total >= 4) score = 6.5;
    else if (markerCounts.total >= 3) score = 6;
    else if (markerCounts.total >= 2) score = 5.5;
    else if (markerCounts.total >= 1) score = 5;
  }
  
  // Adjust for diversity of marker types (original logic)
  if (markerTypeCount >= 3) score += 1;
  else if (markerTypeCount >= 2) score += 0.5;
  
  // Adjust for sentence count and structure (original logic)
  if (sentences.length >= 5) score += 0.5;
  
  // Extract entities and check for topic consistency (original logic)
  const entities = extractEntities(transcript);
  const uniqueEntities = new Set(entities).size;
  const entityRepetition = entities.length / Math.max(1, uniqueEntities);
  
  // Some repetition is good for coherence, too much isn't (original logic)
  if (entityRepetition > 1.5 && entityRepetition < 3) score += 0.5;
  
  // Check for proposition/idea count (original logic with minimum cap)
  if (propositionCount >= 4) score += 1;
  else if (propositionCount >= 2) score += 0.5;
  else score = Math.min(score, 4.0); // Cap score if too few distinct ideas
  
  // Average sentence length check
  if (avgWordsPerSentence < 4) {
    score = Math.min(score, 5.0);
  }
  
  // Front-loaded discourse marker penalty
  if (markerCounts.total === 1 && frontLoadedMarker) {
    score = Math.max(1, score - 1);
  }
  
  // Adjust for transcript length (original logic)
  if (words.length < 30) score = Math.max(3, score - 1);
  if (words.length > 100) score = Math.min(10, score + 0.5);
  
  // For A1-A2 prompts, cap coherence score
  if (isLowerLevel) {
    score = Math.min(score, 7.0); // Cap lower level responses
  }
  
  // Ensure score is between 1-10
  return Math.max(1, Math.min(10, score));
};
