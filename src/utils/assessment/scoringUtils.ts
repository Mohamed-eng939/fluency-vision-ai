import { AssessmentMetrics, CEFRLevel, GrammaticalError, SyntaxComplexity } from '../../types/assessment';
import { PronunciationDetails } from '../audioAnalysisUtils';

/**
 * Calculate total score from metrics
 */
export const calculateTotalScore = (metrics: AssessmentMetrics): number => {
  const { fluency, grammar, pronunciation, prosody, vocabulary, syntax, coherence } = metrics;
  const sum = fluency + grammar + pronunciation + prosody + vocabulary + syntax + coherence;
  // Convert to a score out of 100
  return Math.round((sum / 70) * 100);
};

/**
 * Determine CEFR level based on total score
 */
export const determineCEFRLevel = (score: number): CEFRLevel => {
  if (score >= 95) return 'C2';
  if (score >= 85) return 'C1+';
  if (score >= 80) return 'C1';
  if (score >= 75) return 'B2+';
  if (score >= 65) return 'B2';
  if (score >= 55) return 'B1+';
  if (score >= 50) return 'B1';
  if (score >= 45) return 'A2+';
  if (score >= 35) return 'A2';
  if (score >= 25) return 'A1+';
  if (score >= 15) return 'A1';
  return 'Pre-A1';
};

/**
 * Calculate a criterion score based on audio metrics and transcript
 */
export const calculateCriterionScore = (
  criterion: string,
  audioMetrics: any,
  transcript: string
): number => {
  switch (criterion) {
    case 'Fluency & Coherence':
    case 'Fluency':
      // Use syllables per minute for fluency if available
      return calculateFluencyScore(audioMetrics, transcript);
    case 'Pronunciation':
      // Use enhanced pronunciation score if available
      if (audioMetrics.pronunciationScore !== undefined) {
        return audioMetrics.pronunciationScore;
      }
      return calculatePronunciationScore(audioMetrics, transcript);
    case 'Grammar':
    case 'Grammatical Range and Accuracy':
      return calculateGrammarScore(audioMetrics, transcript);
    case 'Vocabulary':
    case 'Lexical Resource':
      return calculateVocabularyScore(audioMetrics, transcript);
    case 'Syntax':
      return calculateSyntaxScore(audioMetrics, transcript);
    case 'Prosody':
      return audioMetrics.pausePattern || 7;
    case 'Coherence':
      return calculateCoherenceScore(audioMetrics, transcript);
    // For other criteria, we'd need deeper text analysis
    default:
      // Return a value between 6-9 for now
      return Math.random() * 3 + 6;
  }
};

/**
 * Calculate fluency score based on syllables per minute instead of WPM
 */
export const calculateFluencyScore = (
  audioMetrics: any,
  transcript: string
): number => {
  // If we have syllables per minute data, use it
  if (audioMetrics.syllablesPerMinute !== undefined) {
    return calculateFluencyScoreFromSyllables(audioMetrics.syllablesPerMinute, audioMetrics.pauseRatio || 0.2);
  }
  
  // Otherwise, estimate syllable count from transcript and calculate SPM
  const syllableCount = estimateSyllableCount(transcript);
  const durationInMinutes = audioMetrics.totalDuration ? audioMetrics.totalDuration / 60 : 1;
  const estimatedSyllablesPerMinute = syllableCount / durationInMinutes;
  
  // Use estimated syllables per minute for scoring
  return calculateFluencyScoreFromSyllables(estimatedSyllablesPerMinute, audioMetrics.pauseRatio || 0.2);
};

/**
 * Calculate fluency score based on syllables per minute (SPM)
 * 
 * Typical SPM ranges:
 * - Native speakers: 240-300 SPM
 * - Advanced non-native: 200-240 SPM
 * - Intermediate: 150-200 SPM
 * - Beginner: 100-150 SPM
 */
