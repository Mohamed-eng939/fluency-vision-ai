/**
 * Expert-aligned coherence scoring based on IELTS/PTE band descriptors
 * Uses semantic cohesion analysis and discourse marker evaluation
 */

export interface CoherenceAnalysis {
  logicalFlow: number; // 1-5 scale
  discourseMarkerUsage: number; // 0-100%
  topicDevelopment: number; // 1-5 scale
  semanticCohesion: number; // 0-100%
  bandScore: number;
  fallbackUsed: boolean;
  bandJustification: string;
  discourseMarkers: {
    total: number;
    types: Record<string, number>;
    appropriateUsage: number;
  };
}

/**
 * Discourse marker categories
 */
const DISCOURSE_MARKERS = {
  sequence: ['first', 'firstly', 'second', 'secondly', 'then', 'next', 'finally', 'lastly'],
  addition: ['also', 'moreover', 'furthermore', 'in addition', 'besides', 'additionally'],
  contrast: ['however', 'nevertheless', 'on the other hand', 'although', 'despite', 'whereas'],
  cause: ['because', 'since', 'as', 'due to', 'owing to', 'as a result', 'therefore', 'consequently'],
  example: ['for example', 'for instance', 'such as', 'like', 'including'],
  emphasis: ['indeed', 'certainly', 'obviously', 'clearly', 'undoubtedly'],
  conclusion: ['in conclusion', 'to sum up', 'overall', 'all in all', 'to conclude']
};

/**
 * Calculate expert-aligned coherence score using IELTS band descriptors
 */
export const calculateExpertCoherenceScore = async (
  transcript: string,
  promptText?: string
): Promise<CoherenceAnalysis> => {
  
  const sentences = splitIntoSentences(transcript);
  
  // If less than 2 sentences, coherence is severely limited
  if (sentences.length < 2) {
    return {
      logicalFlow: 1,
      discourseMarkerUsage: 0,
      topicDevelopment: 1,
      semanticCohesion: 0,
      bandScore: 4.0,
      fallbackUsed: false,
      bandJustification: 'insufficient content for coherence assessment',
      discourseMarkers: { total: 0, types: {}, appropriateUsage: 0 }
    };
  }
  
  // Analyze discourse markers
  const discourseAnalysis = analyzeDiscourseMarkers(transcript);
  
  // Assess logical flow
  const logicalFlow = assessLogicalFlow(sentences, discourseAnalysis);
  
  // Assess topic development
  const topicDevelopment = assessTopicDevelopment(sentences, promptText);
  
  // Calculate semantic cohesion
  const semanticCohesion = await calculateSemanticCohesion(sentences);
  
  // Determine band score
  const baseScore = getBandFromCoherenceProfile(
    logicalFlow,
    discourseAnalysis.appropriateUsage,
    topicDevelopment,
    semanticCohesion
  );
  
  const justification = createCoherenceJustification(
    logicalFlow,
    discourseAnalysis,
    topicDevelopment,
    semanticCohesion
  );
  
  let finalScore = baseScore;
  
  // Apply penalties and bonuses
  if (sentences.length < 3) {
    finalScore = Math.min(finalScore, 5.5); // Cap for very short responses
  }
  
  if (discourseAnalysis.total === 0) {
    finalScore = Math.min(finalScore, 6.0); // Cap for no discourse markers
  }
  
  if (topicDevelopment >= 4 && semanticCohesion > 80) {
    finalScore += 0.5; // Bonus for excellent development
  }
  
  // Ensure score is within valid band range
  finalScore = Math.max(1.0, Math.min(9.0, finalScore));
  
  return {
    logicalFlow,
    discourseMarkerUsage: discourseAnalysis.appropriateUsage,
    topicDevelopment,
    semanticCohesion,
    bandScore: Math.round(finalScore * 2) / 2, // Round to nearest 0.5
    fallbackUsed: false,
    bandJustification: justification,
    discourseMarkers: {
      total: discourseAnalysis.total,
      types: discourseAnalysis.types,
      appropriateUsage: discourseAnalysis.appropriateUsage
    }
  };
};

/**
 * Split text into sentences
 */
function splitIntoSentences(text: string): string[] {
  return text
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 0);
}

/**
 * Analyze discourse marker usage
 */
