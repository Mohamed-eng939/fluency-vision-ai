/**
 * Integration layer for expert-aligned scoring system
 * Orchestrates all scoring modules and provides unified interface
 */

import { calculateExpertFluencyScore, convertBandToTenScale } from './fluency/expertFluencyScoring';
import { calculateEnhancedPronunciationScore } from './pronunciation/expertPronunciationScoring';
import { calculateExpertGrammarScore } from './grammar/expertGrammarScoring';
import { calculateExpertVocabularyScore } from './vocabulary/expertVocabularyScoring';
import { calculateExpertCoherenceScore } from './coherence/expertCoherenceScoring';
import { calculateExpertSyntaxScore } from './syntax/expertSyntaxScoring';
import { calculateExpertProsodyScore } from './prosody/expertProsodyScoring';
import { detectHesitationMarkers } from '../audio/hesitationDetector';

export interface ExpertScoringResult {
  scores: {
    fluency: number;
    pronunciation: number;
    grammar: number;
    vocabulary: number;
    coherence: number;
    syntax: number;
    prosody: number;
  };
  bandScores: {
    fluency: number;
    pronunciation: number;
    grammar: number;
    vocabulary: number;
    coherence: number;
    syntax: number;
    prosody: number;
  };
  overallBand: number;
  overallScore: number; // 1-10 scale for system compatibility
  cefrLevel: string;
  fallbackUsed: boolean;
  expertAnalysis: {
    fluency: any;
    pronunciation: any;
    grammar: any;
    vocabulary: any;
    coherence: any;
    syntax: any;
    prosody: any;
  };
  justifications: Record<string, string>;
}

/**
 * Calculate comprehensive expert-aligned scores for all criteria
 */
export const calculateExpertScores = async (
  audioMetrics: any,
  transcript: string,
  promptText?: string
): Promise<ExpertScoringResult> => {
  
  // Extract data for fluency analysis
  const spm = audioMetrics.syllablesPerMinute || audioMetrics.spm || estimateSPM(transcript, audioMetrics);
  const pauseRatio = audioMetrics.pauseRatio || 0.2;
  const hesitationData = detectHesitationMarkers(transcript);
  
  // Calculate expert scores for each criterion
  const fluencyAnalysis = calculateExpertFluencyScore(
    spm, 
    pauseRatio, 
    audioMetrics.repetitionCount || 0,
    hesitationData.count
  );
  
  const pronunciationAnalysis = calculateEnhancedPronunciationScore(audioMetrics, transcript);
  
  const grammarAnalysis = calculateExpertGrammarScore(transcript);
  
  const vocabularyAnalysis = calculateExpertVocabularyScore(transcript);
  
  const coherenceAnalysis = await calculateExpertCoherenceScore(transcript, promptText);
  
  const syntaxAnalysis = calculateExpertSyntaxScore(transcript);
  
  const prosodyAnalysis = calculateExpertProsodyScore(audioMetrics, transcript);
  
  // Convert band scores to 1-10 scale for system compatibility
  const scores = {
    fluency: convertBandToTenScale(fluencyAnalysis.bandScore),
    pronunciation: pronunciationAnalysis, // Already on 1-10 scale
    grammar: convertBandToTenScale(grammarAnalysis.bandScore),
    vocabulary: convertBandToTenScale(vocabularyAnalysis.bandScore),
    coherence: convertBandToTenScale(coherenceAnalysis.bandScore),
    syntax: convertBandToTenScale(syntaxAnalysis.bandScore),
    prosody: convertBandToTenScale(prosodyAnalysis.bandScore)
  };
  
  const bandScores = {
    fluency: fluencyAnalysis.bandScore,
    pronunciation: convertTenScaleToBand(pronunciationAnalysis),
    grammar: grammarAnalysis.bandScore,
    vocabulary: vocabularyAnalysis.bandScore,
    coherence: coherenceAnalysis.bandScore,
    syntax: syntaxAnalysis.bandScore,
    prosody: prosodyAnalysis.bandScore
  };
  
  // Calculate overall scores
  const overallBand = calculateOverallBand(bandScores);
  const overallScore = convertBandToTenScale(overallBand);
  const cefrLevel = convertBandToCEFR(overallBand);
  
  // Check if any fallbacks were used
  const fallbackUsed = [
    fluencyAnalysis.fallbackUsed,
    prosodyAnalysis.fallbackUsed,
    grammarAnalysis.fallbackUsed,
    vocabularyAnalysis.fallbackUsed,
    coherenceAnalysis.fallbackUsed,
    syntaxAnalysis.fallbackUsed
  ].some(fallback => fallback);
  
  // Store expert analysis in audioMetrics for feedback generation
  audioMetrics.expertAnalysis = {
    fluency: fluencyAnalysis,
    pronunciation: audioMetrics.pronunciationAnalysis,
    grammar: grammarAnalysis,
    vocabulary: vocabularyAnalysis,
    coherence: coherenceAnalysis,
    syntax: syntaxAnalysis,
    prosody: prosodyAnalysis
  };
  
  return {
    scores,
    bandScores,
    overallBand,
    overallScore,
    cefrLevel,
    fallbackUsed,
    expertAnalysis: audioMetrics.expertAnalysis,
    justifications: {
      fluency: fluencyAnalysis.bandJustification,
      pronunciation: audioMetrics.pronunciationAnalysis?.bandJustification || 'phoneme accuracy based',
      grammar: grammarAnalysis.bandJustification,
      vocabulary: vocabularyAnalysis.bandJustification,
      coherence: coherenceAnalysis.bandJustification,
      syntax: syntaxAnalysis.bandJustification,
      prosody: prosodyAnalysis.bandJustification
    }
  };
};

