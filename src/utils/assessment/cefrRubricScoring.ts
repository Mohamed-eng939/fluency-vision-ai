/**
 * CEFR Rubric-Based Scoring System
 * Provides deterministic scoring based on official CEFR descriptors
 */

import { CEFRLevel } from '../../types/assessment';

export interface CEFRRubricDescriptor {
  score: number;
  level: CEFRLevel;
  descriptor: string;
  evidenceMarkers: string[];
}

/**
 * Grammar scoring rubric based on CEFR descriptors
 */
export const grammarRubric: CEFRRubricDescriptor[] = [
  {
    score: 1,
    level: 'A1',
    descriptor: 'Very limited grammatical control; frequent errors prevent communication',
    evidenceMarkers: ['missing verbs', 'no subject-verb agreement', 'word-level communication', 'missing articles']
  },
  {
    score: 2,
    level: 'A1',
    descriptor: 'Basic grammatical control; errors in simple structures',
    evidenceMarkers: ['basic present tense errors', 'incorrect be-verb usage', 'missing plurals']
  },
  {
    score: 3,
    level: 'A2',
    descriptor: 'Limited grammatical control; errors in familiar patterns',
    evidenceMarkers: ['tense confusion', 'basic modal errors', 'simple sentence structure only']
  },
  {
    score: 4,
    level: 'A2',
    descriptor: 'Some control of familiar grammatical forms; frequent errors in complex structures',
    evidenceMarkers: ['past tense attempts', 'some correct modals', 'basic conjunctions']
  },
  {
    score: 5,
    level: 'B1',
    descriptor: 'Reasonable control of grammar; errors occur with complex structures',
    evidenceMarkers: ['varied tense usage', 'conditional attempts', 'compound sentences']
  },
  {
    score: 6,
    level: 'B1',
    descriptor: 'Good control of simple structures; attempts complex grammar with some errors',
    evidenceMarkers: ['consistent tense control', 'relative clauses', 'passive voice attempts']
  },
  {
    score: 7,
    level: 'B2',
    descriptor: 'Generally good grammatical control; occasional errors in complex structures',
    evidenceMarkers: ['complex sentences', 'accurate conditionals', 'varied structures']
  },
  {
    score: 8,
    level: 'B2',
    descriptor: 'Wide range of grammar; minor errors that don\'t impede communication',
    evidenceMarkers: ['sophisticated structures', 'embedded clauses', 'accurate modals']
  },
  {
    score: 9,
    level: 'C1',
    descriptor: 'Maintains consistent grammatical control of complex language',
    evidenceMarkers: ['native-like structures', 'nuanced grammar', 'complex nominalizations']
  },
  {
    score: 10,
    level: 'C2',
    descriptor: 'Maintains consistent grammatical control even while attention is focused elsewhere',
    evidenceMarkers: ['flawless complex grammar', 'sophisticated register', 'academic structures']
  }
];

/**
 * Vocabulary scoring rubric based on CEFR descriptors
 */
export const vocabularyRubric: CEFRRubricDescriptor[] = [
  {
    score: 1,
    level: 'A1',
    descriptor: 'Very basic vocabulary; limited to isolated words',
    evidenceMarkers: ['single words', 'basic nouns', 'no descriptive words']
  },
  {
    score: 2,
    level: 'A1',
    descriptor: 'Limited vocabulary for immediate needs',
    evidenceMarkers: ['simple adjectives', 'basic verbs', 'family/work vocabulary']
  },
  {
    score: 3,
    level: 'A2',
    descriptor: 'Sufficient vocabulary for basic communication on familiar topics',
    evidenceMarkers: ['descriptive vocabulary', 'opinion words', 'time expressions']
  },
  {
    score: 4,
    level: 'A2',
    descriptor: 'Adequate vocabulary for routine tasks and familiar topics',
    evidenceMarkers: ['topic-specific words', 'comparative forms', 'connective phrases']
  },
  {
    score: 5,
    level: 'B1',
    descriptor: 'Sufficient vocabulary to express opinions and explain topics',
    evidenceMarkers: ['abstract concepts', 'explanation vocabulary', 'varied expressions']
  },
  {
    score: 6,
    level: 'B1',
    descriptor: 'Good range of vocabulary; occasional circumlocution',
    evidenceMarkers: ['precise word choice', 'collocations', 'topic development']
  },
  {
    score: 7,
    level: 'B2',
    descriptor: 'Wide range of vocabulary; good control of lexical features',
    evidenceMarkers: ['sophisticated vocabulary', 'idiomatic usage', 'register awareness']
  },
  {
    score: 8,
    level: 'B2',
    descriptor: 'Broad lexical resource; natural and sophisticated usage',
    evidenceMarkers: ['precise terminology', 'advanced collocations', 'stylistic features']
  },
  {
    score: 9,
    level: 'C1',
    descriptor: 'Broad range of natural and precise vocabulary',
    evidenceMarkers: ['academic vocabulary', 'nuanced word choice', 'native-like expressions']
  },
  {
    score: 10,
    level: 'C2',
    descriptor: 'Precise, natural, and sophisticated vocabulary for all purposes',
    evidenceMarkers: ['expert-level terminology', 'cultural references', 'stylistic mastery']
  }
];

