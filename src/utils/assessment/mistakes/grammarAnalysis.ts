
import { MistakeItem } from '@/components/assessment/mistakes/types';

/**
 * Analyze grammar mistakes using API results ONLY - NO local fallback
 */
export const analyzeGrammarMistakes = (transcript: string, audioMetrics?: any): MistakeItem[] => {
  const mistakes: MistakeItem[] = [];
  
  // Only use API results - NO local detection fallback
  if (audioMetrics?.grammarApiAnalysis?.apiUsed && audioMetrics.grammarApiAnalysis.detailedErrors) {
    // Map API errors directly to MistakeItem format
    audioMetrics.grammarApiAnalysis.detailedErrors.forEach((error: any) => {
      mistakes.push({
        original: error.bad,
        correction: Array.isArray(error.better) ? error.better[0] : error.better,
        suggestion: error.description,
        cefrLevel: audioMetrics.grammarApiAnalysis.cefr || 'A2',
        context: error.type === 'grammar' ? 'Grammar error' : 'Spelling error'
      });
    });
  }
  
  // If API not used, return empty array - NO local fallback
  return mistakes;
};
