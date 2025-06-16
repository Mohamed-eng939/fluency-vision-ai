
/**
 * Local coherence analysis fallback system
 */

interface LocalCoherenceResult {
  score: number;
  method: 'local_fallback';
  isFallback: true;
  fallbackReason: string;
  keywordOverlapRatio: number;
  sentenceConnectivity: number;
}

/**
 * Generate local coherence estimate using keyword overlap and basic text analysis
 */
export const generateLocalCoherenceEstimate = (
  promptText: string,
  responseText: string,
  fallbackReason: string = 'External coherence API unavailable'
): LocalCoherenceResult => {
  if (!responseText || !promptText) {
    return {
      score: 0.3,
      method: 'local_fallback',
      isFallback: true,
      fallbackReason,
      keywordOverlapRatio: 0,
      sentenceConnectivity: 0
    };
  }
  
  // Calculate keyword overlap
  const keywordOverlapRatio = calculateKeywordOverlap(promptText, responseText);
  
  // Analyze sentence connectivity
  const sentenceConnectivity = analyzeSentenceConnectivity(responseText);
  
  // Calculate base score from overlap and connectivity
  let score = (keywordOverlapRatio * 0.6) + (sentenceConnectivity * 0.4);
  
  // Add length and complexity bonuses
  const wordCount = responseText.split(/\s+/).length;
  if (wordCount > 50) {
    score += 0.1; // Bonus for substantial response
  }
  
  // Ensure score is in reasonable range
  score = Math.max(0.2, Math.min(0.9, score));
  
  return {
    score,
    method: 'local_fallback',
    isFallback: true,
    fallbackReason,
    keywordOverlapRatio,
    sentenceConnectivity
  };
};

/**
 * Calculate keyword overlap between prompt and response
 */
const calculateKeywordOverlap = (prompt: string, response: string): number => {
  const promptWords = extractKeywords(prompt.toLowerCase());
  const responseWords = extractKeywords(response.toLowerCase());
  
  if (promptWords.length === 0 || responseWords.length === 0) return 0;
  
  let overlap = 0;
  promptWords.forEach(word => {
    if (responseWords.includes(word)) {
      overlap++;
    }
  });
  
  return overlap / Math.max(promptWords.length, responseWords.length);
};

/**
 * Extract meaningful keywords from text
 */
const extractKeywords = (text: string): string[] => {
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 
    'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 
    'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
    'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'my', 'your', 'his',
    'her', 'its', 'our', 'their'
  ]);
  
  return text
    .split(/\s+/)
    .map(word => word.replace(/[^\w]/g, ''))
    .filter(word => word.length > 2 && !stopWords.has(word));
};

/**
 * Analyze sentence connectivity using discourse markers
 */
const analyzeSentenceConnectivity = (text: string): number => {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  if (sentences.length < 2) return 0.3;
  
  const connectiveWords = [
    'however', 'therefore', 'moreover', 'furthermore', 'additionally',
    'consequently', 'meanwhile', 'nevertheless', 'thus', 'hence',
    'also', 'then', 'next', 'first', 'second', 'finally',
    'because', 'since', 'although', 'while', 'whereas'
  ];
  
  let connectivityScore = 0;
  const textLower = text.toLowerCase();
  
  connectiveWords.forEach(word => {
    if (textLower.includes(word)) {
      connectivityScore += 0.1;
    }
  });
  
  return Math.min(1, connectivityScore);
};

/**
 * Check if coherence result is from fallback
 */
export const isCoherenceFallback = (result: any): result is LocalCoherenceResult => {
  return result && result.isFallback === true;
};
