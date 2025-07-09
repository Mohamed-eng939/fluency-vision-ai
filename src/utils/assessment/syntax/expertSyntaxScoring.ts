/**
 * Expert-aligned syntax scoring based on IELTS/PTE band descriptors
 * Focuses on sentence variety, complexity, and grammatical control
 */

export interface SyntaxAnalysis {
  sentenceVariety: number; // 1-5 scale
  complexityScore: number; // 0-100%
  subordinationUsage: number; // 0-100%
  errorDensity: number; // errors per 100 words
  bandScore: number;
  fallbackUsed: boolean;
  bandJustification: string;
  sentenceBreakdown: {
    simple: number;
    compound: number;
    complex: number;
    compoundComplex: number;
  };
}

/**
 * Calculate expert-aligned syntax score using IELTS band descriptors
 */
export const calculateExpertSyntaxScore = (transcript: string): SyntaxAnalysis => {
  const sentences = splitIntoSentences(transcript);
  
  if (sentences.length === 0) {
    return createEmptySyntaxAnalysis();
  }
  
  // Analyze sentence types
  const sentenceBreakdown = categorizeSentences(sentences);
  
  // Calculate sentence variety (1-5 scale)
  const sentenceVariety = calculateSentenceVariety(sentenceBreakdown);
  
  // Calculate complexity score (0-100%)
  const complexityScore = calculateComplexityScore(sentenceBreakdown, sentences);
  
  // Calculate subordination usage
  const subordinationUsage = calculateSubordinationUsage(transcript);
  
  // Calculate syntax error density
  const errorDensity = calculateSyntaxErrorDensity(transcript);
  
  // Determine band score
  const baseScore = getBandFromSyntaxProfile(
    sentenceVariety,
    complexityScore,
    subordinationUsage,
    errorDensity
  );
  
  const justification = createSyntaxJustification(
    sentenceVariety,
    complexityScore,
    subordinationUsage,
    errorDensity
  );
  
  // Ensure score is within valid band range
  const finalScore = Math.max(1.0, Math.min(9.0, baseScore));
  
  return {
    sentenceVariety,
    complexityScore,
    subordinationUsage,
    errorDensity,
    bandScore: Math.round(finalScore * 2) / 2, // Round to nearest 0.5
    fallbackUsed: false,
    bandJustification: justification,
    sentenceBreakdown
  };
};

/**
 * Split text into sentences
 */
function splitIntoSentences(text: string): string[] {
  return text
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 0);
}

/**
 * Categorize sentences by type
 */
function categorizeSentences(sentences: string[]): {
  simple: number;
  compound: number;
  complex: number;
  compoundComplex: number;
} {
  const breakdown = { simple: 0, compound: 0, complex: 0, compoundComplex: 0 };
  
  sentences.forEach(sentence => {
    const text = sentence.toLowerCase();
    
    // Count coordinating conjunctions (and, but, or, so)
    const coordinatingCount = (text.match(/\b(and|but|or|so)\b/g) || []).length;
    
    // Count subordinating conjunctions and relative pronouns
    const subordinatingCount = (text.match(/\b(because|since|although|while|if|when|that|which|who)\b/g) || []).length;
    
    if (coordinatingCount > 0 && subordinatingCount > 0) {
      breakdown.compoundComplex++;
    } else if (subordinatingCount > 0) {
      breakdown.complex++;
    } else if (coordinatingCount > 0) {
      breakdown.compound++;
    } else {
      breakdown.simple++;
    }
  });
  
  return breakdown;
}

/**
 * Calculate sentence variety (1-5 scale)
 */
function calculateSentenceVariety(breakdown: any): number {
  const total = Object.values(breakdown).reduce((sum: number, count: any) => sum + count, 0);
  if (total === 0) return 1;
  
  const types = Object.values(breakdown).filter((count: any) => count > 0).length;
  
  // Award points for variety
  let variety = 1;
  if (types >= 2) variety++; // Has at least 2 types
  if (types >= 3) variety++; // Has at least 3 types
  if (breakdown.complex > 0) variety++; // Uses complex sentences
  if (breakdown.compoundComplex > 0) variety++; // Uses compound-complex sentences
  
  return Math.min(5, variety);
}

/**
 * Calculate complexity score (0-100%)
 */
