
import { AssessmentMetrics, CEFRLevel } from '../../types/assessment';

/**
 * Map criteria scores to standard assessment metrics
 */
export const mapCriteriaToMetrics = (criteriaScores: Record<string, number>): AssessmentMetrics => {
  // Initialize with default values
  const metrics: AssessmentMetrics = {
    fluency: 5,
    grammar: 5,
    pronunciation: 5,
    prosody: 5,
    vocabulary: 5,
    syntax: 5,
    coherence: 5
  };
  
  // Map criteria scores to metrics
  // This is a simplified mapping - in a real app, would be more sophisticated
  if (criteriaScores['Fluency & Coherence']) {
    metrics.fluency = criteriaScores['Fluency & Coherence'];
    metrics.coherence = criteriaScores['Fluency & Coherence'];
  }
  
  if (criteriaScores['Lexical Resource']) {
    metrics.vocabulary = criteriaScores['Lexical Resource'];
  }
  
  if (criteriaScores['Grammatical Range']) {
    metrics.grammar = criteriaScores['Grammatical Range'];
    metrics.syntax = criteriaScores['Grammatical Range'];
  }
  
  if (criteriaScores['Pronunciation']) {
    metrics.pronunciation = criteriaScores['Pronunciation'];
    metrics.prosody = criteriaScores['Pronunciation'];
  }
  
  return metrics;
};

/**
 * Determine CEFR level based on total score
 */
export const determineCEFRLevel = (score: number): CEFRLevel => {
  if (score >= 95) return 'C2';
  if (score >= 90) return 'C1+';
  if (score >= 80) return 'C1';
  if (score >= 75) return 'B2+';
  if (score >= 65) return 'B2';
  if (score >= 60) return 'B1+';
  if (score >= 50) return 'B1';
  if (score >= 45) return 'A2+';
  if (score >= 35) return 'A2';
  if (score >= 30) return 'A1+';
  if (score >= 20) return 'A1';
  return 'Pre-A1';
};
