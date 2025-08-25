import { ReadAloudSentence } from '@/data/readAloud/sentenceBank';

export interface IPATranscription {
  text: string;
  ipa: string;
  words: Array<{
    word: string;
    ipa: string;
    start?: number;
    end?: number;
  }>;
}

export interface IPAComparison {
  expected: IPATranscription;
  actual: IPATranscription;
  differences: Array<{
    position: number;
    expectedPhoneme: string;
    actualPhoneme: string;
    type: 'substitution' | 'omission' | 'insertion';
    wordIndex: number;
  }>;
  accuracy: number;
}

/**
 * Phoneme to IPA mapping for English sounds
 */
const phonemeToIPA: Record<string, string> = {
  // Vowels
  'AH': 'ʌ', 'AA': 'ɑ', 'AE': 'æ', 'AO': 'ɔ', 'AW': 'aʊ',
  'AY': 'aɪ', 'EH': 'ɛ', 'ER': 'ɜr', 'EY': 'eɪ', 'IH': 'ɪ',
  'IY': 'i', 'OW': 'oʊ', 'OY': 'ɔɪ', 'UH': 'ʊ', 'UW': 'u',
  
  // Consonants
  'B': 'b', 'CH': 'ʧ', 'D': 'd', 'DH': 'ð', 'F': 'f',
  'G': 'g', 'HH': 'h', 'JH': 'ʤ', 'K': 'k', 'L': 'l',
  'M': 'm', 'N': 'n', 'NG': 'ŋ', 'P': 'p', 'R': 'r',
  'S': 's', 'SH': 'ʃ', 'T': 't', 'TH': 'θ', 'V': 'v',
  'W': 'w', 'Y': 'j', 'Z': 'z', 'ZH': 'ʒ'
};

/**
 * Word-to-IPA dictionary for common English words
 */
const wordToIPADict: Record<string, string> = {
  // Articles
  'the': 'ðə',
  'a': 'ə',
  'an': 'æn',
  
  // Common verbs
  'is': 'ɪz',
  'are': 'ɑr',
  'was': 'wʌz',
  'were': 'wɜr',
  'have': 'hæv',
  'has': 'hæz',
  'had': 'hæd',
  'go': 'goʊ',
  'went': 'wɛnt',
  'come': 'kʌm',
  'came': 'keɪm',
  'see': 'si',
  'saw': 'sɔ',
  'get': 'gɛt',
  'got': 'gɑt',
  'take': 'teɪk',
  'took': 'tʊk',
  'make': 'meɪk',
  'made': 'meɪd',
  'give': 'gɪv',
  'gave': 'geɪv',
  'works': 'wɜrks',
  'worked': 'wɜrkt',
  'like': 'laɪk',
  'love': 'lʌv',
  'want': 'wɑnt',
  'need': 'nid',
  'think': 'θɪŋk',
  'know': 'noʊ',
  'say': 'seɪ',
  'tell': 'tɛl',
  'told': 'toʊld',
  
  // Common nouns
  'cat': 'kæt',
  'dog': 'dɔg',
  'house': 'haʊs',
  'home': 'hoʊm',
  'school': 'skul',
  'work': 'wɜrk',
  'book': 'bʊk',
  'water': 'wɔtər',
  'food': 'fud',
  'time': 'taɪm',
  'day': 'deɪ',
  'night': 'naɪt',
  'morning': 'mɔrnɪŋ',
  'afternoon': 'æftərnun',
  'evening': 'ivnɪŋ',
  'year': 'jɪr',
  'month': 'mʌnθ',
  'week': 'wik',
  'money': 'mʌni',
  'people': 'pipəl',
  'person': 'pɜrsən',
  'man': 'mæn',
  'woman': 'wʊmən',
  'child': 'ʧaɪld',
  'children': 'ʧɪldrən',
  'family': 'fæməli',
  'friend': 'frɛnd',
  'mother': 'mʌðər',
  'father': 'fɑðər',
  'brother': 'brʌðər',
  'sister': 'sɪstər',
  'student': 'studənt',
  'teacher': 'tiʧər',
  'doctor': 'dɑktər',
  'hospital': 'hɑspɪtəl',
  'car': 'kar',
  'bus': 'bʌs',
  'train': 'treɪn',
  'plane': 'pleɪn',
  'park': 'park',
  'store': 'stɔr',
  'restaurant': 'rɛstərɑnt',
  'hotel': 'hoʊtɛl',
  'beach': 'biʧ',
  'city': 'sɪti',
  'country': 'kʌntri',
  
  // Adjectives
  'big': 'bɪg',
  'small': 'smɔl',
  'good': 'gʊd',
  'bad': 'bæd',
  'new': 'nu',
  'old': 'oʊld',
  'young': 'jʌŋ',
  'hot': 'hɑt',
  'cold': 'koʊld',
  'happy': 'hæpi',
  'sad': 'sæd',
  'red': 'rɛd',
  'blue': 'blu',
  'white': 'waɪt',
  'black': 'blæk',
  'green': 'grin',
  'yellow': 'jɛloʊ',
  'long': 'lɔŋ',
  'short': 'ʃɔrt',
  'tall': 'tɔl',
  'beautiful': 'bjutəfəl',
  'interesting': 'ɪntrəstɪŋ',
  
  // Pronouns
  'i': 'aɪ',
  'you': 'ju',
  'he': 'hi',
  'she': 'ʃi',
  'it': 'ɪt',
  'we': 'wi',
  'they': 'ðeɪ',
  'me': 'mi',
  'him': 'hɪm',
  'her': 'hər',
  'us': 'ʌs',
  'them': 'ðɛm',
  'my': 'maɪ',
  'your': 'jʊr',
  'his': 'hɪz',
  'our': 'aʊr',
  'their': 'ðɛr',
  'this': 'ðɪs',
  'that': 'ðæt',
  'these': 'ðiz',
  'those': 'ðoʊz',
  
  // Prepositions
  'in': 'ɪn',
  'on': 'ɑn',
  'at': 'æt',
  'to': 'tu',
  'for': 'fɔr',
  'with': 'wɪð',
  'from': 'frʌm',
  'by': 'baɪ',
  'of': 'ʌv',
  'about': 'əbaʊt',
  'under': 'ʌndər',
  'over': 'oʊvər',
  'near': 'nɪr',
  'between': 'bɪtwin',
  'before': 'bɪfɔr',
  'after': 'æftər',
  
  // Numbers
  'one': 'wʌn',
  'two': 'tu',
  'three': 'θri',
  'four': 'fɔr',
  'five': 'faɪv',
  'six': 'sɪks',
  'seven': 'sɛvən',
  'eight': 'eɪt',
  'nine': 'naɪn',
  'ten': 'tɛn'
};

