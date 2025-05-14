
import { hasSBERTSupport, computeSentenceSimilarity } from './embeddings';
import { extractEntities, countPropositions } from './textAnalysisUtils';

/**
 * Calculate coherence score
 * Enhanced version with semantic analysis and fallback methods
 */
export const calculateCoherenceScore = (
  audioMetrics: any,
  transcript: string
): number => {
  if (!transcript) return 5;
  
  // Break transcript into sentences
  const sentences = transcript
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 0);
  
  // If less than 2 sentences, coherence is limited
  if (sentences.length < 2) return 5;
  
  // Count distinct propositions/ideas in the text
  const propositionCount = countPropositions(transcript);
  
  // Check for discourse markers (extended list)
  const discourseMarkers = [
    // Sequential markers
    'first', 'firstly', 'second', 'secondly', 'third', 'thirdly',
    'finally', 'lastly', 'in conclusion', 'to sum up', 'to conclude',
    'next', 'then', 'subsequently', 'afterwards', 'after that',
    
    // Contrastive markers
    'however', 'nevertheless', 'nonetheless', 'on the other hand',
    'although', 'though', 'despite', 'in spite of', 'while', 'whereas',
    
    // Causal markers
    'consequently', 'as a result', 'therefore', 'thus', 'hence',
    'because', 'since', 'due to', 'for this reason', 'so',
    
    // Exemplification markers
    'for example', 'for instance', 'such as', 'in particular',
    'namely', 'specifically', 'to illustrate',
    
    // Additive markers
    'in addition', 'furthermore', 'moreover', 'besides', 'also',
    'additionally', 'what is more', 'not only...but also'
  ];
  
  // Group markers by type for more detailed analysis
  const sequentialMarkers = ['first', 'firstly', 'second', 'secondly', 'third', 'next', 'then', 'finally', 'lastly'];
  const contrastiveMarkers = ['however', 'nevertheless', 'nonetheless', 'on the other hand', 'although', 'though', 'despite'];
  const causalMarkers = ['consequently', 'as a result', 'therefore', 'thus', 'hence', 'because', 'since', 'so'];
  const additiveMarkers = ['in addition', 'furthermore', 'moreover', 'besides', 'also', 'additionally'];
  
  // Count discourse markers by type
  const transcriptLower = transcript.toLowerCase();
  const markerCount = discourseMarkers.filter(marker => transcriptLower.includes(marker)).length;
  const sequentialCount = sequentialMarkers.filter(marker => transcriptLower.includes(marker)).length;
  const contrastiveCount = contrastiveMarkers.filter(marker => transcriptLower.includes(marker)).length;
  const causalCount = causalMarkers.filter(marker => transcriptLower.includes(marker)).length;
  const additiveCount = additiveMarkers.filter(marker => transcriptLower.includes(marker)).length;
  
  // Calculate average words per sentence
  const words = transcript.split(/\s+/).filter(w => w.length > 0);
  const avgWordsPerSentence = sentences.length > 0 ? words.length / sentences.length : 0;
  
  // Check if discourse markers appear mostly in the first half of the text
  const frontLoadedMarker = checkFrontLoadedMarkers(transcript, discourseMarkers);
  
  // Try to determine difficulty level from audioMetrics if available
  const isLowerLevel = determineIfLowerLevel(audioMetrics);
  
  // Check if SBERT is available for semantic similarity analysis
  if (hasSBERTSupport()) {
    try {
      // Calculate semantic similarity between adjacent sentences
      let totalSimilarity = 0;
      let lowSimilarityCount = 0;
      let highSimilarityPairFound = false;
      
      for (let i = 0; i < sentences.length - 1; i++) {
        const similarity = computeSentenceSimilarity(sentences[i], sentences[i + 1]);
        totalSimilarity += similarity;
        
        // Count transitions with poor semantic connection
        if (similarity < 0.6) {
          lowSimilarityCount++;
        }
        
        // Check if at least one sentence pair has high similarity (for A1-A2 prompts)
        if (similarity > 0.65) {
          highSimilarityPairFound = true;
        }
      }
      
      // Average similarity across sentence transitions
      const avgSimilarity = sentences.length > 1 ? totalSimilarity / (sentences.length - 1) : 1;
      
      // Calculate coherence score based on semantic similarity and discourse markers
      let score = 5;
      
      // Base score on semantic similarity
      if (avgSimilarity > 0.8) score = 9;
      else if (avgSimilarity > 0.7) score = 8;
      else if (avgSimilarity > 0.6) score = 7;
      else if (avgSimilarity > 0.5) score = 6;
      else if (avgSimilarity > 0.4) score = 5;
      else score = 4;
      
      // Adjust score based on discourse markers and their diversity
      const markerTypeCount = [
        sequentialCount > 0, 
        contrastiveCount > 0, 
        causalCount > 0, 
        additiveCount > 0
      ].filter(Boolean).length;
      
      if (markerCount >= 5 && markerTypeCount >= 3) score = Math.min(10, score + 1);
      else if (markerCount >= 3 && markerTypeCount >= 2) score += 0.5;
      
      // Penalize for low similarity transitions
      if (lowSimilarityCount > sentences.length / 3) {
        score = Math.max(3, score - 1);
      }
      
      // NEW: Minimum idea count check - cap coherence if too few distinct ideas
      if (propositionCount < 2) {
        score = Math.min(score, 4.0);
      }
      
      // NEW: Average sentence length check
      if (avgWordsPerSentence < 4) {
        score = Math.min(score, 5.0);
      }
      
      // NEW: Front-loaded discourse marker penalty
      if (markerCount === 1 && frontLoadedMarker) {
        score = Math.max(1, score - 1);
      }
      
      // NEW: For A1-A2 prompts, require at least one high similarity pair for scores > 6
      if (isLowerLevel && !highSimilarityPairFound && score > 6) {
        score = 6;
      }
      
      return Math.max(1, Math.min(10, score));
      
    } catch (error) {
      console.error("Error in SBERT coherence analysis:", error);
      // Fall back to traditional method if SBERT fails
    }
  }
  
  // Fallback method (enhanced traditional approach)
  // Calculate score based on discourse markers, sentence structure, and topic consistency
  
  // NEW: Reduced default base score unless there's diversity in marker types
  let score = 4.5; // Reduced from 5.0
  const markerTypeCount = [
    sequentialCount > 0, 
    contrastiveCount > 0, 
    causalCount > 0, 
    additiveCount > 0
  ].filter(Boolean).length;
  
  // Only use the original base score if we have 2+ types of discourse markers
  if (markerTypeCount >= 2) {
    // Base score on discourse marker usage (original logic)
    if (markerCount >= 5) score = 8;
    else if (markerCount >= 4) score = 7;
    else if (markerCount >= 3) score = 6.5;
    else if (markerCount >= 2) score = 6;
    else if (markerCount >= 1) score = 5.5;
  } else {
    // Lower base score for limited marker diversity
    if (markerCount >= 5) score = 7.5;
    else if (markerCount >= 4) score = 6.5;
    else if (markerCount >= 3) score = 6;
    else if (markerCount >= 2) score = 5.5;
    else if (markerCount >= 1) score = 5;
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
  
  // Check for proposition/idea count (original logic with NEW minimum cap)
  if (propositionCount >= 4) score += 1;
  else if (propositionCount >= 2) score += 0.5;
  else score = Math.min(score, 4.0); // Cap score if too few distinct ideas
  
  // NEW: Average sentence length check
  if (avgWordsPerSentence < 4) {
    score = Math.min(score, 5.0);
  }
  
  // NEW: Front-loaded discourse marker penalty
  if (markerCount === 1 && frontLoadedMarker) {
    score = Math.max(1, score - 1);
  }
  
  // Adjust for transcript length (original logic)
  if (words.length < 30) score = Math.max(3, score - 1);
  if (words.length > 100) score = Math.min(10, score + 0.5);
  
  // NEW: For A1-A2 prompts, cap coherence score
  if (isLowerLevel) {
    score = Math.min(score, 7.0); // Cap lower level responses
  }
  
  // Ensure score is between 1-10
  return Math.max(1, Math.min(10, score));
};

