
import { MistakeItem } from '@/components/assessment/mistakes/types';

/**
 * Analyze grammar mistakes using API results or current detection methods
 */
export const analyzeGrammarMistakes = (transcript: string, audioMetrics?: any): MistakeItem[] => {
  const mistakes: MistakeItem[] = [];
  
  // Check if we have API results
  if (audioMetrics?.grammarApiAnalysis?.apiUsed && audioMetrics.grammarApiAnalysis.detailedErrors) {
    // Use API errors for detailed feedback
    audioMetrics.grammarApiAnalysis.detailedErrors.forEach((error: any) => {
      mistakes.push({
        original: error.bad,
        correction: error.better[0] || error.bad,
        suggestion: error.description,
        cefrLevel: audioMetrics.grammarApiAnalysis.cefr || 'A2',
        context: error.type === 'grammar' ? 'Grammar error' : 'Spelling error'
      });
    });
    
    return mistakes;
  }
  
  // Fallback to local detection if API not used
  
  // Detect subject-verb agreement errors
  const svAgreementErrors = [
    { pattern: /\b(he|she|it)\s+(go|come|do|have)\b/gi, correction: (match: string) => match.replace(/(go|come|do|have)/, m => m + 's') },
    { pattern: /\b(I|you|we|they)\s+(goes|comes|does|has)\b/gi, correction: (match: string) => match.replace(/(goes|comes|does|has)/, m => m.slice(0, -1)) }
  ];

  svAgreementErrors.forEach(({ pattern, correction }) => {
    const matches = transcript.match(pattern);
    if (matches) {
      matches.forEach(match => {
        mistakes.push({
          original: match,
          correction: correction(match),
          suggestion: 'Review subject-verb agreement rules. The verb must agree with the subject in number.',
          cefrLevel: 'A2',
          context: 'Subject-verb agreement'
        });
      });
    }
  });

  // Detect tense inconsistencies (simple patterns)
  const tenseErrors = [
    { pattern: /\beated\b/gi, correction: 'ate', suggestion: 'Learn irregular past tense verbs. "Eat" becomes "ate" in past tense.' },
    { pattern: /\bgoed\b/gi, correction: 'went', suggestion: 'Learn irregular past tense verbs. "Go" becomes "went" in past tense.' },
    { pattern: /\bcomed\b/gi, correction: 'came', suggestion: 'Learn irregular past tense verbs. "Come" becomes "came" in past tense.' }
  ];

  tenseErrors.forEach(({ pattern, correction, suggestion }) => {
    const matches = transcript.match(pattern);
    if (matches) {
      matches.forEach(match => {
        mistakes.push({
          original: match,
          correction,
          suggestion,
          cefrLevel: 'A2',
          context: 'Irregular past tense'
        });
      });
    }
  });

  // Detect missing articles (basic patterns)
  const articleErrors = [
    { pattern: /\b(go to|at|in)\s+(school|university|hospital)\b/gi, context: 'Should typically use "the" with these institutions when referring to the building' },
    { pattern: /\bI am\s+([a-z]+er|teacher|doctor|student)\b/gi, context: 'Professions usually need an article: "I am a teacher"' }
  ];

  articleErrors.forEach(({ pattern, context }) => {
    const matches = transcript.match(pattern);
    if (matches) {
      matches.forEach(match => {
        const corrected = match.replace(/\b(go to|at|in)\s+/, '$1 the ').replace(/\bI am\s+/, 'I am a ');
        mistakes.push({
          original: match,
          correction: corrected,
          suggestion: 'Review article usage (a, an, the). Articles are required before most singular countable nouns.',
          cefrLevel: 'A2',
          context
        });
      });
    }
  });

  return mistakes;
};
