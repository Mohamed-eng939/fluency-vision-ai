
// This file now serves as a re-export of the refactored fluency modules for backward compatibility
import {
  calculateFluencyScore,
  detectRepetitions,
  applyRepetitionPenalties,
  calculateRepetitionPenalty,
  applyHesitationPenalties,
  analyzePauseQuality,
  applyPauseQualityPenalties,
  calculateFluencyScoreFromSyllables,
  estimateSyllableCount
} from './fluency';

// Re-export everything for backwards compatibility
export {
  calculateFluencyScore,
  detectRepetitions,
  applyRepetitionPenalties,
  calculateRepetitionPenalty,
  applyHesitationPenalties,
  analyzePauseQuality,
  applyPauseQualityPenalties,
  calculateFluencyScoreFromSyllables,
  estimateSyllableCount
};
