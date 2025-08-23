/**
 * Evidence-Based Feedback Generator
 * Generates feedback that cites specific elements from learner responses
 */

import { findSimilarSamples, SimilarityMatch } from './embeddingSimilarity';
import { getComprehensiveRubricScore } from './cefrRubricScoring';
import { CEFRLevel } from '../../types/assessment';

export interface EvidenceCitation {
  quote: string;
  analysis: string;
  improvement: string;
}

export interface EvidenceBasedFeedback {
  isReliable: boolean;
  overallLevel: CEFRLevel;
  confidence: number;
  grammar: {
    score: number;
    level: CEFRLevel;
    citations: EvidenceCitation[];
    rubricEvidence: string[];
  };
  vocabulary: {
    score: number;
    level: CEFRLevel;
    citations: EvidenceCitation[];
    rubricEvidence: string[];
  };
  coherence: {
    score: number;
    level: CEFRLevel;
    citations: EvidenceCitation[];
    rubricEvidence: string[];
  };
  similarityAnalysis?: {
    closestMatch: SimilarityMatch;
    levelJustification: string;
  };
  insufficientDataReason?: string;
}

/**
 * Generate evidence-based feedback with specific citations
 */
export const generateEvidenceBasedFeedback = (
  transcript: string,
  promptId?: string,
  minSimilarity: number = 0.2,
  minWords: number = 8
): EvidenceBasedFeedback => {
  
  // Check data sufficiency
  const words = transcript.trim().split(/\s+/).filter(w => w.length > 0);
  
  if (words.length < minWords) {
    return {
      isReliable: false,
      overallLevel: 'A1',
      confidence: 0,
      grammar: { score: 0, level: 'A1', citations: [], rubricEvidence: [] },
      vocabulary: { score: 0, level: 'A1', citations: [], rubricEvidence: [] },
      coherence: { score: 0, level: 'A1', citations: [], rubricEvidence: [] },
      insufficientDataReason: `Response too short: ${words.length} words (minimum: ${minWords})`
    };
  }
  
  // Get similarity analysis if prompt ID provided
  let similarityAnalysis: { closestMatch: SimilarityMatch; levelJustification: string } | undefined;
  
  if (promptId) {
    const similarMatches = findSimilarSamples(transcript, promptId);
    
    if (similarMatches.length > 0 && similarMatches[0].similarity >= minSimilarity) {
      const closestMatch = similarMatches[0];
      similarityAnalysis = {
        closestMatch,
        levelJustification: `Response shows ${(closestMatch.similarity * 100).toFixed(1)}% similarity to ${closestMatch.level} benchmark sample`
      };
    } else {
      return {
        isReliable: false,
        overallLevel: 'A1',
        confidence: 0,
        grammar: { score: 0, level: 'A1', citations: [], rubricEvidence: [] },
        vocabulary: { score: 0, level: 'A1', citations: [], rubricEvidence: [] },
        coherence: { score: 0, level: 'A1', citations: [], rubricEvidence: [] },
        insufficientDataReason: `Low similarity to benchmarks: ${similarMatches[0]?.similarity.toFixed(3)} (minimum: ${minSimilarity})`
      };
    }
  }
  
  // Get rubric-based scoring
  const rubricScores = getComprehensiveRubricScore(transcript);
  
  if (rubricScores.overallConfidence < 0.4) {
    return {
      isReliable: false,
      overallLevel: 'A1',
      confidence: 0,
      grammar: { score: 0, level: 'A1', citations: [], rubricEvidence: [] },
      vocabulary: { score: 0, level: 'A1', citations: [], rubricEvidence: [] },
      coherence: { score: 0, level: 'A1', citations: [], rubricEvidence: [] },
      insufficientDataReason: `Insufficient evidence for reliable scoring (confidence: ${(rubricScores.overallConfidence * 100).toFixed(0)}%)`
    };
  }
  
  // Generate evidence-based feedback for each skill
  const grammarFeedback = generateSkillFeedback('grammar', transcript, rubricScores.grammar);
  const vocabularyFeedback = generateSkillFeedback('vocabulary', transcript, rubricScores.vocabulary);
  const coherenceFeedback = generateSkillFeedback('coherence', transcript, rubricScores.coherence);
  
  // Determine overall level
  const avgScore = (rubricScores.grammar.score + rubricScores.vocabulary.score + rubricScores.coherence.score) / 3;
  const overallLevel = determineOverallLevel(avgScore);
  
  return {
    isReliable: true,
    overallLevel,
    confidence: rubricScores.overallConfidence,
    grammar: {
      score: rubricScores.grammar.score,
      level: rubricScores.grammar.level,
      citations: grammarFeedback,
      rubricEvidence: rubricScores.grammar.evidence
    },
    vocabulary: {
      score: rubricScores.vocabulary.score,
      level: rubricScores.vocabulary.level,
      citations: vocabularyFeedback,
      rubricEvidence: rubricScores.vocabulary.evidence
    },
    coherence: {
      score: rubricScores.coherence.score,
      level: rubricScores.coherence.level,
      citations: coherenceFeedback,
      rubricEvidence: rubricScores.coherence.evidence
    },
    similarityAnalysis
  };
};

