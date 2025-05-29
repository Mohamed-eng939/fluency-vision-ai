
import { MistakeItem } from '@/components/assessment/mistakes/types';

/**
 * Analyze basic vocabulary mistakes
 */
export const analyzeVocabularyMistakes = (transcript: string): MistakeItem[] => {
  const mistakes: MistakeItem[] = [];
  
  // Check for overuse of basic adjectives
  const basicAdjectives = ['good', 'bad', 'big', 'small', 'nice', 'fun'];
  const words = transcript.toLowerCase().split(/\s+/);
  
  basicAdjectives.forEach(adj => {
    const count = words.filter(word => word.includes(adj)).length;
    if (count > 1) {
      const alternatives = {
        'good': 'excellent, wonderful, fantastic',
        'bad': 'terrible, awful, disappointing',
        'big': 'huge, enormous, massive',
        'small': 'tiny, little, compact',
        'nice': 'pleasant, lovely, delightful',
        'fun': 'enjoyable, entertaining, exciting'
      };
      
      mistakes.push({
        original: `"${adj}" (used ${count} times)`,
        correction: alternatives[adj as keyof typeof alternatives],
        suggestion: `Vary your vocabulary. Instead of repeating "${adj}", try: ${alternatives[adj as keyof typeof alternatives]}`,
        cefrLevel: 'B2',
        context: 'Vocabulary range'
      });
    }
  });

  return mistakes;
};
