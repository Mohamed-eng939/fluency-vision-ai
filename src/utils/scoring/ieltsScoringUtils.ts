
/**
 * IELTS to CEFR Scoring Logic for Speaking Assessments
 */

// Define types for IELTS bands and criteria
export type IELTSBand = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export type IELTSCriterion = 'Fluency and Coherence' | 'Lexical Resource' | 'Grammatical Range and Accuracy' | 'Pronunciation';

// IELTS to CEFR mapping
const IELTS_TO_CEFR_MAP: Record<number, string> = {
  9: "C2",
  8: "C1+",
  7: "C1",
  6: "B2",
  5: "B1",
  4: "A2",
  3: "A1",
  2: "Pre-A1",
  1: "Below Pre-A1",
  0: "N/A"
};

// IELTS to 5-point scale mapping
const IELTS_TO_5POINT_MAP = (band: number): number => {
  if (band >= 8) return 5;
  if (band >= 7) return 4;
  if (band >= 6) return 3;
  if (band >= 5) return 2;
  return 1;
};

// Band descriptors for each criterion
export const IELTS_BAND_DESCRIPTORS = {
  "Fluency and Coherence": {
    9: "Effortless speech, natural cohesion, advanced discourse markers, rare self-correction.",
    8: "Very fluent, rare hesitation, flexible discourse use, quick self-correction.",
    7: "Fluent with minor hesitation, organized speech, occasional breakdowns.",
    6: "Some hesitation, extended turns, basic cohesive devices.",
    5: "Frequent pauses, limited discourse control, self-correction needed.",
    4: "Noticeable pauses, repetitious connectives, frequent coherence issues.",
    3: "Long pauses, minimal connected speech, basic message fails.",
    2: "Isolated words, poor cohesion, no flow.",
    1: "No coherence, unintelligible.",
    0: "No speech or no attempt."
  },
  "Lexical Resource": {
    9: "Full flexibility and precision, idiomatic control, accurate paraphrasing.",
    8: "Wide range, natural collocations, rare hesitation.",
    7: "Varied vocab with some inaccuracy, attempts paraphrasing.",
    6: "Sufficient for topics, occasional misusage, limited paraphrasing.",
    5: "Basic vocab, repetitive, lacks flexibility.",
    4: "Very limited vocab, errors in word choice, no paraphrasing.",
    3: "Personal/basic vocab only, insufficient for unfamiliar topics.",
    2: "Memorized or isolated words.",
    1: "Few recognizable words.",
    0: "No meaningful language."
  },
  "Grammatical Range and Accuracy": {
    9: "Complex structures used precisely and accurately at all times.",
    8: "Wide range, mostly accurate, minor slips.",
    7: "Good mix of forms, some persistent errors.",
    6: "Mix of simple/complex, errors noticeable but not obstructive.",
    5: "Basic forms, frequent grammatical errors.",
    4: "Some short accurate utterances, frequent structural errors.",
    3: "Frequent errors except memorized phrases.",
    2: "No evidence of basic sentence structure.",
    1: "Unrateable grammar.",
    0: "No attempt."
  },
  "Pronunciation": {
    9: "Native-like delivery, intonation, rhythm, stress accurate.",
    8: "Clear speech, rare mispronunciations, natural intonation.",
    7: "Generally clear with minor lapses, effective rhythm.",
    6: "Mostly intelligible, minor control of stress/intonation.",
    5: "Mostly understandable, mispronunciations do not impede meaning.",
    4: "Frequent rhythm/stress problems, listener effort needed.",
    3: "Partial intelligibility, regular mispronunciations.",
    2: "Mainly unintelligible speech.",
    1: "Isolated phonemes or words, unintelligible.",
    0: "No speech or completely unintelligible."
  }
} as const;

/**
 * Calculate the IELTS band score for a speaking assessment
 * @param transcript The transcript of the speaking response
 * @param audioFeatures Optional audio features extracted from the recording
 * @returns Object with scores for each criterion, total band and CEFR level
 */
