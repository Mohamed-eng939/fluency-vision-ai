
/**
 * Detect repetitions in the transcript with improved logic to avoid false positives
 * Identifies consecutive repeated words or phrases while filtering out legitimate repetitions
 */
export const detectRepetitions = (transcript: string): { 
  count: number; 
  repetitions: string[]; 
  examples: string[];
} => {
  if (!transcript) {
    return { count: 0, repetitions: [], examples: [] };
  }
  
  // Normalize transcript (lowercase, remove extra spaces)
  const normalizedText = transcript.toLowerCase()
    .replace(/[.,!?;:"""'']/g, '') // Remove punctuation
    .replace(/\s+/g, ' ')          // Normalize spaces
    .trim();
  
  const words = normalizedText.split(' ');
  const repetitions: string[] = [];
  const examples: string[] = [];
  
  // Words that are commonly repeated for emphasis or clarity (not disfluent)
  const legitimateRepeatedWords = new Set([
    'very', 'really', 'so', 'well', 'now', 'yes', 'no', 'ok', 'okay',
    'right', 'sure', 'absolutely', 'definitely', 'exactly', 'indeed',
    'important', 'critical', 'essential', 'key', 'main', 'primary'
  ]);

  // Check for consecutive repetitions (e.g., "I I I")
  for (let i = 0; i < words.length - 1; i++) {
    if (words[i] && words[i] === words[i + 1] && words[i].length > 1) {
      // Find how many consecutive repetitions
      let repetitionEnd = i + 1;
      while (repetitionEnd < words.length && words[repetitionEnd] === words[i]) {
        repetitionEnd++;
      }
      
      // If we found a sequence of at least 2 same words
      if (repetitionEnd - i >= 2) {
        const repeatedWord = words[i];
        
        // Skip if it's a legitimate repeated word for emphasis
        if (legitimateRepeatedWords.has(repeatedWord)) {
          console.log(`Skipping legitimate repetition: ${repeatedWord}`);
          i = repetitionEnd - 1;
          continue;
        }
        
        // Only count as disfluent if repeated more than twice OR if it's a content word
        const repetitionCount = repetitionEnd - i;
        if (repetitionCount > 2 || (repetitionCount === 2 && repeatedWord.length > 3)) {
          const repetitionPhrase = Array(repetitionCount).fill(repeatedWord).join(' ');
          repetitions.push(repetitionPhrase);
          examples.push(repetitionPhrase);
          console.log(`Detected disfluent repetition: ${repetitionPhrase}`);
        }
        
        // Skip ahead to avoid counting the same repetition multiple times
        i = repetitionEnd - 1;
      }
    }
  }
  
  // Check for close repetitions (within a small window) - but be more selective
  const windowSize = 4; // Reduced window size to be more conservative
  const wordCounts = new Map<string, number[]>();
  
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    if (!word || word.length <= 2) continue; // Skip very short words
    
    // Skip function words and common repeated words
    if (legitimateRepeatedWords.has(word) || 
        ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with'].includes(word)) {
      continue;
    }
    
    if (!wordCounts.has(word)) {
      wordCounts.set(word, [i]);
    } else {
      const positions = wordCounts.get(word)!;
      
      // Check if this is a close repetition (within window)
      const lastPosition = positions[positions.length - 1];
      if (i - lastPosition <= windowSize) {
        // Only count it if we haven't already detected it as consecutive
        const isAlreadyCounted = repetitions.some(rep => rep.includes(word));
        
        if (!isAlreadyCounted && positions.length === 1) {
          // This is the first time we're counting this as a repetition
          repetitions.push(`${word} ... ${word}`);
          examples.push(`${word} ... ${word}`);
          console.log(`Detected close repetition: ${word}`);
        }
      }
      
      positions.push(i);
      wordCounts.set(word, positions);
    }
  }
  
  console.log(`Total repetitions detected: ${repetitions.length}`);
  
  return { 
    count: repetitions.length, 
    repetitions, 
    examples: examples.slice(0, 5) // Limit examples to 5
  };
};
