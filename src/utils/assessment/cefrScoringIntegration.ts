/**
 * CEFR Scoring Integration
 * Main integration point for evidence-based CEFR scoring using similarity matching and rubric validation
 */

import { generateEvidenceBasedFeedback } from './evidenceBasedFeedback';
import { performBenchmarkComparison } from './benchmarkComparison';
import { AssessmentMetrics, CEFRLevel } from '../../types/assessment';

export interface CEFRScoringResult {
  isReliable: boolean;
  finalLevel: CEFRLevel;
  finalScore: number;
  metrics: AssessmentMetrics;
  feedback: {
    strengths: string[];
    improvements: string[];
    evidence: string[];
  };
  confidence: number;
  reason?: string;
}

/**
 * Main function to score a learner response using rigorous evidence-based CEFR assessment
 */
export const scoreResponseWithCEFR = (
  transcript: string,
  promptId?: string,
  audioMetrics?: any
): CEFRScoringResult => {
  
  // Use the new evidence-based feedback system
  const evidenceFeedback = generateEvidenceBasedFeedback(transcript, promptId);
  
  if (!evidenceFeedback.isReliable) {
    return {
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
        evidence: [`Assessment not reliable: ${evidenceFeedback.insufficientDataReason}`]
      },
      confidence: 0,
      reason: evidenceFeedback.insufficientDataReason
    };
  }
  
  // Extract rubric-based scores
  const grammarScore = evidenceFeedback.grammar.score;
  const vocabularyScore = evidenceFeedback.vocabulary.score;
  const coherenceScore = evidenceFeedback.coherence.score;
  
  // Use audio metrics if available, otherwise estimate from linguistic analysis
  const fluencyScore = audioMetrics?.fluencyScore || Math.max(4, coherenceScore - 1);
  const pronunciationScore = audioMetrics?.pronunciationScore || 5;
  const prosodyScore = audioMetrics?.prosodyScore || 5;
  const syntaxScore = grammarScore; // Syntax closely related to grammar
  
  const metrics: AssessmentMetrics = {
    fluency: fluencyScore,
    grammar: grammarScore,
    pronunciation: pronunciationScore,
    prosody: prosodyScore,
    vocabulary: vocabularyScore,
    syntax: syntaxScore,
    coherence: coherenceScore
  };
  
  // Calculate final score (weighted average)
  const finalScore = (
    grammarScore * 0.25 +
    vocabularyScore * 0.25 +
    coherenceScore * 0.25 +
    fluencyScore * 0.15 +
    syntaxScore * 0.1
  );
  
  // Collect evidence-based feedback
  const allStrengths: string[] = [];
  const allImprovements: string[] = [];
  const allEvidence: string[] = [];
  
  // Grammar citations
  evidenceFeedback.grammar.citations.forEach(citation => {
    allStrengths.push(`Grammar: ${citation.analysis}`);
    allImprovements.push(`Grammar: ${citation.improvement}`);
    allEvidence.push(`Quote: "${citation.quote}" - ${citation.analysis}`);
  });
  
  // Vocabulary citations  
  evidenceFeedback.vocabulary.citations.forEach(citation => {
    allStrengths.push(`Vocabulary: ${citation.analysis}`);
    allImprovements.push(`Vocabulary: ${citation.improvement}`);
    allEvidence.push(`Quote: "${citation.quote}" - ${citation.analysis}`);
  });
  
  // Coherence citations
  evidenceFeedback.coherence.citations.forEach(citation => {
    allStrengths.push(`Coherence: ${citation.analysis}`);
    allImprovements.push(`Coherence: ${citation.improvement}`);
    allEvidence.push(`Quote: "${citation.quote}" - ${citation.analysis}`);
  });
  
  // Add rubric evidence
  allEvidence.push(...evidenceFeedback.grammar.rubricEvidence.map(e => `Grammar rubric: ${e}`));
  allEvidence.push(...evidenceFeedback.vocabulary.rubricEvidence.map(e => `Vocabulary rubric: ${e}`));
  allEvidence.push(...evidenceFeedback.coherence.rubricEvidence.map(e => `Coherence rubric: ${e}`));
  
  // Add benchmark comparison if available
  if (promptId && evidenceFeedback.similarityAnalysis) {
    allEvidence.push(`Benchmark: ${evidenceFeedback.similarityAnalysis.levelJustification}`);
  }
  
  return {
    isReliable: true,
    finalLevel: evidenceFeedback.overallLevel,
    finalScore: Math.round(finalScore * 10) / 10,
    metrics,
    feedback: {
      strengths: allStrengths.slice(0, 5), // Top 5 strengths
      improvements: allImprovements.slice(0, 5), // Top 5 improvements
      evidence: allEvidence.slice(0, 8) // Top 8 pieces of evidence
    },
    confidence: evidenceFeedback.confidence
  };
};

/**
 * Generate human-readable feedback summary
 */
export const generateFeedbackSummary = (result: CEFRScoringResult): string => {
  if (!result.isReliable) {
    return `Unable to provide reliable assessment: ${result.reason}`;
  }
  
  const parts = [
    `CEFR Level: ${result.finalLevel} (Score: ${result.finalScore}/10, Confidence: ${(result.confidence * 100).toFixed(0)}%)`,
  ];
  
  if (result.feedback.strengths.length > 0) {
    parts.push(`\nStrengths:\n• ${result.feedback.strengths.slice(0, 3).join('\n• ')}`);
  }
  
  if (result.feedback.improvements.length > 0) {
    parts.push(`\nAreas for improvement:\n• ${result.feedback.improvements.slice(0, 3).join('\n• ')}`);
  }
  
  if (result.feedback.evidence.length > 0 && result.confidence > 0.6) {
    parts.push(`\nEvidence:\n• ${result.feedback.evidence.slice(0, 2).join('\n• ')}`);
  }
  
  return parts.join('\n');
};