export const calculateIELTSSpeakingScore = (
  transcript: string,
  audioFeatures?: {
    speechRate?: number;
    pauseCount?: number;
    fillerWordCount?: number;
    pronunciationErrors?: number;
  }
) => {
  // Default audio features if not provided
  const features = audioFeatures || {
    speechRate: 0,
    pauseCount: 0,
    fillerWordCount: 0,
    pronunciationErrors: 0
  };
  
  // Calculate individual criterion scores
  const fluencyScore = calculateFluencyScore(transcript, features);
  const lexicalScore = calculateLexicalScore(transcript);
  const grammarScore = calculateGrammarScore(transcript);
  const pronunciationScore = calculatePronunciationScore(transcript, features);
  
  // Calculate the total band score (average of the four criteria)
  const totalScoreRaw = (fluencyScore + lexicalScore + grammarScore + pronunciationScore) / 4;
  
  // Round to nearest 0.5 as per IELTS convention
  const totalBand = Math.round(totalScoreRaw * 2) / 2;
  
  // Map to CEFR level
  const cefrLevel = mapIELTStoCEFR(totalBand);
  
  return {
    "Fluency and Coherence": fluencyScore,
    "Lexical Resource": lexicalScore,
    "Grammatical Range and Accuracy": grammarScore,
    "Pronunciation": pronunciationScore,
    "Total_Band": totalBand,
    "CEFR_Level": cefrLevel
  };
};

/**
 * Map IELTS band score to CEFR level
 */
export const mapIELTStoCEFR = (band: number): string => {
  // Round down to get the integer part
  const integerBand = Math.floor(band);
  return IELTS_TO_CEFR_MAP[integerBand] || "N/A";
};

/**
 * Map IELTS band to 5-point scale
 */
export const mapIELTSto5Point = (band: number): number => {
  return IELTS_TO_5POINT_MAP(band);
};

/**
 * Calculate Fluency and Coherence score
 */
const calculateFluencyScore = (
  transcript: string,
  features: { speechRate?: number; pauseCount?: number; fillerWordCount?: number }
): IELTSBand => {
  // Extract basic metrics from transcript
  const words = transcript.split(/\s+/);
  const wordCount = words.length;
  
  // Calculate speech rate (words per minute) if not provided
  const speechRate = features.speechRate || wordCount / 3; // Assuming a 3-minute speaking task
  
  // Count discourse markers
  const discourseMarkers = [
    'first', 'firstly', 'second', 'secondly', 'third', 'thirdly', 'finally', 
    'moreover', 'furthermore', 'in addition', 'however', 'nevertheless', 'therefore',
    'thus', 'consequently', 'in conclusion', 'to summarize', 'for example',
    'such as', 'in other words', 'on the other hand', 'similarly', 'in contrast'
  ];
  
  const markerCount = discourseMarkers.reduce((count, marker) => 
    count + (transcript.toLowerCase().match(new RegExp(`\\b${marker}\\b`, 'g'))?.length || 0), 0);
  
  // Calculate filler word usage
  const fillerWords = ['um', 'uh', 'like', 'you know', 'well', 'so', 'actually'];
  const fillerCount = features.fillerWordCount || fillerWords.reduce((count, filler) => 
    count + (transcript.toLowerCase().match(new RegExp(`\\b${filler}\\b`, 'g'))?.length || 0), 0);
  
  // Pause count (if not provided, estimate from transcript)
  const pauseCount = features.pauseCount || (transcript.match(/[.?!…,;:]/g)?.length || 0);
  
  // Calculate fluency metrics
  const fillerRatio = wordCount > 0 ? fillerCount / wordCount : 0;
  const markerRatio = wordCount > 0 ? markerCount / wordCount : 0;
  const cohesionLevel = markerRatio * 10; // Scale from 0-1
  
  // Determine base score
  let score: IELTSBand = 5; // Start with middle band
  
  // Apply scoring logic
  if (wordCount < 10) {
    score = 1; // Very minimal response
  } else if (wordCount < 30) {
    score = 2; // Extremely limited response
  } else if (wordCount < 50) {
    score = 3; // Very limited response
  } else {
    // Adjust for speech rate and fluency
    if (speechRate > 150) score += 1;
    if (speechRate > 180) score += 1;
    if (speechRate < 100) score -= 1;
    if (speechRate < 70) score -= 1;
    
    // Adjust for filler word usage
    if (fillerRatio < 0.02) score += 1;
    if (fillerRatio > 0.05) score -= 1;
    if (fillerRatio > 0.1) score -= 2;
    
    // Adjust for discourse markers and cohesion
    if (cohesionLevel > 0.4) score += 1;
    if (cohesionLevel > 0.7) score += 1;
    if (cohesionLevel < 0.2) score -= 1;
  }
  
  // Ensure score is between 0-9
  return Math.max(0, Math.min(9, score)) as IELTSBand;
};