/**
 * Generate skill-specific feedback with evidence citations
 */
const generateSkillFeedback = (
  skill: 'grammar' | 'vocabulary' | 'coherence',
  transcript: string,
  rubricResult: { score: number; level: CEFRLevel; evidence: string[]; confidence: number }
): EvidenceCitation[] => {
  
  const citations: EvidenceCitation[] = [];
  
  switch (skill) {
    case 'grammar':
      citations.push(...analyzeGrammarEvidence(transcript, rubricResult));
      break;
    case 'vocabulary':
      citations.push(...analyzeVocabularyEvidence(transcript, rubricResult));
      break;
    case 'coherence':
      citations.push(...analyzeCoherenceEvidence(transcript, rubricResult));
      break;
  }
  
  return citations.slice(0, 3); // Limit to 3 most important citations
};

/**
 * Analyze grammar with specific evidence citations
 */
const analyzeGrammarEvidence = (
  transcript: string,
  rubricResult: { score: number; level: CEFRLevel }
): EvidenceCitation[] => {
  
  const citations: EvidenceCitation[] = [];
  const text = transcript.toLowerCase();
  
  // Check for specific grammar patterns and cite them
  
  // Subject-verb agreement errors
  const svAgreementErrors = text.match(/\b(he|she|it)\s+(are|were|have)\b|\b(they|we)\s+(is|was|has)\b/g);
  if (svAgreementErrors) {
    citations.push({
      quote: svAgreementErrors[0],
      analysis: 'This shows subject-verb disagreement, indicating A1-A2 level grammar control.',
      improvement: 'Practice matching subjects with correct verb forms: he/she/it + is/was/has, they/we + are/were/have.'
    });
  }
  
  // Tense consistency
  const tenseIssues = text.match(/yesterday.*will|tomorrow.*was|last week.*going to/);
  if (tenseIssues) {
    citations.push({
      quote: tenseIssues[0],
      analysis: 'Mixed tense usage suggests difficulty with time reference, typical of A2-B1 level.',
      improvement: 'Match tense with time expressions: yesterday + past tense, tomorrow + future tense.'
    });
  }
  
  // Complex structures (positive indicators)
  const complexStructures = text.match(/\b(although|however|whereas|despite|nevertheless)\b/g);
  if (complexStructures) {
    citations.push({
      quote: complexStructures.join(', '),
      analysis: 'Use of complex conjunctions demonstrates B2+ level grammatical awareness.',
      improvement: 'Continue developing sophisticated sentence structures for C1 level fluency.'
    });
  }
  
  // Conditional usage
  const conditionals = text.match(/if\s+.*would|would.*if/);
  if (conditionals) {
    citations.push({
      quote: conditionals[0],
      analysis: 'Conditional structures show B1+ level grammar, indicating good structural awareness.',
      improvement: 'Practice mixed conditionals and subjunctive forms for advanced proficiency.'
    });
  }
  
  return citations;
};

/**
 * Analyze vocabulary with specific evidence citations
 */