/**
 * Estimate SPM from transcript and audio metrics
 */
function estimateSPM(transcript: string, audioMetrics: any): number {
  const syllableCount = estimateSyllableCount(transcript);
  const duration = audioMetrics.speakingDuration || audioMetrics.totalDuration || 30; // Default 30 seconds
  return (syllableCount / duration) * 60;
}

/**
 * Estimate syllable count from transcript
 */
function estimateSyllableCount(transcript: string): number {
  const words = transcript.split(/\s+/).filter(w => w.length > 0);
  return words.reduce((count, word) => {
    // Simple syllable estimation: vowel groups
    const syllables = word.toLowerCase().match(/[aeiouy]+/g) || [];
    return count + Math.max(1, syllables.length);
  }, 0);
}

/**
 * Convert 1-10 scale back to band score
 */
function convertTenScaleToBand(tenScore: number): number {
  return Math.round((((tenScore - 1) / 9) * 8 + 1) * 2) / 2;
}

/**
 * Calculate overall band score from individual bands
 */
function calculateOverallBand(bandScores: Record<string, number>): number {
  const scores = Object.values(bandScores);
  const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  return Math.round(average * 2) / 2; // Round to nearest 0.5
}

/**
 * Convert band score to CEFR level
 */
function convertBandToCEFR(bandScore: number): string {
  if (bandScore >= 8.5) return 'C2';
  if (bandScore >= 7.5) return 'C1';
  if (bandScore >= 6.5) return 'B2';
  if (bandScore >= 5.5) return 'B1';
  if (bandScore >= 4.5) return 'A2';
  if (bandScore >= 3.5) return 'A1';
  return 'Pre-A1';
}

/**
 * Update existing criterion scorers to use expert scoring
 */
export const updateCriterionWithExpertScoring = async (
  criterion: string,
  audioMetrics: any,
  transcript: string,
  promptText?: string
): Promise<number> => {
  
  const expertResult = await calculateExpertScores(audioMetrics, transcript, promptText);
  
  switch (criterion) {
    case 'Fluency & Coherence':
    case 'Fluency':
      return expertResult.scores.fluency;
    case 'Pronunciation':
      return expertResult.scores.pronunciation;
    case 'Grammar':
    case 'Grammatical Range and Accuracy':
      return expertResult.scores.grammar;
    case 'Vocabulary':
    case 'Lexical Resource':
      return expertResult.scores.vocabulary;
    case 'Syntax':
      return expertResult.scores.syntax;
    case 'Prosody':
      return expertResult.scores.prosody;
    case 'Coherence':
      return expertResult.scores.coherence;
    default:
      return 7; // Default score
  }
};