/**
 * Calculate Lexical Resource score
 */
const calculateLexicalScore = (transcript: string): IELTSBand => {
  const text = transcript.toLowerCase();
  const words = text.split(/\s+/);
  const wordCount = words.length;
  
  if (wordCount < 10) return 1; // Minimal vocabulary
  
  const uniqueWords = new Set(words.map(w => w.toLowerCase()));
  const lexicalDiversity = uniqueWords.size / wordCount; // Type-token ratio
  
  // Academic and advanced vocabulary lists
  const advancedWords = [
    'analyze', 'assessment', 'complex', 'concept', 'considerable', 'context', 
    'crucial', 'demonstrate', 'determine', 'emphasize', 'establish', 'evaluate', 
    'evident', 'expand', 'fundamental', 'generate', 'highlight', 'implement', 
    'imply', 'indicate', 'individual', 'interpret', 'involve', 'justify', 
    'maintain', 'method', 'negative', 'obtain', 'participate', 'potential', 
    'previous', 'primary', 'process', 'range', 'require', 'research', 
    'significant', 'similar', 'specific', 'strategy', 'structure', 'theory',
    'therefore', 'traditional', 'whereas', 'utilize'
  ];
  
  const idioms = [
    'a piece of cake', 'break a leg', 'cost an arm and a leg', 'hit the books',
    'get your act together', 'once in a blue moon', 'push your luck',
    'under the weather', 'wrap your head around', 'back to square one'
  ];
  
  const collocations = [
    'heavy rain', 'strong coffee', 'take a break', 'pay attention',
    'make an effort', 'draw a conclusion', 'catch a cold', 'meet the deadline',
    'conduct research', 'raise awareness'
  ];
  
  // Calculate advanced vocabulary usage
  const advancedWordCount = words.filter(w => advancedWords.includes(w)).length;
  const advancedRatio = wordCount > 0 ? advancedWordCount / wordCount : 0;
  
  // Check for idioms and collocations
  let idiomCount = 0;
  let collocationCount = 0;
  
  idioms.forEach(idiom => {
    if (text.includes(idiom)) idiomCount++;
  });
  
  collocations.forEach(collocation => {
    if (text.includes(collocation)) collocationCount++;
  });
  
  // Calculate average word length
  const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / wordCount;
  
  // Base score calculation
  let score: IELTSBand = 5; // Start with middle band
  
  // Apply scoring adjustments
  if (lexicalDiversity > 0.7) score += 1;
  if (lexicalDiversity > 0.8) score += 1;
  if (lexicalDiversity < 0.5) score -= 1;
  if (lexicalDiversity < 0.4) score -= 1;
  
  if (advancedRatio > 0.1) score += 1;
  if (advancedRatio > 0.15) score += 1;
  if (advancedRatio < 0.05) score -= 1;
  
  if (idiomCount >= 2) score += 1;
  if (collocationCount >= 3) score += 1;
  
  if (avgWordLength > 5) score += 1;
  if (avgWordLength < 4) score -= 1;
  
  // Ensure score is between 0-9
  return Math.max(0, Math.min(9, score)) as IELTSBand;
};

/**
 * Calculate Grammatical Range and Accuracy score
 */
