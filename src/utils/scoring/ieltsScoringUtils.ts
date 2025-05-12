
import { CEFRLevel } from '../../types/assessment';
import { 
  getRubric, 
  mapBandToCEFR, 
  mapIELTSto5Point, 
  Rubric 
} from '../rubricLoaderUtils';
import { analyzeAudioFeatures, detectHesitationMarkers } from '../audioAnalysisUtils';

// Default GitHub URL for IELTS Rubric
const DEFAULT_RUBRIC_URL = 'https://raw.githubusercontent.com/csmertx/IELTS-CEFR-Rubrics/main/ielts_cefr_speaking_rubric.json';

// Cached rubric to avoid repeated fetches
let cachedRubric: Rubric | null = null;

/**
 * Calculate IELTS speaking score from transcript
 */
export const calculateIELTSSpeakingScore = async (
  transcript: string,
  audioBlob?: Blob,
  rubricUrl: string = DEFAULT_RUBRIC_URL
): Promise<Record<string, number | string>> => {
  // Load rubric (use cached version if available)
  if (!cachedRubric) {
    cachedRubric = await getRubric(rubricUrl);
  }
  const rubric = cachedRubric;
  
  // Default scores
  let fluencyScore = 5;
  let vocabularyScore = 5;
  let grammarScore = 5;
  let pronunciationScore = 5;
  
  // Enhanced scoring with audio analysis if available
  if (audioBlob) {
    const audioAnalysis = await analyzeAudioFeatures(audioBlob, transcript);
    
    // Analyze hesitation markers
    const hesitationAnalysis = detectHesitationMarkers(transcript);
    
    // Calculate fluency score based on WPM and pauses
    fluencyScore = calculateFluencyScore(
      audioAnalysis.wpm, 
      audioAnalysis.pauseRatio,
      hesitationAnalysis.ratio
    );
    
    // Approximate pronunciation score based on transcript completion
    // (This is a placeholder - real pronunciation scoring requires phonemic analysis)
    pronunciationScore = 5;
  } else {
    // Use text-only analysis
    fluencyScore = calculateFluencyScoreFromText(transcript);
    pronunciationScore = 5; // Default without audio
  }
  
  // Calculate vocabulary score
  vocabularyScore = calculateVocabularyScore(transcript);
  
  // Calculate grammar score
  grammarScore = calculateGrammarScore(transcript);
  
  // Calculate total band score (average of the four criteria)
  const totalBand = roundToHalf(
    (fluencyScore + vocabularyScore + grammarScore + pronunciationScore) / 4
  );
  
  // Map to CEFR level
  const cefrLevel = mapBandToCEFR(totalBand, rubric);
  
  return {
    "Fluency and Coherence": fluencyScore,
    "Lexical Resource": vocabularyScore,
    "Grammatical Range and Accuracy": grammarScore,
    "Pronunciation": pronunciationScore,
    "Total_Band": totalBand,
    "CEFR_Level": cefrLevel
  };
};

/**
 * Map IELTS band score to CEFR level
 */
export const mapIELTStoCEFR = async (
  band: number,
  rubricUrl: string = DEFAULT_RUBRIC_URL
): Promise<CEFRLevel> => {
  // Load rubric (use cached version if available)
  if (!cachedRubric) {
    cachedRubric = await getRubric(rubricUrl);
  }
  return mapBandToCEFR(band, cachedRubric);
};

/**
 * Calculate fluency score based on speaking rate, pauses and hesitations
 */
