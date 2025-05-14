
/**
 * Calculate coherence score
 */
export const calculateCoherenceScore = (
  audioMetrics: any,
  transcript: string
): number => {
  if (!transcript) return 5;
  
  // Check for discourse markers
  const discourseMarkers = [
    'first', 'firstly', 'second', 'secondly', 'third', 'thirdly',
    'finally', 'lastly', 'in conclusion', 'to sum up', 
    'however', 'nevertheless', 'nonetheless', 'on the other hand', 
    'consequently', 'as a result', 'therefore', 'thus', 'hence',
    'for example', 'for instance', 'such as', 'in particular',
    'in addition', 'furthermore', 'moreover', 'besides', 'also'
  ];
  
  // Count discourse markers
  const markerCount = discourseMarkers.filter(marker => 
    transcript.toLowerCase().includes(marker)
  ).length;
  
  // Base score on discourse marker usage
  let score = 5;
  
  if (markerCount >= 5) score = 9;
  else if (markerCount >= 4) score = 8;
  else if (markerCount >= 3) score = 7;
  else if (markerCount >= 2) score = 6;
  else if (markerCount >= 1) score = 5;
  else score = 4;
  
  // Adjust for transcript length
  const words = transcript.split(/\s+/).filter(w => w.length > 0);
  if (words.length < 30) score -= 1;
  if (words.length > 100) score += 1;
  
  // Ensure score is between 1-10
  return Math.max(1, Math.min(10, score));
};
