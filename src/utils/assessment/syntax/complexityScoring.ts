
import { SyntaxComplexity } from "../../../types/assessment";
import { detectSVOStructure } from "./structureAnalysis";

/**
 * Calculate syntax score from complexity metrics
 */
export const calculateSyntaxScoreFromComplexity = (
  complexity: SyntaxComplexity
): number => {
  // Base score from structural variety (already on 1-10 scale)
  let score = complexity.structuralVariety;
  
  // Adjust for sentence length (optimal is 15-20 words for formal English)
  const avgLength = complexity.averageSentenceLength;
  if (avgLength < 5) {
    score -= 2; // Too simple
  } else if (avgLength < 10) {
    score -= 1; // Simple
  } else if (avgLength > 25) {
    score -= 1; // Too complex
  } else if (avgLength > 35) {
    score -= 2; // Excessively complex
  }
  
  // Adjust for subordination (optimal is 1-1.5)
  if (complexity.subordinationIndex > 2) {
    score -= 1; // Too many dependent clauses
  }
  
  // CEFR-Aligned: Cap score based on subordination/coordination presence
  if (complexity.subordinationIndex < 0.1 && complexity.complexSentenceRatio < 0.1) {
    score = Math.min(score, 4.0); // Cap at A2 if no subordination or coordination
  }
  
  // CEFR-Aligned: SVO structure requirement for scores ≥ 5.6 (B2)
  if (!detectSVOStructure(complexity) && score >= 5.6) {
    score = 5.5; // Cap at B1 if SVO structure isn't met
  }
  
  // Ensure score is between 1-10
  return Math.max(1, Math.min(10, score));
};