const calculateFluencyScore = (
  wpm: number, 
  pauseRatio: number,
  hesitationRatio: number
): number => {
  // Typical speaking rates:
  // - Below 100 WPM: Very slow (bands 3-4)
  // - 100-130 WPM: Slow (bands 4-5)
  // - 130-160 WPM: Moderate (bands 5-6)
  // - 160-190 WPM: Moderately fast (bands 6-7)
  // - 190-220 WPM: Fast (bands 7-8)
  // - Above 220 WPM: Very fast (bands 8-9)
  
  let score = 5; // Start at middle band
  
  // WPM scoring
  if (wpm < 80) score -= 2;
  else if (wpm < 110) score -= 1;
  else if (wpm > 190) score += 1;
  else if (wpm > 220) score += 2;
  
  // Pause ratio scoring (higher pause ratio = lower fluency)
  if (pauseRatio > 0.4) score -= 2;
  else if (pauseRatio > 0.3) score -= 1;
  else if (pauseRatio < 0.15) score += 1;
  
  // Hesitation ratio scoring
  if (hesitationRatio > 0.15) score -= 2;
  else if (hesitationRatio > 0.1) score -= 1;
  else if (hesitationRatio < 0.05) score += 1;
  
  // Ensure score is within IELTS band range (0-9)
  return Math.max(0, Math.min(9, score));
};

/**
 * Calculate fluency score from text only (fallback method)
 */
const calculateFluencyScoreFromText = (transcript: string): number => {
  const words = transcript.trim().split(/\s+/).filter(word => word.length > 0);
  const wordCount = words.length;
  
  // Very basic text-based fluency estimate
  // - Less than 30 words: Band 3-4
  // - 30-60 words: Band 4-5
  // - 60-100 words: Band 5-6
  // - 100-150 words: Band 6-7
  // - 150-200 words: Band 7-8
  // - 200+ words: Band 8-9
  
  if (wordCount < 30) return 3.5;
  if (wordCount < 60) return 4.5;
  if (wordCount < 100) return 5.5;
  if (wordCount < 150) return 6.5;
  if (wordCount < 200) return 7.5;
  return 8.5;
};

/**
 * Calculate vocabulary score from transcript
 */
const calculateVocabularyScore = (transcript: string): number => {
  // In a real implementation, this would analyze:
  // - Lexical diversity
  // - Word frequency (common vs. rare words)
  // - Collocations
  // - Idioms and phrasal verbs
  
  // Simplified implementation based on text length
  const words = transcript.trim().split(/\s+/).filter(word => word.length > 0);
  const uniqueWords = new Set(words.map(word => word.toLowerCase()));
  
  // Calculate lexical diversity (unique words / total words)
  const lexicalDiversity = words.length > 0 ? uniqueWords.size / words.length : 0;
  
  // Calculate vocabulary score
  let score = 5; // Start at middle band
  
  if (lexicalDiversity > 0.8) score += 2;
  else if (lexicalDiversity > 0.7) score += 1;
  else if (lexicalDiversity < 0.5) score -= 1;
  else if (lexicalDiversity < 0.4) score -= 2;
  
  // Adjust based on transcript length
  if (words.length > 200) score += 1;
  else if (words.length < 50) score -= 1;
  
  // Ensure score is within IELTS band range (0-9)
  return Math.max(0, Math.min(9, score));
};

/**
 * Calculate grammar score from transcript
 */
const calculateGrammarScore = (transcript: string): number => {
  // In a real implementation, this would analyze:
  // - Sentence complexity
  // - Grammatical accuracy
  // - Variety of structures
  // - Errors per sentence
  
  // Simplified implementation based on sentence length
  const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = transcript.split(/\s+/).filter(w => w.length > 0);
  
  // Calculate average sentence length
  const avgSentenceLength = sentences.length > 0 ? words.length / sentences.length : 0;
  
  // Calculate grammar score
  let score = 5; // Start at middle band
  
  // Adjust based on average sentence length
  // Very short sentences often indicate limited grammatical range
  // Very long sentences without proper punctuation may indicate poor grammar
  if (avgSentenceLength > 20) score += 1;
  else if (avgSentenceLength > 15) score += 0.5;
  else if (avgSentenceLength < 8) score -= 0.5;
  else if (avgSentenceLength < 5) score -= 1;
  
  // Adjust based on transcript length (more content = more opportunity to demonstrate range)
  if (words.length > 200) score += 1;
  else if (words.length < 50) score -= 1;
  
  // Ensure score is within IELTS band range (0-9)
  return Math.max(0, Math.min(9, score));
};

/**
 * Round a number to the nearest 0.5
 */
const roundToHalf = (num: number): number => {
  return Math.round(num * 2) / 2;
};
