/**
 * Expert-aligned grammar scoring based on IELTS/PTE band descriptors
 * Focuses on error density and grammatical range/accuracy
 */

export interface GrammarAnalysis {
  errorsPerHundredWords: number;
  grammaticalRange: number; // 1-5 scale
  accuracy: number; // 1-5 scale
  complexStructureUsage: number; // 0-100%
  bandScore: number;
  fallbackUsed: boolean;
  bandJustification: string;
  detectedErrors: GrammaticalError[];
}

export interface GrammaticalError {
  type: 'tense' | 'agreement' | 'article' | 'preposition' | 'word_order' | 'other';
  severity: 'minor' | 'major';
  position: number;
  description: string;
}

/**
 * Calculate expert-aligned grammar score using IELTS band descriptors
 */
export const calculateExpertGrammarScore = (
  transcript: string,
  detectedErrors?: GrammaticalError[]
): GrammarAnalysis => {
  
  const words = transcript.trim().split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;
  
  // Detect errors if not provided
  const errors = detectedErrors || detectGrammaticalErrors(transcript);
  
  // Calculate error density per 100 words
  const errorsPerHundredWords = wordCount > 0 ? (errors.length / wordCount) * 100 : 0;
  
  // Determine base band score from error density
  let baseScore = getBandFromErrorDensity(errorsPerHundredWords);
  let justification = `${errorsPerHundredWords.toFixed(1)} errors per 100 words`;
  
  // Assess grammatical range (variety of structures)
  const rangeScore = assessGrammaticalRange(transcript);
  if (rangeScore < 2) {
    baseScore = Math.min(baseScore, 5.0); // Cap for limited range
    justification += `, limited range`;
  } else if (rangeScore >= 4) {
    baseScore += 0.5; // Bonus for good range
    justification += `, good range`;
  }
  
  // Check for repetitive simple tense usage
  if (hasRepetitiveSimpleTenses(transcript)) {
    baseScore = Math.min(baseScore, 6.0);
    justification += `, repetitive tenses`;
  }
  
  // Assess complex structure usage
  const complexUsage = assessComplexStructureUsage(transcript);
  if (complexUsage >= 60) {
    baseScore += 0.5; // Bonus for good complex structure control
    justification += `, complex structures`;
  } else if (complexUsage < 20) {
    baseScore = Math.min(baseScore, 6.5); // Cap for lack of complexity
    justification += `, simple structures`;
  }
  
  // Ensure score is within valid band range
  const finalScore = Math.max(1.0, Math.min(9.0, baseScore));
  
  return {
    errorsPerHundredWords,
    grammaticalRange: rangeScore,
    accuracy: Math.max(1, 5 - Math.floor(errorsPerHundredWords / 2)),
    complexStructureUsage: complexUsage,
    bandScore: Math.round(finalScore * 2) / 2, // Round to nearest 0.5
    fallbackUsed: false,
    bandJustification: justification,
    detectedErrors: errors
  };
};

/**
 * Map error density to IELTS band scores
 */
function getBandFromErrorDensity(errorsPerHundredWords: number): number {
  if (errorsPerHundredWords <= 1) {
    return errorsPerHundredWords <= 0.5 ? 9.0 : 8.5; // 0–1 minor slips → Band 9, 1-2 errors → Band 8.5
  } else if (errorsPerHundredWords <= 2) {
    return 7.5 + (2 - errorsPerHundredWords) * 0.5; // 1–2 errors → Band 7–8
  } else if (errorsPerHundredWords <= 5) {
    return 6.0 + (5 - errorsPerHundredWords) / 3 * 1.5; // 3–5 errors → Band 6
  } else {
    return Math.max(4.0, 6.0 - (errorsPerHundredWords - 5) * 0.3); // 6+ errors → Band 4–5
  }
}

/**
 * Detect grammatical errors in transcript (simplified implementation)
 */
function detectGrammaticalErrors(transcript: string): GrammaticalError[] {
  const errors: GrammaticalError[] = [];
  const text = transcript.toLowerCase();
  
  // Simple error detection patterns
  const errorPatterns = [
    { pattern: /\bi am go\b/, type: 'tense' as const, severity: 'major' as const, desc: 'Incorrect tense formation' },
    { pattern: /\bhe are\b|\bshe are\b|\bit are\b/, type: 'agreement' as const, severity: 'major' as const, desc: 'Subject-verb disagreement' },
    { pattern: /\ba university\b/, type: 'article' as const, severity: 'minor' as const, desc: 'Article usage' },
    { pattern: /\bdepends of\b/, type: 'preposition' as const, severity: 'minor' as const, desc: 'Preposition error' },
    { pattern: /\bvery much\s+\w+\b/, type: 'word_order' as const, severity: 'minor' as const, desc: 'Word order' }
  ];
  
  errorPatterns.forEach(({ pattern, type, severity, desc }) => {
    const matches = text.match(pattern);
    if (matches) {
      errors.push({
        type,
        severity,
        position: text.indexOf(matches[0]),
        description: desc
      });
    }
  });
  
  return errors;
}

/**
 * Assess grammatical range (1-5 scale)
 */
function assessGrammaticalRange(transcript: string): number {
  const text = transcript.toLowerCase();
  let rangeScore = 1;
  
  // Check for various grammatical structures
  if (text.includes('if ') || text.includes('when ') || text.includes('because ')) rangeScore++;
  if (text.includes('although ') || text.includes('despite ') || text.includes('however')) rangeScore++;
  if (text.includes('which ') || text.includes(' that ') || text.includes(' who ')) rangeScore++;
  if (text.includes('would ') || text.includes('could ') || text.includes('should ')) rangeScore++;
  
  return Math.min(5, rangeScore);
}

/**
 * Check for repetitive simple tense usage
 */
function hasRepetitiveSimpleTenses(transcript: string): boolean {
  const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 0);
  if (sentences.length < 3) return false;
  
  const simplePastPattern = /\b\w+ed\b/g;
  const simplePresentPattern = /\b(is|are|am)\s+\w+ing\b/g;
  
  let simpleTenseCount = 0;
  sentences.forEach(sentence => {
    if (simplePastPattern.test(sentence) || simplePresentPattern.test(sentence)) {
      simpleTenseCount++;
    }
  });
  
  return simpleTenseCount > sentences.length * 0.8;
}

/**
 * Assess complex structure usage (0-100%)
 */
function assessComplexStructureUsage(transcript: string): number {
  const text = transcript.toLowerCase();
  const totalSentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
  
  if (totalSentences === 0) return 0;
  
  let complexCount = 0;
  const complexMarkers = [
    'although', 'despite', 'whereas', 'while', 'even though',
    'if', 'unless', 'provided that', 'in case',
    'because', 'since', 'as', 'due to',
    'which', 'that', 'who', 'whom', 'whose'
  ];
  
  complexMarkers.forEach(marker => {
    if (text.includes(marker)) complexCount++;
  });
  
  return Math.min(100, (complexCount / totalSentences) * 100);
}