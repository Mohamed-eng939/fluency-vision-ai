
/**
 * Grammar Feature Detector Functions
 * Functions to detect various grammar features in text
 */

/**
 * Detect present simple
 */
export const detectPresentSimple = (text: string): boolean => {
  return /\b(I|you|we|they) ([a-z]+)(?!(ed|ing))\b|he|she|it ([a-z]+)s\b/i.test(text);
};

/**
 * Detect basic conjunctions
 */
export const detectBasicConjunctions = (text: string): boolean => {
  return /\b(and|but|or)\b/i.test(text);
};

/**
 * Detect past simple
 */
export const detectPastSimple = (text: string): boolean => {
  return /\b\w+ed\b|\b(went|saw|had|was|were|did|made|took|came|knew|got)\b/i.test(text);
};

/**
 * Detect comparatives
 */
export const detectComparatives = (text: string): boolean => {
  return /\b(\w+er|more \w+) than\b/i.test(text);
};

/**
 * Detect adverbs of frequency
 */
export const detectAdverbsOfFrequency = (text: string): boolean => {
  return /\b(always|usually|often|sometimes|rarely|never)\b/i.test(text);
};

/**
 * Detect basic modals
 */
export const detectBasicModals = (text: string): boolean => {
  return /\b(can|must|should)\b/i.test(text);
};

/**
 * Detect present perfect
 */
export const detectPresentPerfect = (text: string): boolean => {
  return /\b(have|has) \w+ed\b|\b(have|has) (been|gone|done|seen|had)\b/i.test(text);
};

/**
 * Detect advanced modals
 */
export const detectAdvancedModals = (text: string): boolean => {
  return /\b(might|could|would|may)\b/i.test(text);
};

/**
 * Detect relative clauses
 */
export const detectRelativeClauses = (text: string): boolean => {
  return /\b(who|which|that|whom|whose)\b/i.test(text);
};

/**
 * Detect first conditional
 */
export const detectFirstConditional = (text: string): boolean => {
  return /\bif .+ (will|won't|going to|won't)\b/i.test(text);
};

/**
 * Detect past perfect
 */
export const detectPastPerfect = (text: string): boolean => {
  return /\bhad \w+ed\b|\bhad (been|gone|done|seen)\b/i.test(text);
};

/**
 * Detect passive voice
 */
export const detectPassiveVoice = (text: string): boolean => {
  return /\b(is|are|was|were|be|been|being) (\w+ed)\b/i.test(text);
};

/**
 * Detect second conditional
 */
export const detectSecondConditional = (text: string): boolean => {
  return /\bif .+ (would|wouldn't)\b/i.test(text);
};

/**
 * Detect reported speech
 */
export const detectReportedSpeech = (text: string): boolean => {
  return /\b(said|told|asked|explained) that\b/i.test(text);
};

/**
 * Detect mixed conditional
 */
export const detectMixedConditional = (text: string): boolean => {
  return /\bif .+ had\b.*\bwould\b/i.test(text) || 
         /\bwould have\b.*\bif\b/i.test(text);
};

/**
 * Detect advanced modals with perfect
 */
export const detectAdvancedModalsWithPerfect = (text: string): boolean => {
  return /\b(should|might|could|would|must) have\b/i.test(text);
};

/**
 * Detect inversion
 */
export const detectInversion = (text: string): boolean => {
  return /\b(had|were|should) \w+ \b/i.test(text) || 
         /\b(not only|never|rarely|seldom) .+ (do|did|have|has|had)\b/i.test(text);
};

/**
 * Detect fronting
 */
export const detectFronting = (text: string): boolean => {
  return /\b(such|so) .+ that\b/i.test(text);
};

/**
 * Detect cleft sentence
 */
export const detectCleftSentence = (text: string): boolean => {
  return /\bit (is|was) .+ (that|who|which)\b/i.test(text);
};

/**
 * Detect ellipsis
 */
export const detectEllipsis = (text: string): boolean => {
  return /, (if|when) \w+[^.]*/i.test(text);
};

/**
 * Detect idiomatic structures
 */
export const detectIdiomaticStructures = (text: string): boolean => {
  return /\b(let alone|as it were|so to speak|as if|as though)\b/i.test(text);
};
