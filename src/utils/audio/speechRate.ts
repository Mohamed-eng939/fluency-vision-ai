
/**
 * Calculate speaking rate stats from transcript and duration
 */
export const calculateSpeakingRate = (
  transcript: string,
  durationSeconds: number
): { wpm: number; totalWords: number } => {
  const words = transcript.trim().split(/\s+/).filter(word => word.length > 0);
  const totalWords = words.length;
  const minutes = durationSeconds / 60;
  const wpm = minutes > 0 ? totalWords / minutes : 0;
  
  return { wpm, totalWords };
};
