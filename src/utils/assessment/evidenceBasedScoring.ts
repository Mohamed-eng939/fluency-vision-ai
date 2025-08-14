/**
 * Evidence-Based CEFR Scoring
 * Functions for generating detailed, evidence-based feedback anchored to CEFR rubrics
 */

import { AssessmentMetrics, CEFRLevel } from '../../types/assessment';
import { findSimilarSamples, calculateWeightedCEFRLevel } from './embeddingSimilarity';
import { cefrSampleBank } from '../../data/assessment/cefrSampleBank';

// CEFR Scoring Rubric per skill (1-10 scale)
export const CEFR_RUBRIC: {
  [skill: string]: {
    [level in CEFRLevel]?: {
      range: [number, number];
      description: string;
      indicators: string[];
    }
  }
} = {
  grammar: {
    'A1': {
      range: [1, 3],
      description: 'Limited control of basic structures, frequent errors',
      indicators: ['missing articles', 'incorrect verb forms', 'basic word order errors']
    },
    'A2': {
      range: [3, 5],
      description: 'Basic structures mostly accurate, some systematic errors',
      indicators: ['correct simple tenses', 'basic linking', 'occasional errors']
    },
    'B1': {
      range: [5, 7],
      description: 'Reasonable accuracy in familiar contexts, some complex attempts',
      indicators: ['modals', 'conditionals', 'complex sentences', 'minor slips']
    },
    'B2': {
      range: [7, 8.5],
      description: 'Good grammatical control, occasional non-systematic errors',
      indicators: ['passive voice', 'complex clauses', 'varied structures']
    },
    'C1': {
      range: [8.5, 10],
      description: 'High degree of accuracy, only rare errors',
      indicators: ['sophisticated structures', 'embedded clauses', 'native-like control']
    }
  },
  vocabulary: {
    'A1': {
      range: [1, 3],
      description: 'Very limited vocabulary, basic words only',
      indicators: ['concrete nouns', 'simple verbs', 'limited adjectives']
    },
    'A2': {
      range: [3, 5],
      description: 'Sufficient vocabulary for familiar topics',
      indicators: ['common collocations', 'topic-specific words', 'simple expressions']
    },
    'B1': {
      range: [5, 7],
      description: 'Adequate vocabulary range with some precision',
      indicators: ['abstract concepts', 'varied expressions', 'circumlocution when needed']
    },
    'B2': {
      range: [7, 8.5],
      description: 'Good range with occasional imprecision',
      indicators: ['sophisticated lexis', 'idiomatic expressions', 'precise meaning']
    },
    'C1': {
      range: [8.5, 10],
      description: 'Wide range used naturally and precisely',
      indicators: ['nuanced vocabulary', 'stylistic awareness', 'native-like precision']
    }
  },
  coherence: {
    'A1': {
      range: [1, 3],
      description: 'Very limited coherence, mainly isolated phrases',
      indicators: ['disconnected ideas', 'no linking', 'unclear sequence']
    },
    'A2': {
      range: [3, 5],
      description: 'Simple linking, logical sequence in familiar contexts',
      indicators: ['basic connectors', 'clear sequencing', 'simple transitions']
    },
    'B1': {
      range: [5, 7],
      description: 'Generally clear progression with adequate linking',
      indicators: ['varied connectors', 'logical development', 'clear structure']
    },
    'B2': {
      range: [7, 8.5],
      description: 'Coherent and cohesive with varied linking devices',
      indicators: ['sophisticated connectors', 'smooth transitions', 'unified themes']
    },
    'C1': {
      range: [8.5, 10],
      description: 'Highly coherent with natural flow',
      indicators: ['seamless progression', 'implicit connections', 'sophisticated organization']
    }
  }
};

export interface EvidenceBasedScore {
  score: number;
  level: CEFRLevel;
  evidence: string[];
  improvements: string[];
  strengths: string[];
}

/**
 * Analyze specific linguistic features in the transcript
 */
