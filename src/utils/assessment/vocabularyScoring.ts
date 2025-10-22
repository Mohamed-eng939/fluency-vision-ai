
/**
 * Enhanced vocabulary scoring using CEFR standards
 */
import { analyzeCefrVocabulary } from './vocabulary/cefrVocabularyAnalyzer';

/**
 * Calculate vocabulary score based on CEFR standards and sample bank comparison
 */
export const calculateVocabularyScore = (
  audioMetrics: any,
  transcript: string,
  promptId?: string
): number => {
  // If we already have a vocabulary score from API or external analysis
  if (audioMetrics.vocabularyScore !== undefined) {
    return audioMetrics.vocabularyScore;
  }
  
  // If transcript is available, use the enhanced CEFR vocabulary analyzer
  if (transcript) {
    const analysis = analyzeCefrVocabulary(transcript);
    
    // ENHANCEMENT: Use CEFR sample bank for calibration if prompt ID available
    if (promptId) {
      const { calibrateScoreWithSample } = require('../../data/assessment/cefrSampleBank');
      const calibration = calibrateScoreWithSample(transcript, promptId, { vocabulary: analysis.vocabularyScore });
      
      if (calibration.referenceSample) {
        console.log('Vocabulary score calibrated using sample bank:', {
          original: analysis.vocabularyScore,
          calibrated: calibration.adjustedScores.vocabulary,
          reference: calibration.referenceSample.cefrLevel,
          justification: calibration.justification
        });
        return calibration.adjustedScores.vocabulary;
      }
    }
    
    return analysis.vocabularyScore;
  }
  
  // STRICT MODE: No fallback - if no transcript, return minimum score
  return 1;
};

/**
 * DEPRECATED: No longer used - strict CEFR word list matching only
 * Kept for reference but not called in current implementation
 */
