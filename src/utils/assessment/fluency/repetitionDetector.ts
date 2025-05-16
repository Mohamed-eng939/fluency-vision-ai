
/**
 * Detect repetitions in the transcript
 * Identifies consecutive repeated words or phrases
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
  
  // Check for consecutive repetitions (e.g., "I I I")
  for (let i = 0; i < words.length - 1; i++) {
    if (words[i] && words[i] === words[i + 1]) {
      // Find how many consecutive repetitions
      let repetitionEnd = i + 1;
      while (repetitionEnd < words.length && words[repetitionEnd] === words[i]) {
        repetitionEnd++;
      }
      
      // If we found a sequence of at least 2 same words
      if (repetitionEnd - i >= 2) {
        const repeatedWord = words[i];
        const repetitionPhrase = Array(repetitionEnd - i).fill(repeatedWord).join(' ');
        repetitions.push(repetitionPhrase);
        examples.push(repetitionPhrase);
        
        // Skip ahead to avoid counting the same repetition multiple times
        i = repetitionEnd - 1;
      }
    }
  }
  
  // Check for small window repetitions (not consecutive but close)
  const windowSize = 5;
  const wordCounts = new Map<string, number[]>();
  
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    if (!word || word.length <= 1) continue; // Skip very short words
    
    if (!wordCounts.has(word)) {
      wordCounts.set(word, [i]);
    } else {
      const positions = wordCounts.get(word)!;
      
      // Check if this is a close repetition (within window)
      if (i - positions[positions.length - 1] <= windowSize) {
        // Only count it if we haven't already detected it as consecutive
        const isAlreadyCounted = repetitions.some(rep => rep.includes(word));
        
        if (!isAlreadyCounted && positions.length === 1) {
          // This is the first time we're counting this as a repetition
          repetitions.push(`${word} ... ${word}`);
          examples.push(`${word} ... ${word}`);
        }
      }
      
      positions.push(i);
      wordCounts.set(word, positions);
    }
  }
  
  return { 
    count: repetitions.length, 
    repetitions, 
    examples: examples.slice(0, 5) // Limit examples to 5
  };
};
