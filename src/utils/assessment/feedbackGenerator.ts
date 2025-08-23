import { AssessmentMetrics, CEFRLevel, AudioAnalysisResult } from '@/types/assessment';
import { supabase } from '@/integrations/supabase/client';

export interface ResponseFeedback {
  fluency: string;
  grammar: string;
  vocabulary: string;
  coherence: string;
  pronunciation: string;
  prosody: string;
  syntax: string;
  overall: string;
}

export interface SkillDescriptor {
  skill: string;
  score: number;
  descriptor: string;
  bandFeedback: string;
}

/**
 * Generate evidence-based feedback that cites specific elements from the response
 * This replaces AI-generated feedback with deterministic, rubric-based assessment
 */
export const generateResponseFeedback = async (
  metrics: AssessmentMetrics,
  transcript: string = "",
  cefrLevel: CEFRLevel = "B1",
  audioAnalysis?: AudioAnalysisResult,
  promptText?: string
): Promise<ResponseFeedback> => {
  
  // Require minimum transcript length for reliable feedback
  const words = transcript.trim().split(/\s+/).filter(w => w.length > 0);
  if (words.length < 8) {
    return generateInsufficientDataFeedback(words.length);
  }
  
  try {
    // Try AI-powered feedback first, but with evidence requirements
    const { data, error } = await supabase.functions.invoke('personalized-feedback', {
      body: {
        transcript,
        metrics,
        audioAnalysis,
        promptText,
        cefrLevel,
        requireEvidence: true, // New flag for evidence-based feedback
        minCitations: 2 // Require at least 2 specific citations per skill
      }
    });

    if (error) {
      console.log('AI feedback unavailable, using evidence-based fallback:', error.message);
      return generateEvidenceBasedFallbackFeedback(metrics, cefrLevel, transcript);
    }

    if (data?.success && data?.feedback && validateFeedbackHasEvidence(data.feedback, transcript)) {
      return data.feedback;
    }

    console.log('AI feedback lacks required evidence, using rigorous fallback');
    return generateEvidenceBasedFallbackFeedback(metrics, cefrLevel, transcript);
  } catch (error) {
    console.log('Error with AI feedback, using evidence-based fallback:', error);
    return generateEvidenceBasedFallbackFeedback(metrics, cefrLevel, transcript);
  }
};

/**
 * Generate feedback for insufficient data cases
 */
const generateInsufficientDataFeedback = (wordCount: number): ResponseFeedback => {
  const baseMessage = `Response too short (${wordCount} words). Provide at least 8-10 words for reliable assessment.`;
  
  return {
    fluency: baseMessage + " Practice speaking in complete sentences.",
    grammar: baseMessage + " Focus on basic sentence structure.",
    vocabulary: baseMessage + " Use more varied vocabulary in your response.",
    coherence: baseMessage + " Organize ideas with connecting words.",
    pronunciation: baseMessage,
    prosody: baseMessage,
    syntax: baseMessage + " Form complete sentences.",
    overall: `Cannot assess: Response too short. Please provide a more detailed answer (minimum 8-10 words, current: ${wordCount}).`
  };
};

/**
 * Generate rigorous evidence-based fallback feedback that cites specific elements
 */
