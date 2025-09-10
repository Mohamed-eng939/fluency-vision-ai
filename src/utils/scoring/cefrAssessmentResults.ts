
import { AssessmentMetrics, AssessmentResult } from '@/types/assessment';
import { mapScoreToCEFR, calculateOverallCEFR, generateCEFRLevels, Skill } from './cefrUtils';

/**
 * Enhanced Assessment Result with CEFR calibration
 */
export interface CEFRCalibratedResult extends AssessmentResult {
  cefrLevels: {
    grammar: string;
    fluency: string;
    vocabulary: string;
    pronunciation: string;
    prosody: string;
    coherence: string;
    syntax?: string;
    listening?: string;
    reading?: string;
    writing?: string;
  };
  overallCEFR: string;
  cefrConfidence: number; // 0-1 score indicating confidence in CEFR assignment
}

/**
 * Determine highest CEFR level attempted based on prompt history
 */
function getHighestAttemptedLevel(promptHistory?: any[]): string {
  if (!promptHistory || promptHistory.length === 0) return 'A1';
  
  const levels = ['Pre-A1', 'A1', 'A1+', 'A2', 'A2+', 'B1', 'B1+', 'B2', 'B2+', 'C1', 'C1+', 'C2'];
  let highestLevel = 'A1';
  
  promptHistory.forEach(item => {
    const cefrLevel = item.prompt?.cefrLevel;
    if (cefrLevel && levels.indexOf(cefrLevel) > levels.indexOf(highestLevel)) {
      highestLevel = cefrLevel;
    }
  });
  
  return highestLevel;
}

/**
 * Cap CEFR level based on highest level attempted
 */
function capCEFRLevel(calculatedLevel: string, maxLevel: string): string {
  const levels = ['Pre-A1', 'A1', 'A1+', 'A2', 'A2+', 'B1', 'B1+', 'B2', 'B2+', 'C1', 'C1+', 'C2'];
  const calculatedIndex = levels.indexOf(calculatedLevel);
  const maxIndex = levels.indexOf(maxLevel);
  
  if (calculatedIndex > maxIndex) {
    return maxLevel;
  }
  return calculatedLevel;
}

/**
 * Apply CEFR calibration to assessment results
 */
export function applyCEFRCalibration(
  result: AssessmentResult,
  audioAnalysis?: any,
  promptHistory?: any[]
): CEFRCalibratedResult {
  const { metrics } = result;
  
  // Convert metrics to skill scores (scale to 1-10)
  const skillScores: Partial<Record<Skill, number>> = {
    grammar: metrics.grammar,
    fluency: metrics.fluency,
    vocabulary: metrics.vocabulary,
    pronunciation: metrics.pronunciation,
    prosody: metrics.prosody,
    coherence: metrics.coherence,
    syntax: metrics.syntax
  };
  
  // Add optional skills if they exist
  if (metrics.listening !== undefined) skillScores.listening = metrics.listening;
  if (metrics.reading !== undefined) skillScores.reading = metrics.reading;
  if (metrics.writing !== undefined) skillScores.writing = metrics.writing;
  
  // Apply prosody analysis if available
  if (audioAnalysis?.prosodyAnalysis?.cefr_level) {
    // Convert prosody CEFR to numerical score for consistency
    const prosodyScore = convertCEFRToScore(audioAnalysis.prosodyAnalysis.cefr_level);
    skillScores.prosody = prosodyScore;
  }
  
  // Apply pronunciation analysis if available
  if (audioAnalysis?.pronunciationDetails?.pronunciation_score) {
    // Use MFA pronunciation score (already on 1-10 scale)
    skillScores.pronunciation = audioAnalysis.pronunciationDetails.pronunciation_score;
  }
  
  // Determine highest attempted level and cap scoring accordingly
  const highestAttemptedLevel = getHighestAttemptedLevel(promptHistory);
  
  // Generate CEFR levels for each skill
  const rawCefrLevels = generateCEFRLevels(skillScores);
  
  // Cap each skill level based on highest attempted level
  const cefrLevels = Object.fromEntries(
    Object.entries(rawCefrLevels).map(([skill, level]) => [
      skill, 
      level ? capCEFRLevel(level, highestAttemptedLevel) : 'A1'
    ])
  );
  
  // Calculate overall CEFR and cap it
  const rawOverallCEFR = calculateOverallCEFR(skillScores);
  const overallCEFR = capCEFRLevel(rawOverallCEFR, highestAttemptedLevel);
  
  // Calculate confidence score based on consistency of levels
  const cefrConfidence = calculateCEFRConfidence(cefrLevels);
  
  return {
    ...result,
    cefrLevels: {
      grammar: cefrLevels.grammar || 'A1',
      fluency: cefrLevels.fluency || 'A1',
      vocabulary: cefrLevels.vocabulary || 'A1',
      pronunciation: cefrLevels.pronunciation || 'A1',
      prosody: cefrLevels.prosody || 'A1',
      coherence: cefrLevels.coherence || 'A1',
      syntax: cefrLevels.syntax,
      listening: cefrLevels.listening,
      reading: cefrLevels.reading,
      writing: cefrLevels.writing
    },
    overallCEFR,
    cefrConfidence
  };
}

/**
 * Convert CEFR level string to numerical score
 */
function convertCEFRToScore(cefrLevel: string): number {
  const levelMap: Record<string, number> = {
    'A1': 2.0,
    'A2': 3.5,
    'B1': 5.0,
    'B2': 6.5,
    'C1': 8.0,
    'C2': 9.5
  };
  return levelMap[cefrLevel] || 2.0;
}

/**
 * Calculate confidence in CEFR assignment based on consistency
 */
function calculateCEFRConfidence(cefrLevels: Record<string, string>): number {
  const levels = Object.values(cefrLevels).filter(Boolean);
  if (levels.length === 0) return 0;
  
  // Count frequency of each level
  const levelCounts: Record<string, number> = {};
  levels.forEach(level => {
    levelCounts[level] = (levelCounts[level] || 0) + 1;
  });
  
  // Calculate consistency (higher when levels are similar)
  const maxCount = Math.max(...Object.values(levelCounts));
  const consistency = maxCount / levels.length;
  
  // Adjust for number of skills assessed
  const completeness = levels.length / 6; // Assuming 6 core skills
  
  return Math.min(1, consistency * 0.7 + completeness * 0.3);
}