export const calculateFluencyScoreFromSyllables = (spm: number, pauseRatio: number): number => {
  // Base score based on syllables per minute
  let score = 5; // Default mid-range score
  
  // Adjust score based on syllables per minute
  if (spm >= 280) score = 10;
  else if (spm >= 240) score = 9;
  else if (spm >= 210) score = 8;
  else if (spm >= 180) score = 7;
  else if (spm >= 150) score = 6;
  else if (spm >= 120) score = 5;
  else if (spm >= 100) score = 4;
  else score = 3;
  
  // Adjust for pause ratio (penalize excessive pauses)
  if (pauseRatio > 0.4) score -= 2;
  else if (pauseRatio > 0.3) score -= 1;
  
  // Ensure score is between 1-10
  return Math.max(1, Math.min(10, score));
};

/**
 * Estimate syllable count from English text
 * This is a simplified algorithm - a more accurate algorithm would use a dictionary
 */
export const estimateSyllableCount = (text: string): number => {
  if (!text) return 0;
  
  const words = text.toLowerCase().split(/\s+/);
  let count = 0;
  
  for (const word of words) {
    if (word.length <= 3) {
      // Short words generally have 1 syllable
      count += 1;
      continue;
    }
    
    // Count vowel groups as syllables
    const vowelGroups = word.match(/[aeiouy]+/g);
    if (!vowelGroups) {
      count += 1;
      continue;
    }
    
    let syllables = vowelGroups.length;
    
    // Subtract silent 'e' at the end
    if (word.endsWith('e') && syllables > 1) {
      syllables--;
    }
    
    // Add the syllables for this word
    count += syllables || 1;
  }
  
  return Math.max(count, 1);
};

/**
 * Calculate pronunciation score based on the revised criteria
 * with integration of MFA results when available
 */
export const calculatePronunciationScore = (
  audioMetrics: any,
  transcript: string
): number => {
  // Check if we have detailed pronunciation analysis from MFA
  if (audioMetrics.pronunciationDetails) {
    const details: PronunciationDetails = audioMetrics.pronunciationDetails;
    
    // Calculate score based on MFA pronunciation analysis
    let score = details.pronunciation_score;
    
    // Convert from IELTS 1-9 scale to our 1-10 scale
    return 1 + (score / 9) * 9;
  }
  
  // Default max score is 7.0 unless all criteria are met
  let baseScore = 7.0;
  
  // Get relevant metrics
  const confidenceScore = audioMetrics.confidenceScore || 0.7;
  const speechRate = audioMetrics.speechRate || 0;
  
  // Assume transcript coverage is high if there's a transcript
  // In a real system, this would compare expected vs. actual content
  const transcriptCoverage = transcript ? 
    (transcript.length > 20 ? 0.9 : 0.8) : 
    0.7;
  
  // Check if audio passes all criteria for higher scoring
  const highClarity = confidenceScore >= 0.75;
  const sufficientSpeechRate = speechRate >= 100;
  const goodCoverage = transcriptCoverage >= 0.9;
  
  // Simple repetition check - looking for repeated phrases
  // This is a simplified approach, in a real system would use NLP
  const words = transcript.split(' ');
  const hasRepetition = words.length >= 8 && 
    new Set(words).size < words.length * 0.8;
  
  // Only allow scores above 7 if all criteria are met
  if (highClarity && sufficientSpeechRate && !hasRepetition && goodCoverage) {
    baseScore = audioMetrics.pronunciation || 8.0;
  }
  
  // Apply deductions
  let finalScore = baseScore;
  
  if (confidenceScore < 0.7) {
    finalScore -= 1.0;
  }
  
  if (transcriptCoverage < 0.85) {
    finalScore -= 0.5;
  }
  
  // Check for monotone speech (low intonation variance)
  // In a real system, this would analyze pitch variations
  // Here we're using a simplified approach based on prosody
  const intonationVariance = audioMetrics.prosody ? 
    (audioMetrics.prosody > 7 ? 0.9 : 0.7) : 
    0.7;
  
  if (intonationVariance < 0.8) {
    finalScore -= 0.5;
  }
  
  // Ensure score is between 1 and 10
  return Math.max(1, Math.min(10, finalScore));
};

/**
 * Enhanced grammar scoring based on error analysis and sentence structure
 */
export const calculateGrammarScore = (
  audioMetrics: any,
  transcript: string
): number => {
  // If we have detailed grammatical error analysis
  if (audioMetrics.grammaticalErrors) {
    return calculateGrammarScoreFromErrors(
      audioMetrics.grammaticalErrors,
      transcript
    );
  }
  
  // Otherwise use a more basic approach
  return calculateBasicGrammarScore(transcript);
};