/**
 * Generate IPA transcription for a given text
 */
export const generateIPATranscription = (text: string): IPATranscription => {
  const words = text.toLowerCase().replace(/[^\w\s']/g, '').split(/\s+/).filter(word => word.length > 0);
  
  const ipaWords = words.map(word => {
    // Remove apostrophes and handle contractions
    const cleanWord = word.replace(/['']/g, '');
    const ipaWord = wordToIPADict[cleanWord] || estimateIPA(cleanWord);
    
    return {
      word,
      ipa: ipaWord
    };
  });
  
  const fullIPA = ipaWords.map(w => w.ipa).join(' ');
  
  return {
    text: text,
    ipa: fullIPA,
    words: ipaWords
  };
};

/**
 * Estimate IPA for unknown words using phonetic rules
 */
const estimateIPA = (word: string): string => {
  // This is a simplified phonetic estimation
  // In a real implementation, you'd use a more sophisticated phonetic dictionary
  
  let ipa = word;
  
  // Common substitutions
  ipa = ipa.replace(/th/g, 'θ');  // voiceless th
  ipa = ipa.replace(/sh/g, 'ʃ');
  ipa = ipa.replace(/ch/g, 'ʧ');
  ipa = ipa.replace(/ng/g, 'ŋ');
  ipa = ipa.replace(/ph/g, 'f');
  
  // Vowel patterns (simplified)
  ipa = ipa.replace(/a/g, 'æ');
  ipa = ipa.replace(/e/g, 'ɛ');
  ipa = ipa.replace(/i/g, 'ɪ');
  ipa = ipa.replace(/o/g, 'ɑ');
  ipa = ipa.replace(/u/g, 'ʌ');
  
  return ipa;
};

/**
 * Compare expected and actual IPA transcriptions
 */
export const compareIPATranscriptions = (
  expected: IPATranscription,
  actual: IPATranscription
): IPAComparison => {
  const differences: IPAComparison['differences'] = [];
  
  // Simple character-by-character comparison
  const expectedPhonemes = expected.ipa.replace(/\s/g, '').split('');
  const actualPhonemes = actual.ipa.replace(/\s/g, '').split('');
  
  let correctPhonemes = 0;
  let totalPhonemes = Math.max(expectedPhonemes.length, actualPhonemes.length);
  
  for (let i = 0; i < totalPhonemes; i++) {
    const expectedPhoneme = expectedPhonemes[i] || '';
    const actualPhoneme = actualPhonemes[i] || '';
    
    if (expectedPhoneme !== actualPhoneme) {
      let type: 'substitution' | 'omission' | 'insertion';
      if (!expectedPhoneme) type = 'insertion';
      else if (!actualPhoneme) type = 'omission';
      else type = 'substitution';
      
      differences.push({
        position: i,
        expectedPhoneme,
        actualPhoneme,
        type,
        wordIndex: 0 // Simplified - would need better word boundary detection
      });
    } else {
      correctPhonemes++;
    }
  }
  
  const accuracy = totalPhonemes > 0 ? (correctPhonemes / totalPhonemes) * 100 : 0;
  
  return {
    expected,
    actual,
    differences,
    accuracy
  };
};

/**
 * Convert phoneme array from pronunciation API to IPA string
 */
export const phonemeArrayToIPA = (phonemes: string[]): string => {
  return phonemes.map(phoneme => phonemeToIPA[phoneme] || phoneme).join('');
};