export const analyzeLanguageFeatures = (transcript: string) => {
  const features = {
    grammarErrors: [] as string[],
    vocabularyStrengths: [] as string[],
    discourseMarkers: [] as string[],
    complexity: 0
  };
  
  // Basic grammar error detection
  const commonErrors = [
    { pattern: /\b(I|he|she|it)\s+go\b/gi, error: 'subject-verb disagreement (he go → he goes)' },
    { pattern: /\b(I|he|she|it)\s+have\b/gi, error: 'subject-verb disagreement (he have → he has)' },
    { pattern: /\bnot\s+have\b/gi, error: 'missing auxiliary (not have → don\'t have)' },
    { pattern: /\bmake\s+problem/gi, error: 'incorrect collocation (make problem → cause problems)' }
  ];
  
  commonErrors.forEach(({ pattern, error }) => {
    if (pattern.test(transcript)) {
      features.grammarErrors.push(error);
    }
  });
  
  // Vocabulary strength detection
  const sophisticatedWords = [
    'consequently', 'furthermore', 'nevertheless', 'substantial', 'comprehensive',
    'facilitate', 'implement', 'demonstrate', 'significance', 'perspective'
  ];
  
  sophisticatedWords.forEach(word => {
    if (transcript.toLowerCase().includes(word)) {
      features.vocabularyStrengths.push(`sophisticated vocabulary: "${word}"`);
    }
  });
  
  // Discourse marker detection
  const markers = ['however', 'therefore', 'furthermore', 'in addition', 'on the other hand'];
  markers.forEach(marker => {
    if (transcript.toLowerCase().includes(marker)) {
      features.discourseMarkers.push(marker);
    }
  });
  
  // Complexity score (simple heuristic)
  const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const avgWordsPerSentence = transcript.split(/\s+/).length / sentences.length;
  features.complexity = Math.min(10, avgWordsPerSentence / 2);
  
  return features;
};

/**
 * Generate evidence-based score for a specific skill
 */
export const generateEvidenceBasedScore = (
  transcript: string,
  skill: 'grammar' | 'vocabulary' | 'coherence',
  promptId?: string
): EvidenceBasedScore => {
  const features = analyzeLanguageFeatures(transcript);
  const rubric = CEFR_RUBRIC[skill];
  
  let score = 5; // Default middle score
  let level: CEFRLevel = 'B1';
  const evidence: string[] = [];
  const improvements: string[] = [];
  const strengths: string[] = [];
  
  // Use similarity matching if prompt ID available
  if (promptId) {
    const similarityResult = calculateWeightedCEFRLevel(transcript, promptId);
    if (similarityResult) {
      level = similarityResult.level;
      evidence.push(...similarityResult.evidence);
      
      // Map CEFR level to score
      const levelRange = rubric[level]?.range;
      if (levelRange) {
        score = (levelRange[0] + levelRange[1]) / 2;
      }
    }
  }
  
  // Skill-specific analysis
  switch (skill) {
    case 'grammar':
      if (features.grammarErrors.length > 0) {
        evidence.push(...features.grammarErrors.map(error => `Grammar error: ${error}`));
        improvements.push('Focus on subject-verb agreement and auxiliary verbs');
        score = Math.max(1, score - features.grammarErrors.length);
      } else {
        strengths.push('No major grammatical errors detected');
      }
      
      if (features.complexity > 7) {
        strengths.push('Uses complex sentence structures');
        score += 1;
      }
      break;
      
    case 'vocabulary':
      if (features.vocabularyStrengths.length > 0) {
        strengths.push(...features.vocabularyStrengths);
        score += 0.5 * features.vocabularyStrengths.length;
      }
      
      const wordCount = transcript.split(/\s+/).length;
      if (wordCount < 20) {
        improvements.push('Expand vocabulary range - use more varied expressions');
        score -= 1;
      }
      break;
      
    case 'coherence':
      if (features.discourseMarkers.length > 0) {
        strengths.push(`Good use of discourse markers: ${features.discourseMarkers.join(', ')}`);
        score += 0.5;
      } else {
        improvements.push('Use more linking words (however, therefore, in addition)');
        score -= 0.5;
      }
      break;
  }
  
  // Ensure score is within bounds
  score = Math.max(1, Math.min(10, score));
  
  // Determine final level based on score
  for (const [levelKey, data] of Object.entries(rubric)) {
    if (data && score >= data.range[0] && score <= data.range[1]) {
      level = levelKey as CEFRLevel;
      break;
    }
  }
  
  return {
    score: Math.round(score * 10) / 10,
    level,
    evidence,
    improvements,
    strengths
  };
};