/**
 * Calculate grammar score based on detected errors
 */
export const calculateGrammarScoreFromErrors = (
  errors: GrammaticalError[],
  transcript: string
): number => {
  if (!transcript) return 5;
  
  const words = transcript.split(/\s+/).length;
  
  // Calculate error density (errors per 100 words)
  const errorDensity = (errors.length / words) * 100;
  
  // Score based on error density
  if (errorDensity < 1) return 10; // < 1 error per 100 words: excellent
  if (errorDensity < 2) return 9;  // < 2 errors per 100 words: very good
  if (errorDensity < 3.5) return 8; // < 3.5 errors per 100 words: good
  if (errorDensity < 5) return 7;   // < 5 errors per 100 words: fairly good
  if (errorDensity < 7.5) return 6; // < 7.5 errors per 100 words: above average
  if (errorDensity < 10) return 5;  // < 10 errors per 100 words: average
  if (errorDensity < 15) return 4;  // < 15 errors per 100 words: below average
  if (errorDensity < 20) return 3;  // < 20 errors per 100 words: weak
  if (errorDensity < 25) return 2;  // < 25 errors per 100 words: very weak
  return 1; // 25+ errors per 100 words: extremely weak
};

/**
 * Calculate basic grammar score from transcript text
 */
export const calculateBasicGrammarScore = (transcript: string): number => {
  if (!transcript) return 5;
  
  // Split into sentences
  const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 0);
  if (sentences.length === 0) return 5;
  
  let score = 5; // Default mid-range score
  
  // Check for basic grammar patterns
  
  // 1. Subject-verb agreement errors
  const svAgreementErrors = countPattern(transcript, /\b(they|we|you) (is|was)\b|\b(he|she|it) (are|were)\b/gi);
  
  // 2. Tense consistency
  const tenseMixing = countTenseMixing(sentences);
  
  // 3. Article usage
  const articleErrors = countArticleErrors(transcript);
  
  // 4. Sentence variety
  const sentenceVariety = calculateSentenceVariety(sentences);
  
  // Adjust score based on these factors
  if (svAgreementErrors > 2) score -= 1;
  if (tenseMixing > 1) score -= 1;
  if (articleErrors > 2) score -= 1;
  
  score += sentenceVariety;
  
  // Adjust for transcript length - very short responses get penalized
  if (transcript.length < 50) score -= 1;
  
  // Ensure score is between 1-10
  return Math.max(1, Math.min(10, score));
};

/**
 * Count instances of a pattern in text
 */
export const countPattern = (text: string, pattern: RegExp): number => {
  const matches = text.match(pattern);
  return matches ? matches.length : 0;
};

/**
 * Check for tense mixing in adjacent sentences
 */
export const countTenseMixing = (sentences: string[]): number => {
  let mixCount = 0;
  
  for (let i = 0; i < sentences.length - 1; i++) {
    const currentTense = detectTense(sentences[i]);
    const nextTense = detectTense(sentences[i + 1]);
    
    // If sentences shift tense without logical reason
    if (currentTense && nextTense && currentTense !== nextTense) {
      mixCount++;
    }
  }
  
  return mixCount;
};

/**
 * Detect the primary tense of a sentence
 */