function calculateComplexityScore(breakdown: any, sentences: string[]): number {
  const total = Object.values(breakdown).reduce((sum: number, count: any) => sum + (count as number), 0);
  if (total === 0) return 0;
  
  // Weight different sentence types
  const complexityWeight = {
    simple: 0,
    compound: 25,
    complex: 75,
    compoundComplex: 100
  };
  
  let weightedSum = 0;
  Object.entries(breakdown).forEach(([type, count]: [string, any]) => {
    weightedSum += (count as number) * (complexityWeight[type as keyof typeof complexityWeight] || 0);
  });
  
  const baseComplexity = weightedSum / (total as number);
  
  // Bonus for embedded clauses and modifiers
  const avgSentenceLength = sentences.reduce((sum, s) => sum + s.split(' ').length, 0) / sentences.length;
  const lengthBonus = avgSentenceLength > 12 ? 15 : avgSentenceLength > 8 ? 10 : 0;
  
  return Math.min(100, baseComplexity + lengthBonus);
}

/**
 * Calculate subordination usage (0-100%)
 */
function calculateSubordinationUsage(transcript: string): number {
  const text = transcript.toLowerCase();
  const sentences = splitIntoSentences(transcript);
  
  if (sentences.length === 0) return 0;
  
  // Count subordinating elements
  const subordinators = ['because', 'since', 'although', 'while', 'if', 'when', 'that', 'which', 'who', 'whom', 'whose'];
  let subordinationCount = 0;
  
  subordinators.forEach(sub => {
    const matches = text.match(new RegExp(`\\b${sub}\\b`, 'g'));
    if (matches) subordinationCount += matches.length;
  });
  
  // Calculate percentage of sentences with subordination
  const sentencesWithSubordination = sentences.filter(sentence => {
    const lowerSentence = sentence.toLowerCase();
    return subordinators.some(sub => lowerSentence.includes(sub));
  }).length;
  
  return (sentencesWithSubordination / sentences.length) * 100;
}

/**
 * Calculate syntax error density (simplified)
 */
function calculateSyntaxErrorDensity(transcript: string): number {
  const words = transcript.split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;
  
  if (wordCount === 0) return 0;
  
  // Simple syntax error patterns
  const errorPatterns = [
    /\bhe go\b|\bshe go\b|\bit go\b/g, // Subject-verb agreement
    /\bmore better\b|\bmore easier\b/g, // Double comparatives
    /\bI am agree\b|\bI am disagree\b/g, // State verb errors
    /\bvery much\s+\w+\b/g, // Word order errors
    /\bthan\s+me\b/g // Pronoun case errors (simplified)
  ];
  
  let errorCount = 0;
  errorPatterns.forEach(pattern => {
    const matches = transcript.toLowerCase().match(pattern);
    if (matches) errorCount += matches.length;
  });
  
  return (errorCount / wordCount) * 100;
}

/**
 * Determine band score from syntax profile
 */
function getBandFromSyntaxProfile(
  sentenceVariety: number,
  complexityScore: number,
  subordinationUsage: number,
  errorDensity: number
): number {
  
  // Sophisticated variation with control → Band 9
  if (sentenceVariety >= 4 && complexityScore > 80 && subordinationUsage > 60 && errorDensity < 1) {
    return 9.0;
  }
  
  // Frequent complex & embedded clauses → Band 7–8
  if (sentenceVariety >= 3 && complexityScore > 60 && subordinationUsage > 40) {
    return errorDensity < 2 ? 8.0 : 7.5;
  }
  
  // Mix of compound & basic complex → Band 6
  if (sentenceVariety >= 2 && complexityScore > 30) {
    return errorDensity < 4 ? 6.5 : 6.0;
  }
  
  // All simple sentences → Band 4–5
  return sentenceVariety > 1 ? 5.0 : 4.5;
}

/**
 * Create justification text for syntax score
 */
function createSyntaxJustification(
  sentenceVariety: number,
  complexityScore: number,
  subordinationUsage: number,
  errorDensity: number
): string {
  const varietyLevel = sentenceVariety >= 4 ? 'excellent' : sentenceVariety >= 3 ? 'good' : sentenceVariety >= 2 ? 'basic' : 'limited';
  const complexityLevel = complexityScore > 70 ? 'high' : complexityScore > 40 ? 'moderate' : 'low';
  const errorLevel = errorDensity < 2 ? 'accurate' : errorDensity < 4 ? 'mostly accurate' : 'some errors';
  
  return `${varietyLevel} variety, ${complexityLevel} complexity, ${errorLevel}`;
}

/**
 * Create empty syntax analysis for invalid input
 */
function createEmptySyntaxAnalysis(): SyntaxAnalysis {
  return {
    sentenceVariety: 1,
    complexityScore: 0,
    subordinationUsage: 0,
    errorDensity: 0,
    bandScore: 4.0,
    fallbackUsed: true,
    bandJustification: 'insufficient content',
    sentenceBreakdown: {
      simple: 0,
      compound: 0,
      complex: 0,
      compoundComplex: 0
    }
  };
}