/**
 * Coherence scoring rubric based on CEFR descriptors
 */
export const coherenceRubric: CEFRRubricDescriptor[] = [
  {
    score: 1,
    level: 'A1',
    descriptor: 'No clear organization; isolated ideas',
    evidenceMarkers: ['disconnected words', 'no logical flow', 'incomprehensible structure']
  },
  {
    score: 2,
    level: 'A1',
    descriptor: 'Very basic linking of ideas with simple connectors',
    evidenceMarkers: ['basic "and" usage', 'simple sequencing', 'minimal coherence']
  },
  {
    score: 3,
    level: 'A2',
    descriptor: 'Uses basic connectors but organization is often unclear',
    evidenceMarkers: ['then/after usage', 'basic sequencing', 'simple cause-effect']
  },
  {
    score: 4,
    level: 'A2',
    descriptor: 'Links groups of words with simple connectors',
    evidenceMarkers: ['because/so usage', 'basic contrast', 'simple paragraphing']
  },
  {
    score: 5,
    level: 'B1',
    descriptor: 'Links ideas into coherent discourse; some lapses',
    evidenceMarkers: ['varied connectors', 'logical development', 'clear progression']
  },
  {
    score: 6,
    level: 'B1',
    descriptor: 'Organizes information coherently with appropriate linking',
    evidenceMarkers: ['discourse markers', 'topic development', 'clear structure']
  },
  {
    score: 7,
    level: 'B2',
    descriptor: 'Logically organized with clear progression of ideas',
    evidenceMarkers: ['sophisticated linking', 'coherent argumentation', 'smooth transitions']
  },
  {
    score: 8,
    level: 'B2',
    descriptor: 'Sequences ideas logically and cohesively',
    evidenceMarkers: ['advanced discourse markers', 'clear reasoning', 'effective emphasis']
  },
  {
    score: 9,
    level: 'C1',
    descriptor: 'Clear, well-structured discourse with effective use of patterns',
    evidenceMarkers: ['sophisticated organization', 'complex argumentation', 'rhetorical devices']
  },
  {
    score: 10,
    level: 'C2',
    descriptor: 'Coherent and cohesive discourse appropriate to context',
    evidenceMarkers: ['expert organization', 'seamless flow', 'contextual awareness']
  }
];

/**
 * Find the most appropriate rubric score based on evidence in transcript
 */
export const scoreAgainstRubric = (
  transcript: string,
  rubric: CEFRRubricDescriptor[]
): { score: number; level: CEFRLevel; evidence: string[]; confidence: number } => {
  
  const words = transcript.toLowerCase().split(/\s+/);
  const text = transcript.toLowerCase();
  
  let bestMatch = rubric[0];
  let evidence: string[] = [];
  let matchCount = 0;
  
  // Find the rubric level with most evidence markers present
  for (const descriptor of rubric) {
    let currentMatches = 0;
    const currentEvidence: string[] = [];
    
    for (const marker of descriptor.evidenceMarkers) {
      if (checkEvidenceMarker(text, words, marker)) {
        currentMatches++;
        currentEvidence.push(`Found: ${marker}`);
      }
    }
    
    // Score based on percentage of evidence markers found
    const matchRate = currentMatches / descriptor.evidenceMarkers.length;
    
    if (matchRate > 0.3 && currentMatches > matchCount) { // At least 30% of markers
      matchCount = currentMatches;
      bestMatch = descriptor;
      evidence = currentEvidence;
    }
  }
  
  const confidence = Math.min(0.9, matchCount / bestMatch.evidenceMarkers.length + 0.3);
  
  return {
    score: bestMatch.score,
    level: bestMatch.level,
    evidence,
    confidence
  };
};

