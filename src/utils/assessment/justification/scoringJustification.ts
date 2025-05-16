/**
 * Scoring Justification
 * Functions for building justification text for grammar and syntax scoring
 */
import { CEFRFeatureLevel } from '../rubrics/cefrTypes';

/**
 * Build justification for grammar scoring
 */
export const buildGrammarJustification = (transcript: string, score: number, level: CEFRFeatureLevel): string => {
  // Import needed functions to detect grammatical features
  const { detectGrammaticalFeatures } = require('../grammar/grammarFeatureDetection');
  
  // Extract the features we observed
  const features = detectGrammaticalFeatures(transcript);
  
  // Build a list of observed features for the justification
  const observedFeatures: string[] = [];
  
  // A1-A2 features
  if (features.hasPresentSimple) observedFeatures.push("present simple");
  if (features.hasPastSimple) observedFeatures.push("past simple");
  if (features.hasBasicModals) observedFeatures.push("basic modals");
  
  // B1-B2 features
  if (features.hasPresentPerfect) observedFeatures.push("present perfect");
  if (features.hasAdvancedModals) observedFeatures.push("modal verbs");
  if (features.hasRelativeClauses) observedFeatures.push("relative clauses");
  if (features.hasPassiveVoice) observedFeatures.push("passive voice");
  if (features.hasSecondConditional) observedFeatures.push("conditional forms");
  
  // C1-C2 features
  if (features.hasMixedConditional) observedFeatures.push("mixed conditionals");
  if (features.hasAdvancedModalsWithPerfect) observedFeatures.push("perfect modal forms");
  if (features.hasInversion) observedFeatures.push("inversion");
  if (features.hasCleftSentence) observedFeatures.push("cleft sentences");
  
  // Add error information
  let errorComment = "";
  if (features.errorDensity > 0.25) {
    errorComment = "Errors frequently occur and sometimes interfere with meaning.";
  } else if (features.errorDensity > 0.1) {
    errorComment = "Some errors occur but rarely interfere with meaning.";
  } else {
    errorComment = "Few grammatical errors.";
  }
  
  // Build the justification text
  return `CEFR ${level} (${score.toFixed(1)}/10): Grammar reflects ${level} level control. 
Features: ${observedFeatures.join(', ') || "Basic structures only"}. 
${errorComment}`;
};

/**
 * Build justification for syntax scoring
 */
export const buildSyntaxJustification = (transcript: string, score: number, level: CEFRFeatureLevel): string => {
  // Import needed functions to detect syntactic features
  const { detectSyntacticFeatures } = require('../syntax/syntaxFeatureDetection');
  
  // Extract the features we observed
  const features = detectSyntacticFeatures(transcript);
  
  // Build a list of observed features for the justification
  const observedFeatures: string[] = [];
  
  // A1-A2 features
  if (features.hasSimpleCoordination) observedFeatures.push("simple coordination");
  if (features.hasBasicSubordination) observedFeatures.push("basic subordination");
  
  // B1-B2 features
  if (features.hasSubordination) observedFeatures.push("subordination");
  if (features.hasRelativeClauses) observedFeatures.push("relative clauses");
  if (features.hasAdvancedSubordination) observedFeatures.push("advanced subordination");
  if (features.hasPassiveVoice) observedFeatures.push("passive constructions");
  
  // C1-C2 features
  if (features.hasEmbeddedClauses) observedFeatures.push("embedded clauses");
  if (features.hasNonFiniteConstructs) observedFeatures.push("non-finite constructions");
  if (features.hasInversion) observedFeatures.push("inversion");
  if (features.hasCleftSentences) observedFeatures.push("cleft sentences");
  
  // Build the justification text
  return `CEFR ${level} (${score.toFixed(1)}/10): Syntax complexity reflects ${level} level. 
Features: ${observedFeatures.join(', ') || "Simple sentence structures only"}. 
Average sentence length: ${features.avgSentenceLength.toFixed(1)} words.
${features.repeatedBeginnings > 2 ? "Repeated sentence beginnings observed." : "Good variety in sentence structure."}
${features.svoRatio < 0.6 ? "Limited use of complete sentence structures." : "Good use of complete sentence structures."}`;
};
