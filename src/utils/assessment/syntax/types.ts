
import { SyntaxComplexity } from "../../../types/assessment";

/**
 * Syntax scoring related types
 */
export interface SentenceAnalysisResult {
  avgLength: number;
  complexSentenceRatio: number;
  repeatedBeginnings: number;
  svoStructureRatio: number;
}

export type SyntaxPattern = {
  level: string;
  pattern: RegExp;
  weight: number;
};

export type SentenceQualityMetrics = {
  errorDensity: number;
  repetitionRatio: number;
  structuralVariety: number;
};
