
/**
 * Handles semantic similarity calculations for coherence scoring
 */

import { hasSBERTSupport, computeSentenceSimilarity } from '../embeddings';

/**
 * Calculate semantic similarity between adjacent sentences
 * Returns similarity scores and analysis results
 */
export const calculateSemanticSimilarity = (sentences: string[]) => {
  // Default return object with no similarity data
  const defaultResult = {
    available: false,
    avgSimilarity: 0,
    lowSimilarityCount: 0,
    highSimilarityPairFound: false,
    pairSimilarities: [] as number[]
  };
  
  // If there are less than 2 sentences, no similarity to calculate
  if (sentences.length < 2) return defaultResult;
  
  // Check if SBERT is available for similarity calculation
  if (!hasSBERTSupport()) return defaultResult;
  
  try {
    // Calculate similarity between adjacent sentences
    let totalSimilarity = 0;
    let lowSimilarityCount = 0;
    let highSimilarityPairFound = false;
    const pairSimilarities: number[] = [];
    
    for (let i = 0; i < sentences.length - 1; i++) {
      const similarity = computeSentenceSimilarity(sentences[i], sentences[i + 1]);
      pairSimilarities.push(similarity);
      totalSimilarity += similarity;
      
      // Count transitions with poor semantic connection
      if (similarity < 0.6) {
        lowSimilarityCount++;
      }
      
      // Check if at least one sentence pair has high similarity
      if (similarity > 0.65) {
        highSimilarityPairFound = true;
      }
    }
    
    // Average similarity across sentence transitions
    const avgSimilarity = sentences.length > 1 ? totalSimilarity / (sentences.length - 1) : 1;
    
    return {
      available: true,
      avgSimilarity,
      lowSimilarityCount,
      highSimilarityPairFound,
      pairSimilarities
    };
  } catch (error) {
    console.error("Error in semantic similarity calculation:", error);
    return defaultResult;
  }
};

/**
 * Calculate a coherence score based on semantic similarity metrics
 */
export const scoreBasedOnSemanticSimilarity = (
  similarityData: ReturnType<typeof calculateSemanticSimilarity>,
  markerCount: number,
  markerTypeCount: number,
  propositionCount: number,
  isLowerLevel: boolean
): number => {
  // If similarity data isn't available, return 0 (caller should use fallback)
  if (!similarityData.available) return 0;
  
  // Base score on semantic similarity
  let score = 5; // Default
  if (similarityData.avgSimilarity > 0.8) score = 9;
  else if (similarityData.avgSimilarity > 0.7) score = 8;
  else if (similarityData.avgSimilarity > 0.6) score = 7;
  else if (similarityData.avgSimilarity > 0.5) score = 6;
  else if (similarityData.avgSimilarity > 0.4) score = 5;
  else score = 4;
  
  // Adjust score based on discourse markers and their diversity
  if (markerCount >= 5 && markerTypeCount >= 3) score = Math.min(10, score + 1);
  else if (markerCount >= 3 && markerTypeCount >= 2) score += 0.5;
  
  // Penalize for low similarity transitions
  const sentenceCount = similarityData.pairSimilarities.length + 1;
  if (similarityData.lowSimilarityCount > sentenceCount / 3) {
    score = Math.max(3, score - 1);
  }
  
  // Cap coherence if too few distinct ideas
  if (propositionCount < 2) {
    score = Math.min(score, 4.0);
  }
  
  // For A1-A2 prompts, require at least one high similarity pair for scores > 6
  if (isLowerLevel && !similarityData.highSimilarityPairFound && score > 6) {
    score = 6;
  }
  
  return score;
};