/**
 * Check if transcript quality is sufficient for reliable scoring
 */
export const checkTranscriptQuality = (transcript: string): {
  isReliable: boolean;
  reason?: string;
  minSimilarity?: number;
} => {
  if (!transcript || transcript.trim().length === 0) {
    return { isReliable: false, reason: 'No transcript provided' };
  }
  
  const wordCount = transcript.split(/\s+/).filter(word => word.length > 0).length;
  
  if (wordCount < 5) {
    return { isReliable: false, reason: 'Transcript too short (less than 5 words)' };
  }
  
  if (wordCount < 10) {
    return { isReliable: true, minSimilarity: 0.2, reason: 'Short transcript - lower confidence' };
  }
  
  return { isReliable: true, minSimilarity: 0.1 };
};

/**
 * Generate comprehensive evidence-based assessment
 */
export const generateEvidenceBasedAssessment = (
  transcript: string,
  promptId?: string
): {
  isReliable: boolean;
  scores: { [skill: string]: EvidenceBasedScore };
  overallLevel: CEFRLevel;
  overallScore: number;
  feedback: string[];
  reason?: string;
} => {
  const qualityCheck = checkTranscriptQuality(transcript);
  
  if (!qualityCheck.isReliable) {
    return {
      isReliable: false,
      scores: {},
      overallLevel: 'A1',
      overallScore: 0,
      feedback: [],
      reason: qualityCheck.reason
    };
  }
  
  const skills = ['grammar', 'vocabulary', 'coherence'] as const;
  const scores: { [skill: string]: EvidenceBasedScore } = {};
  
  skills.forEach(skill => {
    scores[skill] = generateEvidenceBasedScore(transcript, skill, promptId);
  });
  
  // Calculate overall score and level
  const avgScore = Object.values(scores).reduce((sum, score) => sum + score.score, 0) / skills.length;
  
  // Determine overall CEFR level (use most frequent level)
  const levels = Object.values(scores).map(s => s.level);
  const levelCounts = levels.reduce((acc, level) => {
    acc[level] = (acc[level] || 0) + 1;
    return acc;
  }, {} as { [key: string]: number });
  
  const overallLevel = Object.entries(levelCounts).reduce((a, b) => 
    levelCounts[a[0]] > levelCounts[b[0]] ? a : b
  )[0] as CEFRLevel;
  
  // Generate comprehensive feedback
  const feedback: string[] = [];
  
  // Add strengths
  Object.entries(scores).forEach(([skill, data]) => {
    if (data.strengths.length > 0) {
      feedback.push(`${skill.charAt(0).toUpperCase() + skill.slice(1)} strengths: ${data.strengths.join(', ')}`);
    }
  });
  
  // Add areas for improvement
  Object.entries(scores).forEach(([skill, data]) => {
    if (data.improvements.length > 0) {
      feedback.push(`${skill.charAt(0).toUpperCase() + skill.slice(1)} improvements: ${data.improvements.join(', ')}`);
    }
  });
  
  return {
    isReliable: true,
    scores,
    overallLevel,
    overallScore: Math.round(avgScore * 10) / 10,
    feedback,
    reason: qualityCheck.reason
  };
};