const generateEvidenceBasedFallbackFeedback = (
  metrics: AssessmentMetrics,
  cefrLevel: CEFRLevel,
  transcript: string
): ResponseFeedback => {
  
  // Analyze transcript for specific evidence
  const words = transcript.toLowerCase().split(/\s+/);
  const text = transcript.toLowerCase();
  
  // Grammar analysis with evidence
  let grammarFeedback = generateGrammarFeedback(metrics.grammar);
  if (text.match(/\b(he|she|it)\s+(are|were|have)\b/)) {
    grammarFeedback += ` Evidence: Found subject-verb disagreement (e.g., "he are").`;
  }
  if (text.match(/\b(if|would|could)\b/)) {
    grammarFeedback += ` Positive: Uses conditional structures.`;
  }
  
  // Vocabulary analysis with evidence
  let vocabularyFeedback = generateVocabularyFeedback(metrics.vocabulary);
  const basicWords = words.filter(w => ['good', 'bad', 'nice', 'big', 'small'].includes(w));
  if (basicWords.length > 0) {
    vocabularyFeedback += ` Evidence: Relies on basic words like "${basicWords.slice(0, 2).join(', ')}".`;
  }
  const advancedWords = words.filter(w => ['furthermore', 'consequently', 'nevertheless'].includes(w));
  if (advancedWords.length > 0) {
    vocabularyFeedback += ` Positive: Uses advanced vocabulary like "${advancedWords.join(', ')}".`;
  }
  
  // Coherence analysis with evidence
  let coherenceFeedback = generateCoherenceFeedback(metrics.coherence);
  const connectors = text.match(/\b(and|but|so|because|however)\b/g);
  if (connectors) {
    coherenceFeedback += ` Evidence: Uses connectors like "${connectors.slice(0, 2).join(', ')}".`;
  }
  
  return {
    fluency: generateFluentFeedback(metrics.fluency) + ` Response length: ${words.length} words.`,
    grammar: grammarFeedback,
    vocabulary: vocabularyFeedback,
    coherence: coherenceFeedback,
    pronunciation: generatePronunciationFeedback(metrics.pronunciation),
    prosody: generateProsodyFeedback(metrics.prosody),
    syntax: generateSyntaxFeedback(metrics.syntax),
    overall: generateOverallFeedback(metrics, cefrLevel)
  };
};

/**
 * Validate that AI feedback contains required evidence citations
 */
const validateFeedbackHasEvidence = (feedback: ResponseFeedback, transcript: string): boolean => {
  // Check if feedback contains specific quotes or references to the transcript
  const feedbackText = Object.values(feedback).join(' ').toLowerCase();
  const transcriptWords = transcript.toLowerCase().split(/\s+/);
  
  // Look for quoted text or specific references
  const hasQuotes = /["']([^"']{3,})["']/.test(feedbackText);
  const hasSpecificWords = transcriptWords.some(word => 
    word.length > 3 && feedbackText.includes(word)
  );
  const hasEvidence = feedbackText.includes('evidence:') || 
                      feedbackText.includes('shows') || 
                      feedbackText.includes('demonstrates');
  
  return hasQuotes || (hasSpecificWords && hasEvidence);
};

/**
 * Fallback feedback generation for when AI service is unavailable
 */
const generateFallbackFeedback = (
  metrics: AssessmentMetrics,
  cefrLevel: CEFRLevel
): ResponseFeedback => {
  return {
    fluency: generateFluentFeedback(metrics.fluency),
    grammar: generateGrammarFeedback(metrics.grammar),
    vocabulary: generateVocabularyFeedback(metrics.vocabulary),
    coherence: generateCoherenceFeedback(metrics.coherence),
    pronunciation: generatePronunciationFeedback(metrics.pronunciation),
    prosody: generateProsodyFeedback(metrics.prosody),
    syntax: generateSyntaxFeedback(metrics.syntax),
    overall: generateOverallFeedback(metrics, cefrLevel)
  };
};

/**
 * Simplified fallback feedback functions (used when AI is unavailable)
 */
const generateFluentFeedback = (score: number): string => {
  if (score < 3) {
    return "Practice speaking in complete sentences and try to reduce long pauses between words.";
  }
  if (score < 5) {
    return "Practice speaking in longer stretches without too many pauses or hesitations.";
  }
  if (score < 7) {
    return "Work on maintaining natural speaking rhythm and reducing unnecessary repetitions.";
  }
  if (score < 9) {
    return "Your fluency is developing well. Focus on smooth transitions between ideas.";
  }
  return "Excellent fluency with natural pace and minimal hesitation.";
};

const generateGrammarFeedback = (score: number): string => {
  if (score < 3) {
    return "Focus on basic sentence structure and subject-verb agreement.";
  }
  if (score < 5) {
    return "Watch out for verb tense consistency. Try reviewing past simple vs past continuous.";
  }
  if (score < 7) {
    return "Work on using more complex sentence structures with fewer repeated errors.";
  }
  if (score < 9) {
    return "Your grammar is quite good. Polish accuracy in conditional and passive structures.";
  }
  return "Excellent grammatical control with complex structures used accurately.";
};

