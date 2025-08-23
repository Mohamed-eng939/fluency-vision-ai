/**
 * Rigorous CEFR Scoring System
 * Main entry point for deterministic, evidence-based CEFR assessment
 */

import { scoreResponseWithCEFR, CEFRScoringResult } from './cefrScoringIntegration';
import { performBenchmarkComparison, BenchmarkComparison } from './benchmarkComparison';
import { generateEvidenceBasedFeedback, EvidenceBasedFeedback } from './evidenceBasedFeedback';
import { CEFRLevel } from '../../types/assessment';

export interface RigorousCEFRAssessment {
  isReliable: boolean;
  primaryAssessment: CEFRScoringResult;
  benchmarkComparison?: BenchmarkComparison;
  detailedFeedback: EvidenceBasedFeedback;
  qualityChecks: {
    sufficientLength: boolean;
    minimumSimilarity: boolean;
    rubricConfidence: boolean;
    overallReliability: number;
  };
  recommendations: string[];
}

/**
 * Perform comprehensive rigorous CEFR assessment
 */
export const performRigorousCEFRAssessment = (
  transcript: string,
  promptId?: string,
  audioMetrics?: any,
  options: {
    minWords?: number;
    minSimilarity?: number;
    minConfidence?: number;
  } = {}
): RigorousCEFRAssessment => {
  
  const { 
    minWords = 10, 
    minSimilarity = 0.2, 
    minConfidence = 0.4 
  } = options;
  
  // Step 1: Initial validation
  const words = transcript.trim().split(/\s+/).filter(w => w.length > 0);
  const sufficientLength = words.length >= minWords;
  
  if (!sufficientLength) {
    return createUnreliableAssessment(
      `Insufficient response length: ${words.length} words (minimum: ${minWords})`,
      transcript,
      promptId
    );
  }
  
  // Step 2: Evidence-based feedback generation
  const detailedFeedback = generateEvidenceBasedFeedback(
    transcript, 
    promptId, 
    minSimilarity, 
    minWords
  );
  
  if (!detailedFeedback.isReliable) {
    return createUnreliableAssessment(
      detailedFeedback.insufficientDataReason || 'Assessment not reliable',
      transcript,
      promptId,
      detailedFeedback
    );
  }
  
  // Step 3: Benchmark comparison (if prompt ID available)
  let benchmarkComparison: BenchmarkComparison | undefined;
  let minimumSimilarity = true;
  
  if (promptId) {
    benchmarkComparison = performBenchmarkComparison(transcript, promptId, minSimilarity);
    minimumSimilarity = benchmarkComparison !== null;
    
    if (!minimumSimilarity) {
      return createUnreliableAssessment(
        `Low similarity to CEFR benchmarks (minimum: ${minSimilarity})`,
        transcript,
        promptId,
        detailedFeedback
      );
    }
  }
  
  // Step 4: Primary CEFR assessment
  const primaryAssessment = scoreResponseWithCEFR(transcript, promptId, audioMetrics);
  
  // Step 5: Quality checks
  const rubricConfidence = detailedFeedback.confidence >= minConfidence;
  const overallReliability = calculateOverallReliability(
    sufficientLength,
    minimumSimilarity,
    rubricConfidence,
    detailedFeedback.confidence,
    benchmarkComparison?.confidence || 0
  );
  
  // Step 6: Generate recommendations
  const recommendations = generateRecommendations(
    detailedFeedback,
    benchmarkComparison,
    primaryAssessment
  );
  
  return {
    isReliable: overallReliability >= 0.6,
    primaryAssessment,
    benchmarkComparison,
    detailedFeedback,
    qualityChecks: {
      sufficientLength,
      minimumSimilarity,
      rubricConfidence,
      overallReliability
    },
    recommendations
  };
};

/**
 * Create assessment result for unreliable cases
 */