export const detectTense = (sentence: string): string | null => {
  // Simple tense detection based on verb forms
  if (/\b(will|going to|shall)\b/i.test(sentence)) return 'future';
  if (/\b(is|am|are|'s|'re|'m) ([\w]+ing)\b/i.test(sentence)) return 'present-continuous';
  if (/\b(was|were) ([\w]+ing)\b/i.test(sentence)) return 'past-continuous';
  if (/\b(has|have|'ve) ([\w]+ed|[\w]+en)\b/i.test(sentence)) return 'present-perfect';
  if (/\b(had|'d) ([\w]+ed|[\w]+en)\b/i.test(sentence)) return 'past-perfect';
  
  // Check for simple past (-ed endings)
  if (/\b[\w]+(ed|t|ought|aught)\b/i.test(sentence)) return 'past';
  
  // Default to present if no other tense is detected
  return 'present';
};

/**
 * Count likely article errors
 */
export const countArticleErrors = (text: string): number => {
  // Common article error patterns
  const patterns = [
    /\b(a) ([aeiou]\w+)\b/gi,               // "a" before vowel sound
    /\b(an) ([^aeiou]\w+)\b/gi,             // "an" before consonant sound
    /\b(the) ([A-Z]\w+)\b/gi,               // "the" before proper noun
    /\b(go to) (the) (school|college|university|work)\b/gi,  // Incorrect "the" with institutions
  ];
  
  return patterns.reduce((count, pattern) => {
    const matches = text.match(pattern) || [];
    return count + matches.length;
  }, 0);
};

/**
 * Calculate sentence variety score (0-3)
 */
export const calculateSentenceVariety = (sentences: string[]): number => {
  if (sentences.length < 2) return 0;
  
  // Check for question forms
  const hasQuestions = sentences.some(s => s.trim().endsWith('?'));
  
  // Check for complex sentences (with conjunctions)
  const hasComplexSentences = sentences.some(s => 
    /\b(because|although|though|since|as|while|whereas|unless|if|when|whenever|wherever|even though)\b/i.test(s)
  );
  
  // Check for compound sentences
  const hasCompoundSentences = sentences.some(s => 
    /\b(and|but|or|so|yet|for|nor)\b/i.test(s)
  );
  
  // Add points for variety
  let varietyScore = 0;
  if (hasQuestions) varietyScore += 1;
  if (hasComplexSentences) varietyScore += 1;
  if (hasCompoundSentences) varietyScore += 1;
  
  return varietyScore;
};

/**
 * Calculate syntax complexity score
 */
export const calculateSyntaxScore = (
  audioMetrics: any,
  transcript: string
): number => {
  // If we have detailed syntax analysis
  if (audioMetrics.syntaxComplexity) {
    return calculateSyntaxScoreFromComplexity(audioMetrics.syntaxComplexity);
  }
  
  // Otherwise use a more basic approach
  return calculateBasicSyntaxScore(transcript);
};

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
  
  // Ensure score is between 1-10
  return Math.max(1, Math.min(10, score));
};

/**
 * Calculate basic syntax score from transcript
 */
export const calculateBasicSyntaxScore = (transcript: string): number => {
  if (!transcript) return 5;
  
  // Split into sentences
  const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 0);
  if (sentences.length === 0) return 5;
  
  // Calculate average sentence length (in words)
  const words = transcript.split(/\s+/);
  const avgSentenceLength = words.length / sentences.length;
  
  // Base score on sentence length
  let score = 5;
  
  if (avgSentenceLength < 5) score = 3; // Very simple syntax
  else if (avgSentenceLength < 8) score = 4; // Simple syntax
  else if (avgSentenceLength < 12) score = 5; // Basic syntax
  else if (avgSentenceLength < 16) score = 6; // Moderate syntax
  else if (avgSentenceLength < 20) score = 7; // Good syntax
  else if (avgSentenceLength < 25) score = 8; // Advanced syntax
  else score = 6; // Too long sentences (can be harder to understand)
  
  // Look for complex structures
  const hasSubordination = countPattern(transcript, /\b(because|although|though|since|as|while|whereas|unless|if|when|whenever|wherever)\b/gi);
  const hasRelativeClauses = countPattern(transcript, /\b(who|whom|whose|which|that)\b/gi);
  const hasPassiveVoice = countPattern(transcript, /\b(is|are|was|were|be|been|being) ([a-z]+ed)\b/gi);
  
  // Add points for complex structures
  if (hasSubordination > 0) score += 1;
  if (hasRelativeClauses > 0) score += 1;
  if (hasPassiveVoice > 0) score += 1;
  
  // Penalize for very short responses
  if (sentences.length < 3) score -= 1;
  
  // Ensure score is between 1-10
  return Math.max(1, Math.min(10, score));
};

/**
 * Calculate vocabulary score
 */
export const calculateVocabularyScore = (
  audioMetrics: any,
  transcript: string
): number => {
  if (!transcript) return 5;
  
  const words = transcript.toLowerCase().split(/\s+/).filter(w => w.length > 0);
  if (words.length === 0) return 5;
  
  // Calculate lexical diversity (unique words / total words)
  const uniqueWords = new Set(words);
  const lexicalDiversity = uniqueWords.size / words.length;
  
  // Base score on lexical diversity
  let score = 5;
  
  if (lexicalDiversity > 0.8) score = 9;
  else if (lexicalDiversity > 0.7) score = 8;
  else if (lexicalDiversity > 0.6) score = 7;
  else if (lexicalDiversity > 0.5) score = 6;
  else if (lexicalDiversity > 0.4) score = 5;
  else if (lexicalDiversity > 0.3) score = 4;
  else score = 3;
  
  // Check for advanced vocabulary
  const advancedVocabularyScore = checkAdvancedVocabulary(transcript);
  score += advancedVocabularyScore;
  
  // Penalize very short responses
  if (words.length < 30) score -= 1;
  
  // Ensure score is between 1-10
  return Math.max(1, Math.min(10, score));
};

/**
 * Check for advanced vocabulary usage
 */
export const checkAdvancedVocabulary = (transcript: string): number => {
  // This is a simplified approach - a real implementation would use 
  // a frequency list or CEFR-aligned vocabulary database
  
  // Sample advanced words that indicate higher proficiency
  const advancedWords = [
    'nevertheless', 'consequently', 'furthermore', 'subsequently', 'therefore',
    'paradigm', 'perspective', 'phenomenon', 'fundamental', 'significant',
    'substantial', 'considerable', 'adequate', 'sustainable', 'innovative',
    'implement', 'establish', 'determine', 'demonstrate', 'emphasize',
    'crucial', 'essential', 'relevant', 'appropriate', 'beneficial',
    'controversial', 'ambiguous', 'inevitable', 'arbitrary', 'imperative'
  ];
  
  // Count advanced word usage
  const lowerText = transcript.toLowerCase();
  const advancedWordCount = advancedWords.filter(word => 
    lowerText.includes(word.toLowerCase())
  ).length;
  
  // Score based on advanced word usage
  if (advancedWordCount >= 5) return 2;
  if (advancedWordCount >= 2) return 1;
  return 0;
};

/**
 * Calculate coherence score
 */
export const calculateCoherenceScore = (
  audioMetrics: any,
  transcript: string
): number => {
  if (!transcript) return 5;
  
  // Check for discourse markers
  const discourseMarkers = [
    'first', 'firstly', 'second', 'secondly', 'third', 'thirdly',
    'finally', 'lastly', 'in conclusion', 'to sum up', 
    'however', 'nevertheless', 'nonetheless', 'on the other hand', 
    'consequently', 'as a result', 'therefore', 'thus', 'hence',
    'for example', 'for instance', 'such as', 'in particular',
    'in addition', 'furthermore', 'moreover', 'besides', 'also'
  ];
  
  // Count discourse markers
  const markerCount = discourseMarkers.filter(marker => 
    transcript.toLowerCase().includes(marker)
  ).length;
  
  // Base score on discourse marker usage
  let score = 5;
  
  if (markerCount >= 5) score = 9;
  else if (markerCount >= 4) score = 8;
  else if (markerCount >= 3) score = 7;
  else if (markerCount >= 2) score = 6;
  else if (markerCount >= 1) score = 5;
  else score = 4;
  
  // Adjust for transcript length
  const words = transcript.split(/\s+/).filter(w => w.length > 0);
  if (words.length < 30) score -= 1;
  if (words.length > 100) score += 1;
  
  // Ensure score is between 1-10
  return Math.max(1, Math.min(10, score));
};

/**
 * Get specific feedback for a criterion based on score and level
 */
export const getCriterionFeedback = (criterion: string, score: number, level: string): string => {
  // This would be expanded with much more detailed, criterion-specific feedback
  if (score > 8) {
    return `Your ${criterion} shows excellent mastery at ${level} level. Keep up the great work!`;
  } else if (score > 6) {
    return `Your ${criterion} is good for ${level} level, showing solid competence with minor areas to improve.`;
  } else if (score > 4) {
    return `Your ${criterion} is adequate for ${level} level, but shows several areas where focused practice would help.`;
  } else {
    return `Your ${criterion} needs significant improvement to meet ${level} level standards. Consider focused practice.`;
  }
};