const generateVocabularyFeedback = (score: number): string => {
  if (score < 3) {
    return "Learn everyday words related to common topics like family, work, and daily activities.";
  }
  if (score < 5) {
    return "Try expanding your vocabulary to include more descriptive or precise words.";
  }
  if (score < 7) {
    return "Increase your use of topic-specific and descriptive vocabulary beyond basic terms.";
  }
  if (score < 9) {
    return "Use more abstract or nuanced words and idiomatic expressions.";
  }
  return "Excellent vocabulary range with precise and sophisticated word choices.";
};

const generateCoherenceFeedback = (score: number): string => {
  if (score < 3) {
    return "Practice organizing simple ideas in logical order with basic connecting words.";
  }
  if (score < 5) {
    return "Try organizing your ideas more clearly using linking words like 'however', 'because', etc.";
  }
  if (score < 7) {
    return "Work on creating smoother connections between your main points and supporting details.";
  }
  if (score < 9) {
    return "Your ideas flow well. Focus on using more sophisticated discourse markers.";
  }
  return "Excellent coherence with sophisticated logical development and clear progression.";
};

/**
 * Generate pronunciation-specific feedback
 */
const generatePronunciationFeedback = (score: number): string => {
  if (score < 3) {
    return "Focus on clear articulation of basic sounds and word stress patterns.";
  }
  if (score < 5) {
    return "Work on consistent pronunciation and clearer consonant sounds.";
  }
  if (score < 7) {
    return "Continue practicing challenging sounds and word stress for better clarity.";
  }
  if (score < 9) {
    return "Your pronunciation is clear. Refine intonation patterns for more natural delivery.";
  }
  return "Excellent pronunciation with native-like clarity and natural intonation.";
};

/**
 * Generate prosody-specific feedback
 */
const generateProsodyFeedback = (score: number): string => {
  if (score < 3) {
    return "Practice basic rhythm and try to vary your tone to sound more natural.";
  }
  if (score < 5) {
    return "Work on natural sentence stress and intonation patterns in English.";
  }
  if (score < 7) {
    return "Continue developing natural rhythm and appropriate emphasis on key words.";
  }
  if (score < 9) {
    return "Your prosody is developing well. Focus on emotional expression through intonation.";
  }
  return "Excellent prosodic control with natural rhythm and expressive intonation.";
};

const generateSyntaxFeedback = (score: number): string => {
  if (score < 3) {
    return "Practice forming complete sentences with proper word order.";
  }
  if (score < 5) {
    return "Work on sentence structure variety and correct placement of adjectives and adverbs.";
  }
  if (score < 7) {
    return "Try using more complex sentence structures with subordinate clauses.";
  }
  if (score < 9) {
    return "Your sentence structure is good. Focus on sophisticated syntactic patterns.";
  }
  return "Excellent syntactic control with complex and varied sentence structures.";
};

/**
 * Generate overall encouraging feedback
 */
const generateOverallFeedback = (metrics: AssessmentMetrics, cefrLevel: CEFRLevel): string => {
  const avgScore = Object.values(metrics).reduce((sum, score) => sum + score, 0) / Object.keys(metrics).length;
  
  if (avgScore < 3) {
    return `Keep practicing! You're building foundational skills at the ${cefrLevel} level.`;
  }
  if (avgScore < 5) {
    return `Good progress! Continue working on the areas highlighted above to reach the next level.`;
  }
  if (avgScore < 7) {
    return `Well done! You're showing solid ${cefrLevel} level skills with room for refinement.`;
  }
  if (avgScore < 9) {
    return `Excellent work! Your ${cefrLevel} level performance shows strong command of English.`;
  }
  return `Outstanding performance! You demonstrate ${cefrLevel} level mastery across all skills.`;
};

/**
 * Generate CEFR-aligned performance descriptors for each skill
 */
export const generateSkillDescriptors = (
  metrics: AssessmentMetrics,
  cefrLevel: CEFRLevel
): SkillDescriptor[] => {
  const skills: (keyof AssessmentMetrics)[] = [
    'fluency', 'grammar', 'vocabulary', 'pronunciation', 'prosody', 'coherence', 'syntax'
  ];

  return skills.map(skill => ({
    skill: skill.charAt(0).toUpperCase() + skill.slice(1),
    score: metrics[skill],
    descriptor: getPerformanceDescriptor(metrics[skill]),
    bandFeedback: getBandSpecificFeedback(skill, cefrLevel)
  }));
};