/**
 * Check if discourse markers appear mostly in the first half of the text
 * Returns true if the only marker appears in the first 50% of the text
 */
const checkFrontLoadedMarkers = (text: string, markers: string[]): boolean => {
  if (!text) return false;
  
  const textLower = text.toLowerCase();
  const textLength = textLower.length;
  const halfwayPoint = Math.floor(textLength / 2);
  
  // Find the position of the first marker
  let firstMarkerPos = textLength;
  let markerFound = false;
  
  for (const marker of markers) {
    const pos = textLower.indexOf(marker);
    if (pos !== -1) {
      markerFound = true;
      firstMarkerPos = Math.min(firstMarkerPos, pos);
    }
  }
  
  // Check if the only marker is in the first half
  return markerFound && firstMarkerPos < halfwayPoint;
};

/**
 * Attempt to determine if the response is likely from a lower level (A1-A2) speaker
 * This is a simplified approach - in a real system, this would use more sophisticated heuristics
 */
const determineIfLowerLevel = (audioMetrics: any): boolean => {
  // Check if we have level information directly in the audioMetrics
  if (audioMetrics && audioMetrics.level) {
    const level = audioMetrics.level.toLowerCase();
    return level.includes('a1') || level.includes('a2');
  }
  
  // If no direct level information, try to infer from other metrics
  if (audioMetrics) {
    // Simple heuristic: if multiple metrics are low, likely a lower level speaker
    let lowMetricsCount = 0;
    
    // Check pronunciation score if available (typical indicator)
    if (audioMetrics.pronunciationScore !== undefined && audioMetrics.pronunciationScore < 6) {
      lowMetricsCount++;
    }
    
    // Check speech rate if available (typical indicator)
    if (audioMetrics.wordsPerMinute !== undefined && audioMetrics.wordsPerMinute < 80) {
      lowMetricsCount++;
    }
    
    // Check pause ratio if available (typical indicator)
    if (audioMetrics.pauseRatio !== undefined && audioMetrics.pauseRatio > 0.4) {
      lowMetricsCount++;
    }
    
    // If multiple metrics indicate lower level, return true
    return lowMetricsCount >= 2;
  }
  
  // Default to false if no useful information is available
  return false;
};
