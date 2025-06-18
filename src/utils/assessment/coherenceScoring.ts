
/**
 * Calculate coherence score
 * Enhanced version with external API integration and reliable fallback methods
 */

import { countPropositions } from './textAnalysisUtils';
import { getAllDiscourseMarkers, countDiscourseMarkersByType, getMarkerTypeCount, checkFrontLoadedMarkers } from './coherence/discourseMarkerAnalysis';
import { determineIfLowerLevel } from './coherence/levelDetection';
import { splitIntoSentences, calculateTextMetrics } from './coherence/sentenceAnalysis';
import { calculateSemanticSimilarity, scoreBasedOnSemanticSimilarity } from './coherence/semanticSimilarity';
import { calculateTraditionalCoherenceScore } from './coherence/traditionalScoring';
import { getCoherenceScore } from './coherence/externalCoherenceApi';
import { generateLocalCoherenceEstimate, isCoherenceFallback } from './coherenceFallback';
import { hasSBERTSupport } from './embeddings';

export const calculateCoherenceScore = async (
  audioMetrics: any,
  transcript: string,
  promptText?: string
): Promise<number> => {
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
  
  // Try external coherence API if we have a prompt reference
  if (promptText) {
    try {
      console.log('Using external coherence API for scoring...');
      
      const coherenceResult = await getCoherenceScore(promptText, transcript, 'both');
      
      console.log('External coherence API result:', coherenceResult);
      
      // Check if fallback was used
      if (coherenceResult.isFallback) {
        console.log('Coherence API used fallback, using local estimation');
        // Still use the result but know it's estimated
      }
      
      // Convert 0-1 similarity score to 1-10 scale
      let score = 1 + (coherenceResult.averageScore * 9);
      
      // Apply discourse marker adjustments
      if (markerCounts.total > 0) {
        score += Math.min(markerTypeCount * 0.5, 2);
      }
      
      // Apply proposition complexity bonus
      if (propositionCount > 3) {
        score += Math.min((propositionCount - 3) * 0.3, 1.5);
      }
      
      // Average sentence length check
      if (avgWordsPerSentence < 4) {
        score = Math.min(score, 5.0);
      }
      
      // Front-loaded discourse marker penalty
      if (markerCounts.total === 1 && frontLoadedMarker) {
        score = Math.max(1, score - 1);
      }
      
      // Level-based adjustments
      if (isLowerLevel && score > 7) {
        score = Math.min(score, 7);
      }
      
      return Math.max(1, Math.min(10, score));
      
    } catch (error) {
      console.error("External coherence API failed completely, using traditional fallback:", error);
      
      // Use traditional fallback when API wrapper also fails
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
    }
  }
  
  // Try semantic similarity scoring if available (local SBERT)
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
      console.error("Error in local SBERT coherence analysis:", error);
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
