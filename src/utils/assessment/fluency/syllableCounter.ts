
/**
 * Estimate syllable count from English text
 * This is a simplified algorithm - a more accurate algorithm would use a dictionary
 */
export const estimateSyllableCount = (text: string): number => {
  if (!text) return 0;

  const rawTokens = text.toLowerCase().split(/\s+/);
  let count = 0;

  for (const raw of rawTokens) {
    // Strip punctuation/digits so tokens like "well," or "don't" don't distort
    // the vowel-group count, and pure-punctuation tokens ("—") are skipped.
    const word = raw.replace(/[^a-z]/g, '');
    if (word.length === 0) continue;

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

    // Subtract a silent final 'e' ("make" -> 1), but NOT a consonant + "le",
    // which forms its own syllable ("table" -> 2, "little" -> 2).
    if (word.endsWith('e') && !/[^aeiou]le$/.test(word) && syllables > 1) {
      syllables--;
    }

    // Add the syllables for this word
    count += syllables || 1;
  }

  return Math.max(count, 1);
};