function analyzeDiscourseMarkers(transcript: string): {
  total: number;
  types: Record<string, number>;
  appropriateUsage: number;
} {
  const text = transcript.toLowerCase();
  const foundMarkers: string[] = [];
  const typeCount: Record<string, number> = {};
  
  Object.entries(DISCOURSE_MARKERS).forEach(([type, markers]) => {
    typeCount[type] = 0;
    markers.forEach(marker => {
      const regex = new RegExp(`\\b${marker}\\b`, 'gi');
      const matches = text.match(regex);
      if (matches) {
        foundMarkers.push(...matches);
        typeCount[type] += matches.length;
      }
    });
  });
  
  // Calculate appropriate usage (simplified - assumes all found markers are appropriate)
  const uniqueTypes = Object.values(typeCount).filter(count => count > 0).length;
  const appropriateUsage = foundMarkers.length > 0 ? Math.min(100, uniqueTypes * 25) : 0;
  
  return {
    total: foundMarkers.length,
    types: typeCount,
    appropriateUsage
  };
}

/**
 * Assess logical flow (1-5 scale)
 */
function assessLogicalFlow(sentences: string[], discourseAnalysis: any): number {
  if (sentences.length < 2) return 1;
  
  let flowScore = 2; // Base score
  
  // Bonus for discourse markers
  if (discourseAnalysis.total > 0) flowScore++;
  if (discourseAnalysis.total > 2) flowScore++;
  
  // Check for logical sequence markers
  const hasSequence = discourseAnalysis.types.sequence > 0;
  const hasContrast = discourseAnalysis.types.contrast > 0;
  const hasCause = discourseAnalysis.types.cause > 0;
  
  if (hasSequence && (hasContrast || hasCause)) flowScore++;
  
  return Math.min(5, flowScore);
}

/**
 * Assess topic development (1-5 scale)
 */
function assessTopicDevelopment(sentences: string[], promptText?: string): number {
  if (sentences.length < 2) return 1;
  
  let developmentScore = 2; // Base score
  
  // Bonus for length and structure
  if (sentences.length >= 4) developmentScore++;
  if (sentences.length >= 6) developmentScore++;
  
  // Check for idea development (simplified)
  const avgSentenceLength = sentences.reduce((sum, s) => sum + s.split(' ').length, 0) / sentences.length;
  if (avgSentenceLength > 8) developmentScore++;
  
  return Math.min(5, developmentScore);
}

/**
 * Calculate semantic cohesion using simplified similarity
 */
async function calculateSemanticCohesion(sentences: string[]): Promise<number> {
  if (sentences.length < 2) return 0;
  
  // Simplified semantic analysis - check for repeated key words/themes
  const allWords = sentences.join(' ').toLowerCase().split(/\s+/);
  const wordFreq: Record<string, number> = {};
  
  allWords.forEach(word => {
    if (word.length > 3) { // Focus on content words
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    }
  });
  
  // Calculate cohesion based on word repetition and semantic links
  const repeatedWords = Object.values(wordFreq).filter(freq => freq > 1).length;
  const totalContentWords = Object.keys(wordFreq).length;
  
  const cohesionScore = totalContentWords > 0 ? (repeatedWords / totalContentWords) * 100 : 0;
  
  return Math.min(100, cohesionScore + 40); // Add base cohesion assumption
}

/**
 * Determine band score from coherence profile
 */
function getBandFromCoherenceProfile(
  logicalFlow: number,
  discourseMarkerUsage: number,
  topicDevelopment: number,
  semanticCohesion: number
): number {
  
  // Extended, logically developed response → Band 8–9
  if (logicalFlow >= 4 && topicDevelopment >= 4 && semanticCohesion > 70) {
    return semanticCohesion > 85 ? 9.0 : 8.5;
  }
  
  // Clear flow with cohesive devices → Band 7
  if (logicalFlow >= 3 && discourseMarkerUsage > 50 && topicDevelopment >= 3) {
    return semanticCohesion > 60 ? 7.5 : 7.0;
  }
  
  // Basic topic structure → Band 6
  if (logicalFlow >= 2 && topicDevelopment >= 2) {
    return discourseMarkerUsage > 25 ? 6.5 : 6.0;
  }
  
  // Disjointed or off-topic → Band 4–5
  return logicalFlow > 1 ? 5.0 : 4.5;
}

/**
 * Create justification text for coherence score
 */
function createCoherenceJustification(
  logicalFlow: number,
  discourseAnalysis: any,
  topicDevelopment: number,
  semanticCohesion: number
): string {
  const flowLevel = logicalFlow >= 4 ? 'excellent' : logicalFlow >= 3 ? 'good' : logicalFlow >= 2 ? 'basic' : 'poor';
  const markerUsage = discourseAnalysis.total > 2 ? 'varied' : discourseAnalysis.total > 0 ? 'some' : 'no';
  const development = topicDevelopment >= 4 ? 'extended' : topicDevelopment >= 3 ? 'adequate' : 'limited';
  
  return `${flowLevel} flow, ${markerUsage} discourse markers, ${development} development`;
}