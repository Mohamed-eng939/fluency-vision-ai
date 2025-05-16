
/**
 * Estimate syllable count from English text
 * This is a simplified algorithm - a more accurate algorithm would use a dictionary
 */
export const estimateSyllableCount = (text: string): number => {
  if (!text) return 0;
  
  const words = text.toLowerCase().split(/\s+/);
  let count = 0;
  
  for (const word of words) {
    if (word.length <= 3) {
      // Short words generally have 1 syllable
      count += 1;
      continue;
    }
    
    // Count vowel groups as syllables
    const vowelGroups = word.match(/[aeiouy]+/g);
    if (!vowelGroups) {
      count += 1;
      continue;
    }
    
    let syllables = vowelGroups.length;
    
    // Subtract silent 'e' at the end
    if (word.endsWith('e') && syllables > 1) {
      syllables--;
    }
    
    // Add the syllables for this word
    count += syllables || 1;
  }
  
  return Math.max(count, 1);
};
