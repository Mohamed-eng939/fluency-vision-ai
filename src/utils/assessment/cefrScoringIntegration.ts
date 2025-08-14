/**
 * CEFR Scoring Integration
 * Main integration point for evidence-based CEFR scoring using similarity matching
 */

import { generateEvidenceBasedAssessment } from './evidenceBasedScoring';
import { calculateWeightedCEFRLevel } from './embeddingSimilarity';
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
 * Main function to score a learner response using evidence-based CEFR assessment
 */
export const scoreResponseWithCEFR = (
  transcript: string,
  promptId?: string,
  audioMetrics?: any
): CEFRScoringResult => {
  
  // Generate evidence-based assessment
  const assessment = generateEvidenceBasedAssessment(transcript, promptId);
  
  if (!assessment.isReliable) {
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
        evidence: [`Assessment not reliable: ${assessment.reason}`]
      },
      confidence: 0,
      reason: assessment.reason
    };
  }
  
  // Extract scores and feedback
  const grammarScore = assessment.scores.grammar?.score || 5;
  const vocabularyScore = assessment.scores.vocabulary?.score || 5;
  const coherenceScore = assessment.scores.coherence?.score || 5;
  
  // Use audio metrics if available, otherwise estimate from linguistic analysis
  const fluencyScore = audioMetrics?.fluencyScore || coherenceScore;
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
    grammarScore * 0.2 +
    vocabularyScore * 0.2 +
    coherenceScore * 0.2 +
    fluencyScore * 0.15 +
    pronunciationScore * 0.1 +
    prosodyScore * 0.1 +
    syntaxScore * 0.05
  );
  
  // Collect all feedback
  const allStrengths: string[] = [];
  const allImprovements: string[] = [];
  const allEvidence: string[] = [];
  
  Object.entries(assessment.scores).forEach(([skill, data]) => {
    allStrengths.push(...data.strengths.map(s => `${skill}: ${s}`));
    allImprovements.push(...data.improvements.map(i => `${skill}: ${i}`));
    allEvidence.push(...data.evidence.map(e => `${skill}: ${e}`));
  });
  
  // Calculate confidence based on similarity and transcript quality
  let confidence = 0.7; // Base confidence
  
  if (promptId) {
    const similarityResult = calculateWeightedCEFRLevel(transcript, promptId);
    if (similarityResult) {
      confidence = Math.min(0.95, similarityResult.confidence + 0.2);
      allEvidence.push(...similarityResult.evidence);
    }
  }
  
  const wordCount = transcript.split(/\s+/).length;
  if (wordCount < 10) confidence *= 0.7;
  if (wordCount > 50) confidence = Math.min(0.95, confidence + 0.1);
  
  return {
    isReliable: true,
    finalLevel: assessment.overallLevel,
    finalScore: Math.round(finalScore * 10) / 10,
    metrics,
    feedback: {
      strengths: allStrengths,
      improvements: allImprovements,
      evidence: allEvidence
    },
    confidence: Math.round(confidence * 100) / 100
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