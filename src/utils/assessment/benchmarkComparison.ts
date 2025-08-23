/**
 * Benchmark Comparison System
 * Compares learner responses against CEFR sample bank using intelligent matching
 */

import { cefrSampleBank, getSamplesByPrompt } from '../../data/assessment/cefrSampleBank';
import { calculateCosineSimilarity, SimilarityMatch } from './embeddingSimilarity';
import { CEFRLevel, CEFRSample } from '../../types/assessment';

export interface BenchmarkComparison {
  promptId: string;
  learnerTranscript: string;
  closestMatches: SimilarityMatch[];
  recommendedLevel: CEFRLevel;
  confidence: number;
  levelJustification: string;
  skillGaps: {
    vocabulary: string[];
    grammar: string[];
    coherence: string[];
    taskAchievement: string[];
  };
}

export interface DetailedComparison {
  targetLevel: CEFRLevel;
  sample: CEFRSample;
  similarity: number;
  strengthsAlignment: string[];
  improvementGaps: string[];
  specificEvidence: string[];
}

/**
 * Compare learner response against all CEFR benchmarks for a prompt
 */
export const performBenchmarkComparison = (
  transcript: string,
  promptId: string,
  minSimilarity: number = 0.15
): BenchmarkComparison | null => {
  
  if (!transcript || transcript.trim().length < 10) {
    return null;
  }
  
  const samples = getSamplesByPrompt(promptId);
  if (samples.length === 0) {
    return null;
  }
  
  // Calculate similarity to each benchmark sample
  const matches: SimilarityMatch[] = samples.map(sample => ({
    sample,
    similarity: calculateCosineSimilarity(transcript, sample.transcript),
    level: sample.level
  })).sort((a, b) => b.similarity - a.similarity);
  
  // Filter matches above minimum similarity
  const validMatches = matches.filter(match => match.similarity >= minSimilarity);
  
  if (validMatches.length === 0) {
    return null;
  }
  
  // Determine recommended level using weighted approach
  const { recommendedLevel, confidence } = determineRecommendedLevel(validMatches);
  
  // Generate level justification
  const levelJustification = generateLevelJustification(validMatches, recommendedLevel);
  
  // Analyze skill gaps
  const skillGaps = analyzeSkillGaps(transcript, validMatches[0].sample);
  
  return {
    promptId,
    learnerTranscript: transcript,
    closestMatches: validMatches.slice(0, 3), // Top 3 matches
    recommendedLevel,
    confidence,
    levelJustification,
    skillGaps
  };
};

/**
 * Perform detailed comparison against specific CEFR level
 */
export const compareAgainstTargetLevel = (
  transcript: string,
  promptId: string,
  targetLevel: CEFRLevel
): DetailedComparison | null => {
  
  const samples = getSamplesByPrompt(promptId);
  const targetSample = samples.find(sample => sample.level === targetLevel);
  
  if (!targetSample) {
    return null;
  }
  
  const similarity = calculateCosineSimilarity(transcript, targetSample.transcript);
  
  // Analyze alignment with target level characteristics
  const strengthsAlignment = analyzeStrengthsAlignment(transcript, targetSample);
  const improvementGaps = analyzeImprovementGaps(transcript, targetSample);
  const specificEvidence = extractSpecificEvidence(transcript, targetSample);
  
  return {
    targetLevel,
    sample: targetSample,
    similarity,
    strengthsAlignment,
    improvementGaps,
    specificEvidence
  };
};

/**
 * Determine recommended CEFR level using weighted similarity approach
 */
const determineRecommendedLevel = (matches: SimilarityMatch[]): { recommendedLevel: CEFRLevel; confidence: number } => {
  
  if (matches.length === 0) {
    return { recommendedLevel: 'A1', confidence: 0 };
  }
  
  // Use the closest match as primary indicator
  const primaryMatch = matches[0];
  
  // Check if there are multiple strong matches at same level
  const sameLevel = matches.filter(match => 
    match.level === primaryMatch.level && match.similarity > 0.2
  );
  
  if (sameLevel.length >= 2) {
    // High confidence if multiple samples at same level match well
    return { 
      recommendedLevel: primaryMatch.level, 
      confidence: Math.min(0.95, primaryMatch.similarity + 0.2) 
    };
  }
  
  // Check for consistent level indicators in top matches
  const topMatches = matches.slice(0, 3);
  const levelCounts: Record<string, number> = {};
  
  topMatches.forEach(match => {
    levelCounts[match.level] = (levelCounts[match.level] || 0) + match.similarity;
  });
  
  const strongestLevel = Object.entries(levelCounts)
    .sort(([,a], [,b]) => b - a)[0][0] as CEFRLevel;
  
  const confidence = Math.min(0.9, primaryMatch.similarity + 0.1);
  
  return { recommendedLevel: strongestLevel, confidence };
};