const calculateGrammarScore = (transcript: string): IELTSBand => {
  const text = transcript.toLowerCase();
  
  // Simple sentence pattern
  const simplePatterns = [
    /\b(i|we|they|he|she|it)\s+(am|is|are|was|were|have|has|had)\b/i,
    /\b(i|we|they|he|she|it)\s+(go|goes|went|like|likes|liked)\b/i
  ];
  
  // Complex sentence structures
  const complexPatterns = [
    /\bif\b.+\bwould\b/i, 
    /\b(although|though)\b/i,
    /\bhad been\b/i,
    /\bwould have\b/i,
    /\bcould have\b/i,
    /\bmight have\b/i,
    /\bshould have\b/i,
    /\bnot only.+but also\b/i,
    /\bdespite\b/i,
    /\bnevertheless\b/i,
    /\bwhereas\b/i,
    /\bin spite of\b/i,
    /\bin order to\b/i
  ];
  
  // Common grammatical errors
  const errorPatterns = [
    /\b(he|she|it)\s+have\b/i,
    /\b(they|we|you)\s+has\b/i,
    /\b(i|we|you|they)\s+is\b/i,
    /\b(he|she|it)\s+are\b/i,
    /\bthe\s+[aeiou]/i, // Incorrect article usage
    /\ba\s+[aeiou]/i, // Incorrect article usage
    /\b(go|come|eat|drink|speak)\s+to\s+the\b/i // Incorrect preposition
  ];
  
  // Count pattern matches
  const simpleCount = simplePatterns.filter(pattern => pattern.test(text)).length;
  const complexCount = complexPatterns.filter(pattern => pattern.test(text)).length;
  const errorCount = errorPatterns.filter(pattern => pattern.test(text)).length;
  
  // Sentences count
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const sentenceCount = sentences.length;
  
  // Base score calculation
  let score: IELTSBand = 5; // Start with middle band
  
  // No real sentences formed
  if (sentenceCount < 3) {
    return 2;
  }
  
  // Apply scoring adjustments
  if (complexCount > 5) score += 1;
  if (complexCount > 8) score += 1;
  if (complexCount > 12) score += 1;
  
  // Adjust for grammatical errors
  const errorRatio = sentenceCount > 0 ? errorCount / sentenceCount : 0;
  if (errorRatio < 0.1) score += 1;
  if (errorRatio < 0.05) score += 1;
  if (errorRatio > 0.2) score -= 1;
  if (errorRatio > 0.3) score -= 2;
  
  // Sentence complexity ratio
  const complexityRatio = sentenceCount > 0 ? complexCount / sentenceCount : 0;
  if (complexityRatio > 0.7) score += 1;
  if (complexityRatio < 0.3) score -= 1;
  
  // Ensure score is between 0-9
  return Math.max(0, Math.min(9, score)) as IELTSBand;
};

/**
 * Calculate Pronunciation score
 */
const calculatePronunciationScore = (
  transcript: string, 
  features: { pronunciationErrors?: number }
): IELTSBand => {
  // In a real-world scenario, this would use audio analysis
  // For this implementation, we'll base it mostly on transcript length and errors
  
  const words = transcript.split(/\s+/);
  const wordCount = words.length;
  
  if (wordCount < 10) {
    return 1; // Too little to assess pronunciation
  }
  
  // Start with middle score
  let score: IELTSBand = 5;
  
  // If we have pronunciation errors from audio analysis, use them
  if (features.pronunciationErrors !== undefined) {
    const errorRatio = wordCount > 0 ? features.pronunciationErrors / wordCount : 0;
    
    if (errorRatio < 0.05) score += 2;
    else if (errorRatio < 0.1) score += 1;
    else if (errorRatio > 0.2) score -= 1;
    else if (errorRatio > 0.3) score -= 2;
  } else {
    // Without audio analysis, make educated guess based on transcript length
    // This is a fallback and should be replaced with real audio analysis
    if (wordCount > 150) score += 1; // Longer responses suggest better pronunciation confidence
    if (wordCount > 200) score += 1;
  }
  
  // Ensure score is between 0-9
  return Math.max(0, Math.min(9, score)) as IELTSBand;
};
