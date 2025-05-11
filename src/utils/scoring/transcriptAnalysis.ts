
import { AssessmentMetrics } from '../../types/assessment';

/**
 * Analyze transcript for linguistic features
 */
export const analyzeTranscript = (transcript: string): Partial<AssessmentMetrics> => {
  const metrics: Partial<AssessmentMetrics> = {};
  
  // Basic fluency analysis
  metrics.fluency = calculateFluencyScore(transcript);
  
  // Vocabulary analysis
  metrics.vocabulary = calculateVocabularyScore(transcript);
  
  // Grammar analysis
  metrics.grammar = calculateGrammarScore(transcript);
  
  // Coherence analysis
  metrics.coherence = calculateCoherenceScore(transcript);
  
  // Syntax complexity
  metrics.syntax = calculateSyntaxScore(transcript);
  
  return metrics;
};

/**
 * Calculate fluency score based on transcript features
 */
export const calculateFluencyScore = (transcript: string): number => {
  const words = transcript.split(/\s+/);
  const wordCount = words.length;
  const uniqueWords = new Set(words.map(w => w.toLowerCase())).size;
  
  // Analyze for hesitations and fillers
  const fillerWords = ['um', 'uh', 'like', 'you know', 'well', 'so'];
  const fillerCount = words.filter(w => 
    fillerWords.includes(w.toLowerCase())
  ).length;
  
  // Calculate type-token ratio (lexical diversity)
  const ttr = uniqueWords / wordCount;
  
  // Calculate filler ratio
  const fillerRatio = fillerCount / wordCount;
  
  // Base score from 1-10
  let score = 7; // Default middle-high score
  
  // Adjust for lexical diversity
  if (ttr > 0.7) score += 1.5;
  else if (ttr > 0.6) score += 1;
  else if (ttr > 0.5) score += 0.5;
  else if (ttr < 0.4) score -= 1;
  
  // Adjust for fillers
  if (fillerRatio < 0.02) score += 1;
  else if (fillerRatio > 0.05) score -= 1;
  else if (fillerRatio > 0.1) score -= 2;
  
  // Ensure score is between 1-10
  return Math.max(1, Math.min(10, score));
};

/**
 * Calculate vocabulary score based on transcript content
 */
export const calculateVocabularyScore = (transcript: string): number => {
  const text = transcript.toLowerCase();
  const words = text.split(/\s+/);
  
  // Advanced vocabulary markers
  const advancedWords = [
    'therefore', 'however', 'furthermore', 'consequently', 'nevertheless',
    'despite', 'although', 'nonetheless', 'moreover', 'subsequently',
    'particularly', 'significant', 'fundamental', 'essential', 'crucial',
    'perspective', 'substantial', 'demonstrate', 'establish', 'consider'
  ];
  
  // Count advanced words
  const advancedWordCount = words.filter(w => 
    advancedWords.includes(w.toLowerCase())
  ).length;
  
  // Calculate average word length
  const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
  
  // Base score
  let score = 6; // Default middle score
  
  // Adjust for advanced vocabulary
  const advancedRatio = advancedWordCount / words.length;
  if (advancedRatio > 0.1) score += 2;
  else if (advancedRatio > 0.05) score += 1;
  
  // Adjust for word length
  if (avgWordLength > 5.5) score += 1;
  else if (avgWordLength < 4) score -= 1;
  
  // Ensure score is between 1-10
  return Math.max(1, Math.min(10, score));
};

/**
 * Calculate grammar score based on transcript content
 */
export const calculateGrammarScore = (transcript: string): number => {
  // Basic grammar patterns to check
  const text = transcript.toLowerCase();
  
  // Check for complex grammar structures
  const complexStructures = [
    /if.*would/,
    /had been/,
    /should have/,
    /might have/,
    /were to/,
    /not only.*but also/,
    /despite/,
    /nevertheless/,
    /whereas/
  ];
  
  const complexCount = complexStructures.filter(pattern => pattern.test(text)).length;
  
  // Check for common errors
  const commonErrors = [
    /he have/,
    /she have/,
    /it have/,
    /they is/,
    /we is/,
    /i is/
  ];
  
  const errorCount = commonErrors.filter(pattern => pattern.test(text)).length;
  
  // Base score
  let score = 7; // Default score
  
  // Adjust for complex structures
  score += complexCount * 0.5;
  
  // Adjust for errors
  score -= errorCount * 1.5;
  
  // Ensure score is between 1-10
  return Math.max(1, Math.min(10, score));
};

/**
 * Calculate coherence score based on transcript content
 */
export const calculateCoherenceScore = (transcript: string): number => {
  const text = transcript.toLowerCase();
  const sentences = text.split(/[.!?]+/);
  
  // Check for discourse markers
  const discourseMarkers = [
    'first', 'second', 'third', 'finally', 'in conclusion',
    'for example', 'such as', 'similarly', 'in contrast',
    'however', 'therefore', 'thus', 'consequently'
  ];
  
  const markerCount = discourseMarkers.filter(marker => 
    text.includes(marker)
  ).length;
  
  // Base score
  let score = 6; // Default score
  
  // Adjust for discourse markers
  score += Math.min(markerCount, 4) * 0.5;
  
  // Adjust for sentence count
  if (sentences.length >= 5) score += 0.5;
  if (sentences.length >= 10) score += 0.5;
  
  // Ensure score is between 1-10
  return Math.max(1, Math.min(10, score));
};

/**
 * Calculate syntax score based on transcript content
 */
export const calculateSyntaxScore = (transcript: string): number => {
  const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  // Calculate average sentence length
  const avgSentenceLength = transcript.split(/\s+/).length / sentences.length;
  
  // Check for complex syntax
  const complexSyntaxPatterns = [
    /although/,
    /despite/,
    /which/,
    /who/,
    /where/,
    /when/,
    /whose/,
    /however/
  ];
  
  let complexSyntaxCount = 0;
  sentences.forEach(sentence => {
    complexSyntaxPatterns.forEach(pattern => {
      if (pattern.test(sentence.toLowerCase())) {
        complexSyntaxCount++;
      }
    });
  });
  
  // Base score
  let score = 6; // Default score
  
  // Adjust for sentence length
  if (avgSentenceLength > 12) score += 1;
  if (avgSentenceLength > 15) score += 1;
  if (avgSentenceLength < 5) score -= 1;
  
  // Adjust for complex syntax
  score += Math.min(complexSyntaxCount / sentences.length * 4, 3);
  
  // Ensure score is between 1-10
  return Math.max(1, Math.min(10, score));
};