/**
 * Get performance descriptor based on score
 */
const getPerformanceDescriptor = (score: number): string => {
  if (score >= 9) return "Excellent control at C1/C2 level";
  if (score >= 7) return "Consistently accurate with occasional slips";
  if (score >= 5) return "Generally effective, with some noticeable errors";
  if (score >= 3) return "Limited control; frequent basic mistakes";
  return "Very limited performance; needs significant improvement";
};

/**
 * Get band-specific feedback templates
 */
const getBandSpecificFeedback = (skill: keyof AssessmentMetrics, cefrLevel: CEFRLevel): string => {
  const feedbackTemplates: Record<string, Record<string, string>> = {
    fluency: {
      'A1': "You are beginning to speak in full sentences. Focus on connecting ideas and reducing pauses.",
      'A2': "You can speak on familiar topics. Practice reducing hesitations and repeating ideas.",
      'B1': "You speak with some confidence, but more flow is needed for longer answers.",
      'B2': "You are generally fluent. Aim for more natural transitions and pacing.",
      'C1': "You speak fluently with few pauses. Continue refining intonation and natural rhythm.",
      'C2': "You speak fluently with few pauses. Continue refining intonation and natural rhythm."
    },
    grammar: {
      'A1': "Start with mastering subject–verb agreement and basic sentence structure.",
      'A2': "Work on verb tenses and basic question forms.",
      'B1': "Focus on complex sentence structures and fewer repeated errors.",
      'B2': "Try polishing accuracy in conditionals and passive structures.",
      'C1': "You use complex structures well. Focus on eliminating minor slips.",
      'C2': "You use complex structures well. Focus on eliminating minor slips."
    },
    vocabulary: {
      'A1': "Learn everyday words related to topics like family, work, and food.",
      'A2': "Try using adjectives and verbs beyond basic vocabulary.",
      'B1': "Increase your use of topic-specific and descriptive vocabulary.",
      'B2': "Use more abstract or nuanced words and idiomatic expressions.",
      'C1': "Your range is wide. Aim for more precision and register-appropriate expressions.",
      'C2': "Your range is wide. Aim for more precision and register-appropriate expressions."
    },
    pronunciation: {
      'A1': "Focus on clear pronunciation of basic sounds and familiar words.",
      'A2': "Work on consistent pronunciation of common words and phrases.",
      'B1': "Continue practicing challenging sounds for better overall clarity.",
      'B2': "Refine pronunciation of complex words and improve natural rhythm.",
      'C1': "Polish subtle pronunciation features and work on native-like intonation.",
      'C2': "Polish subtle pronunciation features and work on native-like intonation."
    },
    prosody: {
      'A1': "Practice basic rhythm and try to vary your tone naturally.",
      'A2': "Work on natural sentence stress in simple phrases.",
      'B1': "Develop better rhythm and appropriate word emphasis.",
      'B2': "Focus on natural intonation patterns and sentence stress.",
      'C1': "Refine prosodic features for more natural and expressive speech.",
      'C2': "Refine prosodic features for more natural and expressive speech."
    },
    coherence: {
      'A1': "Practice organizing simple ideas with basic connecting words.",
      'A2': "Use simple linking words to connect your ideas more clearly.",
      'B1': "Work on logical organization and smoother transitions between ideas.",
      'B2': "Develop more sophisticated ways to structure and connect your arguments.",
      'C1': "Use advanced discourse markers for sophisticated idea development.",
      'C2': "Use advanced discourse markers for sophisticated idea development."
    },
    syntax: {
      'A1': "Practice forming complete sentences with proper word order.",
      'A2': "Work on basic sentence structures and question formation.",
      'B1': "Try using more complex sentence structures with subordinate clauses.",
      'B2': "Focus on sophisticated syntactic patterns and sentence variety.",
      'C1': "Use complex syntax flexibly and accurately for different purposes.",
      'C2': "Use complex syntax flexibly and accurately for different purposes."
    }
  };

  const levelKey = cefrLevel.replace('+', ''); // Handle B2+, C1+ etc.
  return feedbackTemplates[skill][levelKey] || feedbackTemplates[skill]['B1'];
};