/**
 * Generate human-readable level justification
 */
const generateLevelJustification = (matches: SimilarityMatch[], recommendedLevel: CEFRLevel): string => {
  
  const primaryMatch = matches[0];
  const similarityPercent = Math.round(primaryMatch.similarity * 100);
  
  const parts = [
    `Response shows ${similarityPercent}% similarity to ${recommendedLevel} benchmark sample.`
  ];
  
  // Add supporting evidence from other matches
  const supportingMatches = matches.slice(1, 3).filter(match => match.level === recommendedLevel);
  if (supportingMatches.length > 0) {
    parts.push(`Additional ${recommendedLevel} samples also show strong alignment.`);
  }
  
  // Note if there are conflicting indicators
  const conflictingLevels = matches.slice(0, 3)
    .filter(match => match.level !== recommendedLevel && match.similarity > 0.25)
    .map(match => match.level);
  
  if (conflictingLevels.length > 0) {
    parts.push(`Some features align with ${conflictingLevels.join('/')} level, suggesting mixed proficiency.`);
  }
  
  return parts.join(' ');
};

/**
 * Analyze skill gaps compared to benchmark sample
 */
const analyzeSkillGaps = (
  transcript: string,
  benchmarkSample: CEFRSample
): { vocabulary: string[]; grammar: string[]; coherence: string[]; taskAchievement: string[] } => {
  
  const gaps = {
    vocabulary: [] as string[],
    grammar: [] as string[],
    coherence: [] as string[],
    taskAchievement: [] as string[]
  };
  
  // Vocabulary gap analysis
  const learnerWords = new Set(transcript.toLowerCase().split(/\s+/));
  const benchmarkLexical = benchmarkSample.lexicalFeatures || [];
  const benchmarkWords = new Set(benchmarkSample.transcript.toLowerCase().split(/\s+/));
  
  // Check for missing sophisticated vocabulary
  const missingLexical = benchmarkLexical.filter(feature => 
    !transcript.toLowerCase().includes(feature.toLowerCase())
  );
  
  if (missingLexical.length > 0) {
    gaps.vocabulary.push(`Missing key lexical features: ${missingLexical.slice(0, 2).join(', ')}`);
  }
  
  // Word diversity comparison
  const learnerDiversity = learnerWords.size / transcript.split(/\s+/).length;
  const benchmarkDiversity = benchmarkWords.size / benchmarkSample.transcript.split(/\s+/).length;
  
  if (learnerDiversity < benchmarkDiversity - 0.1) {
    gaps.vocabulary.push('Lower lexical variety compared to benchmark level');
  }
  
  // Grammar gap analysis
  const benchmarkGrammar = benchmarkSample.grammarFeatures || [];
  const missingGrammar = benchmarkGrammar.filter(feature => 
    !checkGrammarFeature(transcript, feature)
  );
  
  if (missingGrammar.length > 0) {
    gaps.grammar.push(`Missing grammar features: ${missingGrammar.slice(0, 2).join(', ')}`);
  }
  
  // Coherence gap analysis
  const benchmarkDiscourse = benchmarkSample.discourseMarkers || [];
  const missingDiscourse = benchmarkDiscourse.filter(marker => 
    !transcript.toLowerCase().includes(marker.toLowerCase())
  );
  
  if (missingDiscourse.length > 0) {
    gaps.coherence.push(`Missing discourse markers: ${missingDiscourse.slice(0, 2).join(', ')}`);
  }
  
  // Length and development comparison
  const learnerLength = transcript.split(/\s+/).length;
  const benchmarkLength = benchmarkSample.transcript.split(/\s+/).length;
  
  if (learnerLength < benchmarkLength * 0.7) {
    gaps.taskAchievement.push('Response significantly shorter than expected for this level');
  }
  
  return gaps;
};