const createUnreliableAssessment = (
  reason: string,
  transcript: string,
  promptId?: string,
  partialFeedback?: EvidenceBasedFeedback
): RigorousCEFRAssessment => {
  
  const unreliablePrimary: CEFRScoringResult = {
    isReliable: false,
    finalLevel: 'A1',
    finalScore: 0,
    metrics: {
      fluency: 0,
      grammar: 0,
      pronunciation: 0,
      prosody: 0,
      vocabulary: 0,
      syntax: 0,
      coherence: 0
    },
    feedback: {
      strengths: [],
      improvements: [],
      evidence: [`Assessment unreliable: ${reason}`]
    },
    confidence: 0,
    reason
  };
  
  const unreliableFeedback: EvidenceBasedFeedback = partialFeedback || {
    isReliable: false,
    overallLevel: 'A1',
    confidence: 0,
    grammar: { score: 0, level: 'A1', citations: [], rubricEvidence: [] },
    vocabulary: { score: 0, level: 'A1', citations: [], rubricEvidence: [] },
    coherence: { score: 0, level: 'A1', citations: [], rubricEvidence: [] },
    insufficientDataReason: reason
  };
  
  return {
    isReliable: false,
    primaryAssessment: unreliablePrimary,
    detailedFeedback: unreliableFeedback,
    qualityChecks: {
      sufficientLength: false,
      minimumSimilarity: false,
      rubricConfidence: false,
      overallReliability: 0
    },
    recommendations: [
      'Provide a longer, more detailed response',
      'Address the prompt more directly',
      'Use more sophisticated vocabulary and grammar structures'
    ]
  };
};

/**
 * Calculate overall reliability score
 */
const calculateOverallReliability = (
  sufficientLength: boolean,
  minimumSimilarity: boolean,
  rubricConfidence: boolean,
  feedbackConfidence: number,
  benchmarkConfidence: number
): number => {
  
  let reliability = 0;
  
  // Base requirements (must pass all for any reliability)
  if (!sufficientLength || !minimumSimilarity || !rubricConfidence) {
    return 0;
  }
  
  // Start with base reliability
  reliability += 0.4;
  
  // Add confidence components
  reliability += feedbackConfidence * 0.3;
  reliability += benchmarkConfidence * 0.3;
  
  return Math.min(0.95, reliability);
};

/**
 * Generate actionable recommendations based on assessment
 */
const generateRecommendations = (
  detailedFeedback: EvidenceBasedFeedback,
  benchmarkComparison?: BenchmarkComparison,
  primaryAssessment?: CEFRScoringResult
): string[] => {
  
  const recommendations: string[] = [];
  
  // Level-specific recommendations
  const currentLevel = detailedFeedback.overallLevel;
  const nextLevel = getNextCEFRLevel(currentLevel);
  
  if (nextLevel) {
    recommendations.push(`To reach ${nextLevel} level: Focus on more sophisticated language structures`);
  }
  
  // Skill-specific recommendations based on lowest scores
  const skillScores = [
    { skill: 'grammar', score: detailedFeedback.grammar.score },
    { skill: 'vocabulary', score: detailedFeedback.vocabulary.score },
    { skill: 'coherence', score: detailedFeedback.coherence.score }
  ].sort((a, b) => a.score - b.score);
  
  const weakestSkill = skillScores[0];
  if (weakestSkill.score < 6) {
    recommendations.push(`Priority improvement area: ${weakestSkill.skill} (current level: ${getScoreLevel(weakestSkill.score)})`);
  }
  
  // Benchmark-based recommendations
  if (benchmarkComparison) {
    const skillGaps = benchmarkComparison.skillGaps;
    
    if (skillGaps.vocabulary.length > 0) {
      recommendations.push(`Vocabulary gap: ${skillGaps.vocabulary[0]}`);
    }
    
    if (skillGaps.grammar.length > 0) {
      recommendations.push(`Grammar gap: ${skillGaps.grammar[0]}`);
    }
  }
  
  return recommendations.slice(0, 4); // Top 4 recommendations
};

/**
 * Get next CEFR level for progression
 */
const getNextCEFRLevel = (current: CEFRLevel): CEFRLevel | null => {
  const progression: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const currentIndex = progression.indexOf(current);
  return currentIndex < progression.length - 1 ? progression[currentIndex + 1] : null;
};

/**
 * Convert numeric score to CEFR level
 */
const getScoreLevel = (score: number): CEFRLevel => {
  if (score >= 9) return 'C2';
  if (score >= 8) return 'C1';
  if (score >= 7) return 'B2';
  if (score >= 6) return 'B1';
  if (score >= 4) return 'A2';
  return 'A1';
};