const analyzeVocabularyEvidence = (
  transcript: string,
  rubricResult: { score: number; level: CEFRLevel }
): EvidenceCitation[] => {
  
  const citations: EvidenceCitation[] = [];
  const words = transcript.toLowerCase().split(/\s+/);
  
  // Check vocabulary sophistication
  
  // Basic vocabulary (A1-A2)
  const basicWords = words.filter(w => 
    ['good', 'bad', 'nice', 'big', 'small', 'like', 'want', 'go', 'come'].includes(w)
  );
  if (basicWords.length > words.length * 0.3) {
    citations.push({
      quote: basicWords.slice(0, 3).join(', '),
      analysis: 'Heavy reliance on basic vocabulary suggests A1-A2 level lexical range.',
      improvement: 'Replace basic words with more specific terms: "excellent" instead of "good", "challenging" instead of "hard".'
    });
  }
  
  // Advanced vocabulary (B2+)
  const advancedWords = words.filter(w => 
    ['consequently', 'furthermore', 'nevertheless', 'substantial', 'remarkable', 'sophisticated'].includes(w)
  );
  if (advancedWords.length > 0) {
    citations.push({
      quote: advancedWords.join(', '),
      analysis: 'Advanced vocabulary usage demonstrates B2-C1 level lexical sophistication.',
      improvement: 'Continue expanding academic and formal vocabulary for C2 level precision.'
    });
  }
  
  // Academic vocabulary (C1+)
  const academicWords = words.filter(w => 
    ['analyze', 'synthesize', 'conceptual', 'theoretical', 'methodology', 'paradigm'].includes(w)
  );
  if (academicWords.length > 0) {
    citations.push({
      quote: academicWords.join(', '),
      analysis: 'Academic vocabulary shows C1+ level register awareness and precision.',
      improvement: 'Maintain this sophisticated lexical range while ensuring natural usage.'
    });
  }
  
  // Word repetition analysis
  const wordCounts = words.reduce((acc, word) => {
    acc[word] = (acc[word] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const repeatedWords = Object.entries(wordCounts)
    .filter(([word, count]) => count > 2 && word.length > 3)
    .map(([word]) => word);
  
  if (repeatedWords.length > 0) {
    citations.push({
      quote: repeatedWords.slice(0, 2).join(', '),
      analysis: 'Repeated vocabulary suggests limited lexical range, characteristic of A2-B1 level.',
      improvement: 'Use synonyms and varied expressions to demonstrate broader vocabulary range.'
    });
  }
  
  return citations;
};

/**
 * Analyze coherence with specific evidence citations
 */
const analyzeCoherenceEvidence = (
  transcript: string,
  rubricResult: { score: number; level: CEFRLevel }
): EvidenceCitation[] => {
  
  const citations: EvidenceCitation[] = [];
  const text = transcript.toLowerCase();
  
  // Check discourse markers and organization
  
  // Basic connectors
  const basicConnectors = text.match(/\b(and|but|so|because|then|after)\b/g);
  if (basicConnectors && basicConnectors.length > 0) {
    citations.push({
      quote: basicConnectors.slice(0, 3).join(', '),
      analysis: 'Use of basic connectors shows A2-B1 level coherence development.',
      improvement: 'Add sophisticated discourse markers like "furthermore", "nevertheless", "consequently".'
    });
  }
  
  // Advanced discourse markers
  const advancedMarkers = text.match(/\b(furthermore|moreover|nevertheless|consequently|in contrast|on the other hand)\b/g);
  if (advancedMarkers) {
    citations.push({
      quote: advancedMarkers.join(', '),
      analysis: 'Advanced discourse markers demonstrate B2-C1 level organizational skills.',
      improvement: 'Continue using sophisticated linking to create seamless idea flow.'
    });
  }
  
  // Logical flow analysis
  const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 0);
  if (sentences.length < 2) {
    citations.push({
      quote: 'Single sentence response',
      analysis: 'Limited sentence variety suggests A1-A2 level discourse organization.',
      improvement: 'Develop ideas across multiple sentences with clear logical connections.'
    });
  }
  
  // Topic development
  const topicWords = extractTopicWords(transcript);
  if (topicWords.length < 3) {
    citations.push({
      quote: 'Limited topic development',
      analysis: 'Minimal topic elaboration indicates A2-B1 level coherence.',
      improvement: 'Expand ideas with examples, explanations, and supporting details.'
    });
  }
  
  return citations;
};

/**
 * Extract topic-related words for coherence analysis
 */
const extractTopicWords = (transcript: string): string[] => {
  const words = transcript.toLowerCase().split(/\s+/);
  const topicWords = words.filter(word => 
    word.length > 4 && 
    !['that', 'this', 'with', 'have', 'they', 'were', 'been', 'will', 'would', 'could'].includes(word)
  );
  return [...new Set(topicWords)]; // Remove duplicates
};

/**
 * Determine overall CEFR level from average score
 */
const determineOverallLevel = (avgScore: number): CEFRLevel => {
  if (avgScore >= 9.5) return 'C2';
  if (avgScore >= 8.5) return 'C1';
  if (avgScore >= 7.5) return 'B2';
  if (avgScore >= 6.5) return 'B1';
  if (avgScore >= 4.5) return 'A2';
  return 'A1';
};