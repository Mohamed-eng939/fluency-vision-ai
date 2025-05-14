
/**
 * Utilities for analyzing discourse markers in text
 */

/**
 * Lists of discourse markers by type
 */
export const discourseMarkers = {
  // Sequential markers
  sequential: ['first', 'firstly', 'second', 'secondly', 'third', 'thirdly',
    'finally', 'lastly', 'in conclusion', 'to sum up', 'to conclude',
    'next', 'then', 'subsequently', 'afterwards', 'after that'],
  
  // Contrastive markers
  contrastive: ['however', 'nevertheless', 'nonetheless', 'on the other hand',
    'although', 'though', 'despite', 'in spite of', 'while', 'whereas'],
  
  // Causal markers
  causal: ['consequently', 'as a result', 'therefore', 'thus', 'hence',
    'because', 'since', 'due to', 'for this reason', 'so'],
  
  // Exemplification markers
  exemplification: ['for example', 'for instance', 'such as', 'in particular',
    'namely', 'specifically', 'to illustrate'],
  
  // Additive markers
  additive: ['in addition', 'furthermore', 'moreover', 'besides', 'also',
    'additionally', 'what is more', 'not only...but also']
};

/**
 * Get all discourse markers as a flat array
 */
export const getAllDiscourseMarkers = (): string[] => {
  return Object.values(discourseMarkers).flat();
};

/**
 * Count discourse markers in text by type
 */
export const countDiscourseMarkersByType = (text: string): Record<string, number> => {
  if (!text) return { 
    sequential: 0, 
    contrastive: 0, 
    causal: 0, 
    exemplification: 0, 
    additive: 0,
    total: 0 
  };
  
  const textLower = text.toLowerCase();
  
  const counts: Record<string, number> = {};
  
  // Count each type of marker
  Object.entries(discourseMarkers).forEach(([type, markers]) => {
    counts[type] = markers.filter(marker => textLower.includes(marker)).length;
  });
  
  // Calculate total across all types
  counts.total = Object.entries(counts).reduce((sum, [key, value]) => 
    key !== 'total' ? sum + value : sum, 0);
  
  return counts;
};

/**
 * Get the number of different marker types used in the text
 */
export const getMarkerTypeCount = (markerCounts: Record<string, number>): number => {
  // Filter out the 'total' property and count types with at least one marker
  return Object.entries(markerCounts)
    .filter(([key, count]) => key !== 'total' && count > 0)
    .length;
};

/**
 * Check if discourse markers appear mostly in the first half of the text
 * Returns true if the only marker appears in the first 50% of the text
 */
export const checkFrontLoadedMarkers = (text: string, markers: string[]): boolean => {
  if (!text) return false;
  
  const textLower = text.toLowerCase();
  const textLength = textLower.length;
  const halfwayPoint = Math.floor(textLength / 2);
  
  // Find the position of the first marker
  let firstMarkerPos = textLength;
  let markerFound = false;
  
  for (const marker of markers) {
    const pos = textLower.indexOf(marker);
    if (pos !== -1) {
      markerFound = true;
      firstMarkerPos = Math.min(firstMarkerPos, pos);
    }
  }
  
  // Check if the only marker is in the first half
  return markerFound && firstMarkerPos < halfwayPoint;
};
