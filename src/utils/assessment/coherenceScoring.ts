
/**
 * Calculate coherence score
 * Enhanced version with semantic analysis and fallback methods
 */

import { countPropositions } from './textAnalysisUtils';
import { getAllDiscourseMarkers, countDiscourseMarkersByType, getMarkerTypeCount, checkFrontLoadedMarkers } from './coherence/discourseMarkerAnalysis';
import { determineIfLowerLevel } from './coherence/levelDetection';
import { splitIntoSentences, calculateTextMetrics } from './coherence/sentenceAnalysis';
import { calculateSemanticSimilarity, scoreBasedOnSemanticSimilarity } from './coherence/semanticSimilarity';
import { calculateTraditionalCoherenceScore } from './coherence/traditionalScoring';
import { hasSBERTSupport } from './embeddings';

export const calculateCoherenceScore = (
  audioMetrics: any,
  transcript: string
): number => {
  if (!transcript) return 5;
  
  // Get text metrics
  const { sentences, words, avgWordsPerSentence } = calculateTextMetrics(transcript);
  
  // If less than 2 sentences, coherence is limited
  if (sentences.length < 2) return 5;
  
  // Count distinct propositions/ideas in the text
  const propositionCount = countPropositions(transcript);
  
  // Get discourse markers
  const allDiscourseMarkers = getAllDiscourseMarkers();
  const markerCounts = countDiscourseMarkersByType(transcript);
  const markerTypeCount = getMarkerTypeCount(markerCounts);
  
  // Check if discourse markers appear mostly in the first half of the text
  const frontLoadedMarker = checkFrontLoadedMarkers(transcript, allDiscourseMarkers);
  
  // Try to determine difficulty level from audioMetrics if available
  const isLowerLevel = determineIfLowerLevel(audioMetrics);
  
  // Try semantic similarity scoring if available
  if (hasSBERTSupport()) {
    try {
      // Calculate semantic similarity between adjacent sentences
      const similarityData = calculateSemanticSimilarity(sentences);
      
      // If semantic similarity calculation was successful, use it
      if (similarityData.available) {
        // Calculate score based on semantic similarity
        let score = scoreBasedOnSemanticSimilarity(
          similarityData,
          markerCounts.total,
          markerTypeCount,
          propositionCount,
          isLowerLevel
        );
        
        // Average sentence length check
        if (avgWordsPerSentence < 4) {
          score = Math.min(score, 5.0);
        }
        
        // Front-loaded discourse marker penalty
        if (markerCounts.total === 1 && frontLoadedMarker) {
          score = Math.max(1, score - 1);
        }
        
        return Math.max(1, Math.min(10, score));
      }
    } catch (error) {
      console.error("Error in SBERT coherence analysis:", error);
      // Fall back to traditional method if SBERT fails
    }
  }
  
  // Fallback method (enhanced traditional approach)
  return calculateTraditionalCoherenceScore(
    transcript,
    markerCounts,
    markerTypeCount,
    sentences,
    words,
    avgWordsPerSentence,
    propositionCount,
    frontLoadedMarker,
    isLowerLevel
  );
};
