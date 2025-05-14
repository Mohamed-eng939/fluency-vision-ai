
/**
 * Detect hesitation markers in transcript
 * (um, uh, er, hmm, like, you know, etc.)
 */
export const detectHesitationMarkers = (transcript: string): {
  count: number;
  markers: string[];
  ratio: number;
} => {
  const hesitationWords = ['um', 'uh', 'er', 'hmm', 'like', 'you know', 'i mean', 'well'];
  const words = transcript.toLowerCase().split(/\s+/);
  
  const markers: string[] = [];
  hesitationWords.forEach(marker => {
    const regex = new RegExp(`\\b${marker}\\b`, 'gi');
    const matches = transcript.toLowerCase().match(regex) || [];
    markers.push(...matches);
  });
  
  return {
    count: markers.length,
    markers,
    ratio: words.length > 0 ? markers.length / words.length : 0
  };
};
