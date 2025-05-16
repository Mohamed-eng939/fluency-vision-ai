
import { SyntaxComplexity } from "../../../types/assessment";
import { countPattern } from "./patternAnalysis";

/**
 * Detect if SVO structure is present in appropriate ratio from complexity metrics
 */
export const detectSVOStructure = (complexity: SyntaxComplexity): boolean => {
  // We don't have direct access to SVO analysis in the complexity object
  // So we'll use sentence length and complexity as a proxy
  return complexity.averageSentenceLength >= 5 && 
         complexity.complexSentenceRatio >= 0.4;
};

/**
 * Analyze SVO (Subject-Verb-Object) structure in sentences
 * Returns the ratio of sentences with valid SVO structure
 */
export const analyzeSVOStructure = (sentences: string[]): number => {
  if (sentences.length === 0) return 0;
  
  let validSVOCount = 0;
  
  sentences.forEach(sentence => {
    // Simple SVO detection - check for subject-verb pattern
    // This is simplified - a real implementation would use NLP parsing
    
    // Check if sentence starts with a pronoun or noun followed by a verb
    if (/^(I|you|he|she|it|we|they|the|a|an|this|that|these|those|my|your|his|her|its|our|their|\w+)\s+\w+s?\b/i.test(sentence.trim())) {
      validSVOCount++;
    }
  });
  
  return validSVOCount / sentences.length;
};

/**
 * Basic count of potential grammatical issues
 * This is a simplified approach for the error density estimation
 */
export const countGrammaticalIssues = (text: string): number => {
  let issueCount = 0;
  
  // Agreement errors
  issueCount += countPattern(text, /\b(they|we|you) (is|was)\b|\b(he|she|it) (are|were)\b/gi);
  
  // Article errors
  issueCount += countPattern(text, /\b(a) ([aeiou]\w+)\b|\b(an) ([^aeiou]\w+)\b/gi);
  
  // Auxiliary errors
  issueCount += countPattern(text, /\b(didn't|did not) (\w+ed)\b|\b(don't|do not) ([^the\s]\w+s)\b/gi);
  
  // Preposition errors (simplified)
  issueCount += countPattern(text, /\b(arrive|go) (in|on|with) /gi);
  
  // Verb form errors
  issueCount += countPattern(text, /\b(has|have) [a-z]+ |is [a-z]+ing/gi);
  
  return issueCount;
};
