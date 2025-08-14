/**
 * Embedding Similarity Utilities
 * Functions for calculating semantic similarity between learner responses and CEFR benchmark samples
 */

import { cefrSampleBank } from '../../data/assessment/cefrSampleBank';
import { CEFRSample, CEFRLevel } from '../../types/assessment';

// Simple text similarity calculation as fallback
export const calculateTextSimilarity = (text1: string, text2: string): number => {
  const words1 = text1.toLowerCase().split(/\s+/);
  const words2 = text2.toLowerCase().split(/\s+/);
  
  const set1 = new Set(words1);
  const set2 = new Set(words2);
  
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  
  return intersection.size / union.size; // Jaccard similarity
};

// Calculate cosine similarity between two text vectors (simplified)
export const calculateCosineSimilarity = (text1: string, text2: string): number => {
  // Create simple word frequency vectors
  const getWordFreq = (text: string) => {
    const words = text.toLowerCase().split(/\s+/);
    const freq: { [key: string]: number } = {};
    words.forEach(word => {
      freq[word] = (freq[word] || 0) + 1;
    });
    return freq;
  };
  
  const freq1 = getWordFreq(text1);
  const freq2 = getWordFreq(text2);
  
  // Get all unique words
  const allWords = new Set([...Object.keys(freq1), ...Object.keys(freq2)]);
  
  // Create vectors
  const vector1: number[] = [];
  const vector2: number[] = [];
  
  allWords.forEach(word => {
    vector1.push(freq1[word] || 0);
    vector2.push(freq2[word] || 0);
  });
  
  // Calculate dot product and magnitudes
  let dotProduct = 0;
  let magnitude1 = 0;
  let magnitude2 = 0;
  
  for (let i = 0; i < vector1.length; i++) {
    dotProduct += vector1[i] * vector2[i];
    magnitude1 += vector1[i] * vector1[i];
    magnitude2 += vector2[i] * vector2[i];
  }
  
  magnitude1 = Math.sqrt(magnitude1);
  magnitude2 = Math.sqrt(magnitude2);
  
  if (magnitude1 === 0 || magnitude2 === 0) return 0;
  
  return dotProduct / (magnitude1 * magnitude2);
};

export interface SimilarityMatch {
  sample: CEFRSample;
  similarity: number;
  level: CEFRLevel;
}

/**
 * Find the most similar CEFR samples for a given transcript and prompt
 */
export const findSimilarSamples = (
  transcript: string, 
  promptId: string
): SimilarityMatch[] => {
  if (!transcript || transcript.trim().length < 5) {
    return [];
  }
  
  const relevantSamples = Object.values(cefrSampleBank).filter(
    sample => sample.promptId === promptId
  );
  
  const matches: SimilarityMatch[] = relevantSamples.map(sample => ({
    sample,
    similarity: calculateCosineSimilarity(transcript, sample.transcript),
    level: sample.level as CEFRLevel
  }));
  
  return matches.sort((a, b) => b.similarity - a.similarity);
};

/**
 * Get the best matching CEFR level based on similarity
 */
export const getBestMatchingLevel = (
  transcript: string, 
  promptId: string,
  minSimilarity: number = 0.1
): { level: CEFRLevel; confidence: number; rationale: string } | null => {
  const matches = findSimilarSamples(transcript, promptId);
  
  if (matches.length === 0 || matches[0].similarity < minSimilarity) {
    return null;
  }
  
  const bestMatch = matches[0];
  
  return {
    level: bestMatch.level,
    confidence: bestMatch.similarity,
    rationale: `Response most similar to ${bestMatch.level} benchmark (${(bestMatch.similarity * 100).toFixed(1)}% similarity)`
  };
};

/**
 * Calculate weighted CEFR level based on multiple similar samples
 */
export const calculateWeightedCEFRLevel = (
  transcript: string,
  promptId: string,
  minSimilarity: number = 0.1
): { level: CEFRLevel; confidence: number; evidence: string[] } | null => {
  const matches = findSimilarSamples(transcript, promptId);
  
  // Filter matches above minimum similarity
  const validMatches = matches.filter(match => match.similarity >= minSimilarity);
  
  if (validMatches.length === 0) {
    return null;
  }
  
  // Calculate weighted average
  const levelValues: { [key in CEFRLevel]: number } = {
    'A1': 1, 'A2': 2, 'B1': 3, 'B2': 4, 'C1': 5, 'C2': 6, 'Pre-A1': 0,
    'A1+': 1.5, 'A2+': 2.5, 'B1+': 3.5, 'B2+': 4.5, 'C1+': 5.5
  };
  
  let weightedSum = 0;
  let totalWeight = 0;
  const evidence: string[] = [];
  
  validMatches.slice(0, 3).forEach(match => { // Use top 3 matches
    const weight = match.similarity;
    const value = levelValues[match.level] || 1;
    weightedSum += value * weight;
    totalWeight += weight;
    
    evidence.push(`${match.level} similarity: ${(match.similarity * 100).toFixed(1)}%`);
  });
  
  const averageValue = weightedSum / totalWeight;
  
  // Convert back to CEFR level
  const levels = Object.entries(levelValues).sort((a, b) => a[1] - b[1]);
  const closestLevel = levels.reduce((prev, curr) => 
    Math.abs(curr[1] - averageValue) < Math.abs(prev[1] - averageValue) ? curr : prev
  );
  
  return {
    level: closestLevel[0] as CEFRLevel,
    confidence: totalWeight / validMatches.length,
    evidence
  };
};