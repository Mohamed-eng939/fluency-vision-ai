
/**
 * CEFR Vocabulary Data
 * Contains reference wordlists for CEFR levels
 */

// Sample words for each CEFR level (abbreviated lists for demonstration)
// In a production environment, these would be much more comprehensive
export const cefrVocabulary = {
  A1: [
    'go', 'school', 'like', 'eat', 'book', 'cat', 'run', 'house', 'car', 'big', 'small', 'good', 'bad',
    'happy', 'sad', 'hello', 'goodbye', 'yes', 'no', 'thank', 'please', 'sorry', 'day', 'night', 'today',
    'tomorrow', 'morning', 'afternoon', 'evening', 'friend', 'family', 'mother', 'father', 'brother', 'sister',
    'water', 'food', 'drink', 'hot', 'cold', 'new', 'old', 'young', 'name', 'live', 'work', 'play'
  ],
  A2: [
    'usually', 'write', 'travel', 'simple', 'always', 'help', 'sometimes', 'often', 'never', 'everything',
    'nothing', 'everyone', 'nobody', 'somewhere', 'anywhere', 'early', 'late', 'busy', 'free', 'difficult',
    'easy', 'interesting', 'boring', 'important', 'different', 'same', 'show', 'tell', 'ask', 'answer',
    'understand', 'speak', 'listen', 'read', 'write', 'learn', 'study', 'teach', 'begin', 'end', 'continue'
  ],
  B1: [
    'explain', 'prefer', 'describe', 'suggestion', 'communicate', 'probably', 'possibly', 'necessary',
    'unnecessary', 'improve', 'increase', 'decrease', 'develop', 'achieve', 'discuss', 'argue', 'agree',
    'disagree', 'opinion', 'reason', 'result', 'cause', 'effect', 'solution', 'problem', 'advantage',
    'disadvantage', 'benefit', 'organize', 'arrange', 'prepare', 'plan', 'experience', 'compare', 'contrast'
  ],
  B2: [
    'development', 'contrast', 'advantage', 'despite', 'however', 'furthermore', 'moreover', 'nevertheless',
    'therefore', 'consequently', 'apparently', 'evidently', 'surprisingly', 'unfortunately', 'significantly',
    'relatively', 'approximately', 'occasionally', 'primarily', 'essentially', 'ultimately', 'presumably',
    'alternatively', 'subsequently', 'previously', 'eventually', 'gradually', 'accurately', 'deliberately'
  ],
  C1: [
    'consequently', 'assumption', 'sophisticated', 'criticise', 'nevertheless', 'illuminate', 'meticulous',
    'articulate', 'comprehensive', 'substantial', 'rigorous', 'scrutiny', 'substantiate', 'detrimental',
    'conducive', 'indispensable', 'alleviate', 'exacerbate', 'exemplify', 'predominant', 'impediment',
    'discretion', 'contingent', 'pertinent', 'divergent', 'profound', 'reconcile', 'enumerate', 'deduce'
  ],
  C2: [
    'simultaneously', 'philosophical', 'disproportionate', 'hypothesis', 'albeit', 'paradigm', 'enigmatic',
    'quintessential', 'juxtaposition', 'dichotomy', 'paradoxical', 'idiosyncratic', 'axiomatic', 'ubiquitous',
    'paramount', 'interminable', 'surreptitious', 'incontrovertible', 'inexorable', 'esoteric', 'tacit',
    'ephemeral', 'euphemistic', 'nuanced', 'idiomatic', 'amalgamation', 'rhetoric', 'fallacy'
  ]
};

// Common words to ignore in assessments (stop words)
export const stopWords = [
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'about',
  'of', 'from', 'as', 'into', 'through', 'after', 'before', 'between', 'under', 'over',
  'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them',
  'my', 'your', 'his', 'her', 'its', 'our', 'their',
  'this', 'that', 'these', 'those',
  'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'shall', 'should',
  'can', 'could', 'may', 'might', 'must',
  'not', 'no', 'nor', 'none',
  'all', 'any', 'some', 'many', 'few', 'more', 'most', 'other', 'such', 'what', 'which'
];

/**
 * Map CEFR level to numeric score range
 */
export const cefrLevelToScoreRange = {
  'A1': { min: 1.0, max: 2.5, base: 1.5 },
  'A2': { min: 2.6, max: 4.0, base: 3.0 },
  'B1': { min: 4.1, max: 5.5, base: 4.5 },
  'B2': { min: 5.6, max: 7.0, base: 6.0 },
  'C1': { min: 7.1, max: 8.5, base: 7.5 },
  'C2': { min: 8.6, max: 10.0, base: 9.0 }
};

/**
 * Define key vocabulary indicators for CEFR levels
 */
export const cefrVocabularyIndicators = {
  A1: {
    description: "Uses a very basic range of single words and simple phrases related to personal details and particular concrete situations.",
    expectedRange: 300,
    keyFeatures: ["Basic verbs (be, have, go)", "Common nouns for everyday objects", "Simple adjectives (big, small, good)"]
  },
  A2: {
    description: "Uses basic vocabulary repertoire on concrete everyday needs. May use lexical boundaries incorrectly but communicates meaning.",
    expectedRange: 1000,
    keyFeatures: ["Frequency adverbs (usually, always)", "Simple modifiers", "Time expressions", "Linking words (and, but, because)"]
  },
  B1: {
    description: "Has sufficient vocabulary to express self on most everyday topics, though may use circumlocution. Some word-finding difficulties.",
    expectedRange: 2000,
    keyFeatures: ["Opinion expressions", "Suggestions", "Comparisons", "Cause/effect language"]
  },
  B2: {
    description: "Has good lexical range for matters connected to field and most general topics. Varies formulation to avoid repetition.",
    expectedRange: 4000,
    keyFeatures: ["Discourse markers (however, despite)", "Abstract concepts", "Evaluative language", "Academic vocabulary"]
  },
  C1: {
    description: "Has broad lexical repertoire allowing gaps to be readily overcome with circumlocutions; little obvious searching for expressions.",
    expectedRange: 8000,
    keyFeatures: ["Idiomatic expressions", "Colloquialisms", "Connotation awareness", "Sophisticated connectors"]
  },
  C2: {
    description: "Has good command of a very broad lexical repertoire including idiomatic expressions and colloquialisms; awareness of connotative levels of meaning.",
    expectedRange: 16000,
    keyFeatures: ["Nuanced vocabulary", "Specialized terminology", "Rare phrases", "Sophisticated academic language"]
  }
};
