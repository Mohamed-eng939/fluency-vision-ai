
import { MistakeItem } from '@/components/assessment/mistakes/types';
import { AssessmentResult } from '@/types/assessment';
import { splitIntoSentences } from '../coherence/sentenceAnalysis';

/**
 * Analyze structure and coherence mistakes
 */
export const analyzeStructureMistakes = (transcript: string, result: AssessmentResult): MistakeItem[] => {
  const mistakes: MistakeItem[] = [];
  const sentences = splitIntoSentences(transcript);
  
  // Check for very short sentences (potential lack of development)
  const shortSentences = sentences.filter(s => s.split(' ').length < 4);
  if (shortSentences.length > sentences.length * 0.5) {
    mistakes.push({
      original: shortSentences[0] || 'Short sentences',
      correction: 'Try combining ideas: "When I was young, I enjoyed playing in the garden with my friends."',
      suggestion: 'Practice connecting ideas with conjunctions (and, but, because, when) to create more complex sentences.',
      cefrLevel: 'B1',
      context: 'Sentence development'
    });
  }

  // Check for lack of discourse markers
  const discourseMarkers = ['first', 'then', 'however', 'because', 'although', 'finally'];
  const hasMarkers = discourseMarkers.some(marker => 
    transcript.toLowerCase().includes(marker)
  );
  
  if (!hasMarkers && sentences.length > 2) {
    mistakes.push({
      original: 'Ideas not connected',
      correction: 'First, I go to school. Then, I play with friends. Finally, I go home.',
      suggestion: 'Use linking words (first, then, because, however) to connect your ideas and improve coherence.',
      cefrLevel: 'B1',
      context: 'Discourse markers'
    });
  }

  return mistakes;
};
