
import { Rubric } from './types';

// Default IELTS rubric as fallback
export const defaultRubric: Rubric = {
  name: "IELTS Speaking Assessment Rubric",
  version: "1.0.0",
  mapping: {
    ielts_to_cefr: {
      "9": "C2",
      "8": "C1+",
      "7": "C1",
      "6": "B2",
      "5": "B1",
      "4": "A2",
      "3": "A1",
      "2": "Pre-A1",
      "1": "Below Pre-A1",
      "0": "N/A"
    }
  },
  criteria: {
    "Fluency and Coherence": {
      "9": "Effortless speech, natural cohesion, advanced discourse markers, rare self-correction.",
      "8": "Very fluent, rare hesitation, flexible discourse use, quick self-correction.",
      "7": "Fluent with minor hesitation, organized speech, occasional breakdowns.",
      "6": "Some hesitation, extended turns, basic cohesive devices.",
      "5": "Frequent pauses, limited discourse control, self-correction needed.",
      "4": "Noticeable pauses, repetitious connectives, frequent coherence issues.",
      "3": "Long pauses, minimal connected speech, basic message fails.",
      "2": "Isolated words, poor cohesion, no flow.",
      "1": "No coherence, unintelligible.",
      "0": "No speech or no attempt."
    },
    "Lexical Resource": {
      "9": "Full flexibility and precision, idiomatic control, accurate paraphrasing.",
      "8": "Wide range, natural collocations, rare hesitation.",
      "7": "Varied vocab with some inaccuracy, attempts paraphrasing.",
      "6": "Sufficient for topics, occasional misusage, limited paraphrasing.",
      "5": "Basic vocab, repetitive, lacks flexibility.",
      "4": "Very limited vocab, errors in word choice, no paraphrasing.",
      "3": "Personal/basic vocab only, insufficient for unfamiliar topics.",
      "2": "Memorized or isolated words.",
      "1": "Few recognizable words.",
      "0": "No meaningful language."
    },
    "Grammatical Range and Accuracy": {
      "9": "Complex structures used precisely and accurately at all times.",
      "8": "Wide range, mostly accurate, minor slips.",
      "7": "Good mix of forms, some persistent errors.",
      "6": "Mix of simple/complex, errors noticeable but not obstructive.",
      "5": "Basic forms, frequent grammatical errors.",
      "4": "Some short accurate utterances, frequent structural errors.",
      "3": "Frequent errors except memorized phrases.",
      "2": "No evidence of basic sentence structure.",
      "1": "Unrateable grammar.",
      "0": "No attempt."
    },
    "Pronunciation": {
      "9": "Native-like delivery, intonation, rhythm, stress accurate.",
      "8": "Clear speech, rare mispronunciations, natural intonation.",
      "7": "Generally clear with minor lapses, effective rhythm.",
      "6": "Mostly intelligible, minor control of stress/intonation.",
      "5": "Mostly understandable, mispronunciations do not impede meaning.",
      "4": "Frequent rhythm/stress problems, listener effort needed.",
      "3": "Partial intelligibility, regular mispronunciations.",
      "2": "Mainly unintelligible speech.",
      "1": "Isolated phonemes or words, unintelligible.",
      "0": "No speech or completely unintelligible."
    }
  }
};

/**
 * Load a rubric from a URL
 */
export const loadRubricFromURL = async (url: string): Promise<Rubric> => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Failed to load rubric from ${url}: ${response.statusText}`);
      return defaultRubric;
    }
    const data = await response.json();
    return validateRubric(data) ? data : defaultRubric;
  } catch (error) {
    console.error(`Error loading rubric from ${url}:`, error);
    return defaultRubric;
  }
};

/**
 * Validate that the loaded data matches the expected rubric format
 */
const validateRubric = (data: any): data is Rubric => {
  if (!data || typeof data !== 'object') return false;
  if (!data.mapping || !data.criteria) return false;
  if (!data.mapping.ielts_to_cefr || typeof data.mapping.ielts_to_cefr !== 'object') return false;
  
  // Check that required criteria exist
  const requiredCriteria = [
    "Fluency and Coherence", 
    "Lexical Resource", 
    "Grammatical Range and Accuracy", 
    "Pronunciation"
  ];
  
  for (const criterion of requiredCriteria) {
    if (!data.criteria[criterion] || typeof data.criteria[criterion] !== 'object') {
      return false;
    }
  }
  
  return true;
};

/**
 * Get the rubric from local storage or load the default
 */
export const getRubric = async (
  rubricURL?: string
): Promise<Rubric> => {
  // Try to load from URL if provided
  if (rubricURL) {
    try {
      return await loadRubricFromURL(rubricURL);
    } catch (error) {
      console.error('Error loading rubric from URL:', error);
    }
  }
  
  // If URL not provided or loading failed, use default
  return defaultRubric;
};
