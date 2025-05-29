
import { MistakeItem } from '@/components/assessment/mistakes/types';
import { detectRepetitions } from '../fluency/repetitionDetector';
import { detectHesitationMarkers } from '../../audio/hesitationDetector';

/**
 * Analyze fluency mistakes using repetition and hesitation detection
 */
export const analyzeFluencyMistakes = (transcript: string): MistakeItem[] => {
  const mistakes: MistakeItem[] = [];
  
  // Detect repetitions
  const repetitions = detectRepetitions(transcript);
  repetitions.examples.forEach(repetition => {
    mistakes.push({
      original: repetition,
      correction: repetition.split(' ')[0], // Just the word once
      suggestion: 'Practice speaking more slowly to avoid repetitions. Pause and think before speaking.',
      cefrLevel: 'B1',
      context: 'Speech fluency'
    });
  });

  // Detect hesitation markers
  const hesitations = detectHesitationMarkers(transcript);
  if (hesitations.count > 2) { // Only flag if excessive
    hesitations.markers.slice(0, 3).forEach(marker => { // Limit to first 3 examples
      mistakes.push({
        original: marker,
        correction: '[pause]',
        suggestion: 'Replace hesitation words with brief pauses. Practice speaking with confidence.',
        cefrLevel: 'B1',
        context: 'Hesitation markers'
      });
    });
  }

  return mistakes;
};