/**
 * Check if an evidence marker is present in the transcript
 */
const checkEvidenceMarker = (text: string, words: string[], marker: string): boolean => {
  switch (marker) {
    // Grammar markers
    case 'missing verbs':
      return /\b(i|he|she|they)\s+(good|bad|nice|big|small)\b/.test(text) ||
             /\b(i|he|she|they)\s+(home|school|work)\b/.test(text);
    
    case 'no subject-verb agreement':
      return /\b(he|she|it)\s+(are|were|have)\b/.test(text) ||
             /\b(they|we)\s+(is|was|has)\b/.test(text);
    
    case 'basic present tense errors':
      return /\b(i|you|we|they)\s+(is|am)\b/.test(text) ||
             /\b(he|she|it)\s+(are|am)\b/.test(text);
    
    case 'tense confusion':
      return /yesterday.*will|tomorrow.*was|last week.*going to/.test(text);
    
    case 'conditional attempts':
      return /\b(if|would|could|might|should)\b/.test(text);
    
    case 'complex sentences':
      return /\b(although|however|whereas|despite|nevertheless)\b/.test(text);
    
    case 'passive voice attempts':
      return /\b(was|were|is|are)\s+\w+ed\b/.test(text) ||
             /\b(made|done|built|created|established)\s+by\b/.test(text);
    
    // Vocabulary markers
    case 'single words':
      return words.length < 5 && !/\band\b|\bor\b|\bbut\b/.test(text);
    
    case 'basic nouns':
      return /\b(mother|father|home|work|school|food|good|bad)\b/.test(text);
    
    case 'descriptive vocabulary':
      return /\b(beautiful|interesting|difficult|expensive|comfortable)\b/.test(text);
    
    case 'abstract concepts':
      return /\b(freedom|happiness|responsibility|opportunity|experience)\b/.test(text);
    
    case 'sophisticated vocabulary':
      return /\b(consequently|furthermore|nevertheless|substantial|remarkable)\b/.test(text);
    
    case 'academic vocabulary':
      return /\b(analyze|synthesize|conceptual|theoretical|methodology)\b/.test(text);
    
    // Coherence markers
    case 'disconnected words':
      return words.length < 8 && !/\band\b|\bthen\b|\bso\b/.test(text);
    
    case 'basic "and" usage':
      return /\band\b/.test(text) && !/\bbut\b|\bhowever\b|\balthough\b/.test(text);
    
    case 'then/after usage':
      return /\b(then|after|next|first)\b/.test(text);
    
    case 'because/so usage':
      return /\b(because|so|since|therefore)\b/.test(text);
    
    case 'discourse markers':
      return /\b(furthermore|moreover|in addition|on the other hand)\b/.test(text);
    
    case 'sophisticated linking':
      return /\b(consequently|nevertheless|notwithstanding|in contrast)\b/.test(text);
    
    default:
      // General pattern matching for other markers
      return text.includes(marker.toLowerCase());
  }
};

/**
 * Get comprehensive rubric-based scoring for all skills
 */
export const getComprehensiveRubricScore = (transcript: string) => {
  const grammarResult = scoreAgainstRubric(transcript, grammarRubric);
  const vocabularyResult = scoreAgainstRubric(transcript, vocabularyRubric);
  const coherenceResult = scoreAgainstRubric(transcript, coherenceRubric);
  
  return {
    grammar: grammarResult,
    vocabulary: vocabularyResult,
    coherence: coherenceResult,
    overallConfidence: (grammarResult.confidence + vocabularyResult.confidence + coherenceResult.confidence) / 3
  };
};