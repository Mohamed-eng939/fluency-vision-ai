
/**
 * Simple lemmatizer for English words
 * In a production environment, this would be replaced with a proper NLP library
 */

// Common irregular verb forms and their base forms
const irregularVerbs: Record<string, string> = {
  'am': 'be',
  'are': 'be',
  'is': 'be',
  'was': 'be',
  'were': 'be',
  'been': 'be',
  'being': 'be',
  'have': 'have',
  'has': 'have',
  'had': 'have',
  'having': 'have',
  'do': 'do',
  'does': 'do',
  'did': 'do',
  'doing': 'do',
  'go': 'go',
  'goes': 'go',
  'went': 'go',
  'gone': 'go',
  'going': 'go',
  'say': 'say',
  'says': 'say',
  'said': 'say',
  'saying': 'say',
  'see': 'see',
  'sees': 'see',
  'saw': 'see',
  'seen': 'see',
  'seeing': 'see',
  'get': 'get',
  'gets': 'get',
  'got': 'get',
  'gotten': 'get',
  'getting': 'get',
  'make': 'make',
  'makes': 'make',
  'made': 'make',
  'making': 'make',
  'know': 'know',
  'knows': 'know',
  'knew': 'know',
  'known': 'know',
  'knowing': 'know',
  'take': 'take',
  'takes': 'take',
  'took': 'take',
  'taken': 'take',
  'taking': 'take',
  'think': 'think',
  'thinks': 'think',
  'thought': 'think',
  'thinking': 'think',
  'come': 'come',
  'comes': 'come',
  'came': 'come',
  'coming': 'come',
  'want': 'want',
  'wants': 'want',
  'wanted': 'want',
  'wanting': 'want'
};

// Common plural nouns and their singular forms
const irregularNouns: Record<string, string> = {
  'children': 'child',
  'men': 'man',
  'women': 'woman',
  'people': 'person',
  'mice': 'mouse',
  'feet': 'foot',
  'teeth': 'tooth',
  'geese': 'goose',
  'lives': 'life',
  'knives': 'knife',
  'wives': 'wife',
  'leaves': 'leaf',
  'loaves': 'loaf',
  'wolves': 'wolf',
  'shelves': 'shelf',
  'selves': 'self'
};

/**
 * Simple lemmatization function
 * Attempts to reduce words to their base form
 */
export const lemmatize = (word: string): string => {
  // Convert to lowercase
  word = word.toLowerCase();
  
  // Return if word is in irregulars dictionary
  if (irregularVerbs[word]) return irregularVerbs[word];
  if (irregularNouns[word]) return irregularNouns[word];
  
  // Handle regular plural nouns ending in 's'
  if (word.endsWith('s') && !word.endsWith('ss') && word.length > 3) {
    if (word.endsWith('ies')) {
      return word.slice(0, -3) + 'y';
    } else if (word.endsWith('es')) {
      return word.slice(0, -2);
    } else {
      return word.slice(0, -1);
    }
  }
  
  // Handle regular verb forms
  if (word.endsWith('ing') && word.length > 5) {
    // Double consonant + ing (e.g., running -> run)
    if (/[aeiou][^aeiou]{2}ing$/.test(word)) {
      return word.slice(0, -4);
    }
    // Regular -ing form
    return word.slice(0, -3);
  }
  
  // -ied past tense of a -y verb (e.g., studied -> study, tried -> try)
  if (word.endsWith('ied') && word.length > 4) {
    return word.slice(0, -3) + 'y';
  }

  if (word.endsWith('ed') && word.length > 4) {
    // Double consonant + ed (e.g., stopped -> stop)
    if (/[aeiou][^aeiou]{2}ed$/.test(word)) {
      return word.slice(0, -3);
    }
    // Regular -ed form
    return word.slice(0, -2);
  }

  // No changes needed
  return word;
};