/**
 * Analyze strengths that align with target level
 */
const analyzeStrengthsAlignment = (transcript: string, targetSample: CEFRSample): string[] => {
  
  const strengths: string[] = [];
  const text = transcript.toLowerCase();
  
  // Check for presence of target-level features
  const lexicalFeatures = targetSample.lexicalFeatures || [];
  const grammarFeatures = targetSample.grammarFeatures || [];
  const discourseMarkers = targetSample.discourseMarkers || [];
  
  lexicalFeatures.forEach(feature => {
    if (text.includes(feature.toLowerCase())) {
      strengths.push(`Uses ${targetSample.level}-level vocabulary: "${feature}"`);
    }
  });
  
  grammarFeatures.forEach(feature => {
    if (checkGrammarFeature(transcript, feature)) {
      strengths.push(`Demonstrates ${targetSample.level}-level grammar: ${feature}`);
    }
  });
  
  discourseMarkers.forEach(marker => {
    if (text.includes(marker.toLowerCase())) {
      strengths.push(`Uses ${targetSample.level}-level discourse marker: "${marker}"`);
    }
  });
  
  return strengths.slice(0, 3); // Top 3 strengths
};

/**
 * Analyze improvement gaps compared to target level
 */
const analyzeImprovementGaps = (transcript: string, targetSample: CEFRSample): string[] => {
  
  const gaps: string[] = [];
  
  // Compare response length
  const learnerLength = transcript.split(/\s+/).length;
  const targetLength = targetSample.transcript.split(/\s+/).length;
  
  if (learnerLength < targetLength * 0.7) {
    gaps.push(`Expand response length (current: ${learnerLength} words, target: ~${targetLength} words)`);
  }
  
  // Check missing key features
  const missingLexical = (targetSample.lexicalFeatures || []).filter(feature => 
    !transcript.toLowerCase().includes(feature.toLowerCase())
  );
  
  if (missingLexical.length > 0) {
    gaps.push(`Add ${targetSample.level}-level vocabulary: ${missingLexical.slice(0, 2).join(', ')}`);
  }
  
  const missingGrammar = (targetSample.grammarFeatures || []).filter(feature => 
    !checkGrammarFeature(transcript, feature)
  );
  
  if (missingGrammar.length > 0) {
    gaps.push(`Incorporate ${targetSample.level}-level grammar: ${missingGrammar.slice(0, 2).join(', ')}`);
  }
  
  return gaps.slice(0, 3); // Top 3 improvement areas
};

/**
 * Extract specific evidence comparing learner to benchmark
 */
const extractSpecificEvidence = (transcript: string, targetSample: CEFRSample): string[] => {
  
  const evidence: string[] = [];
  
  // Quote similar phrases
  const learnerSentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const benchmarkSentences = targetSample.transcript.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  learnerSentences.forEach(sentence => {
    const similarity = Math.max(...benchmarkSentences.map(bSentence => 
      calculateCosineSimilarity(sentence.trim(), bSentence.trim())
    ));
    
    if (similarity > 0.3) {
      evidence.push(`Similar phrasing to ${targetSample.level} benchmark: "${sentence.trim()}"`);
    }
  });
  
  return evidence.slice(0, 2); // Top 2 pieces of evidence
};

/**
 * Check if a grammar feature is present in the transcript
 */
const checkGrammarFeature = (transcript: string, feature: string): boolean => {
  const text = transcript.toLowerCase();
  
  switch (feature.toLowerCase()) {
    case 'present tenses':
    case 'present simple':
      return /\b(am|is|are|have|has|do|does)\b/.test(text);
    
    case 'past tense':
    case 'past simple':
      return /\b(was|were|had|did|\w+ed)\b/.test(text);
    
    case 'conditionals':
      return /\b(if|would|could|should|might)\b/.test(text);
    
    case 'complex sentences':
    case 'compound sentences':
      return /\b(although|however|because|since|whereas)\b/.test(text);
    
    case 'passive voice':
      return /\b(was|were|is|are)\s+\w+ed\b|\b\w+ed\s+by\b/.test(text);
    
    case 'embedded clauses':
    case 'relative clauses':
      return /\b(who|which|that|where|when)\b.*,/.test(text);
    
    default:
      return text.includes(feature.toLowerCase());
  }
};