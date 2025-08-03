export interface ReadAloudSentence {
  id: string;
  sentence: string;
  band: 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
  exampleErrors?: string[];
  feedback?: string[];
}

export interface ReadAloudError {
  type: 'substitution' | 'omission' | 'insertion' | 'hesitation';
  position?: number;
  expected?: string;
  actual?: string;
  description?: string;
}

export interface ReadAloudResult {
  sentenceId: string;
  score: number; // 0-5
  errors: ReadAloudError[];
  transcription?: string;
  confidence?: number;
}

// A1 Sentence Bank
export const a1Sentences: ReadAloudSentence[] = [
  {
    id: 'A1-001',
    sentence: 'The cat is on the bed.',
    band: 'A1',
    exampleErrors: ['De cat is on de bed', 'The cat on bed', 'The cat is... uh... on the... um... bed'],
    feedback: [
      'Work on the /ð/ sound; many A1 learners confuse it with /d/.',
      'Try using full sentences with correct linking words like "is" and "the."',
      'Reduce hesitation for smoother fluency.'
    ]
  },
  {
    id: 'A1-002',
    sentence: 'I am a student.',
    band: 'A1',
    exampleErrors: ['I em student', 'I am uh student'],
    feedback: [
      'Ensure clear vowel in "am" (not "em").',
      'Use the article "a" correctly.',
      'Try not to pause mid-sentence—speak smoothly from start to finish.'
    ]
  },
  {
    id: 'A1-003',
    sentence: 'She has a red bag.',
    band: 'A1',
    exampleErrors: ['She have red bag', 'She has red beg', 'She... um... has a... red... uh... bag'],
    feedback: [
      'Remember: "She has," not "She have."',
      'Work on vowel sounds—/æ/ in "bag" is different from /e/.',
      'Try speaking with fewer pauses.'
    ]
  },
  {
    id: 'A1-004',
    sentence: 'My name is Ahmed.',
    band: 'A1',
    exampleErrors: ['Mai name is Achmed', 'My... name... is... uhh... Ahmed'],
    feedback: [
      'Focus on vowel clarity in "name" and "Ahmed."',
      'Practice saying short sentences in one smooth phrase to improve rhythm.'
    ]
  },
  {
    id: 'A1-005',
    sentence: 'We live in a big house.',
    band: 'A1',
    exampleErrors: ['We leaf in a big house', 'We live in big house', 'We... um... live in a... big... house'],
    feedback: [
      'Practice the /v/ sound in "live" – avoid substituting it with /f/.',
      'Use all parts of the sentence, especially the article "a."',
      'Reduce mid-sentence pauses.'
    ]
  },
  {
    id: 'A1-006',
    sentence: 'He is my brother.',
    band: 'A1',
    exampleErrors: ['He are my brother', 'He is my brudder', 'He... is... uh... my... brother'],
    feedback: [
      'Use "is" for third person singular: "He is," not "He are."',
      'Practice the /ð/ sound in "brother."',
      'Read the whole sentence smoothly in one breath.'
    ]
  },
  {
    id: 'A1-007',
    sentence: 'I go to school every day.',
    band: 'A1',
    exampleErrors: ['I goes to school', 'I go to eshool', 'I go... to... uh... school... every... day'],
    feedback: [
      'Use the base form with "I": "I go," not "I goes."',
      'Say "school" clearly—don\'t soften the /k/.',
      'Practice connecting words without long pauses.'
    ]
  },
  {
    id: 'A1-008',
    sentence: 'The sun is hot today.',
    band: 'A1',
    exampleErrors: ['De sun is hot', 'The sun is hat today', 'The sun... is... uhh... hot... today'],
    feedback: [
      'Work on pronouncing /ð/ ("the") correctly.',
      'Ensure correct vowel in "hot" – not "hat."',
      'Say the sentence in a steady, natural flow.'
    ]
  },
  {
    id: 'A1-009',
    sentence: 'I have two sisters.',
    band: 'A1',
    exampleErrors: ['I has two sisters', 'I have too sister', 'I... have... uh... two... sissers'],
    feedback: [
      '"Have" goes with "I," not "has."',
      'Don\'t forget the plural "sisters."',
      'Practice consonant clarity and reduce pauses.'
    ]
  },
  {
    id: 'A1-010',
    sentence: 'This is my book.',
    band: 'A1',
    exampleErrors: ['Dis is my book', 'This is my buk', 'This... is... uh... my... book'],
    feedback: [
      'Work on the /ð/ sound in "this."',
      '"Book" should sound like /bʊk/, not /buk/.',
      'Avoid pausing between each word—read fluidly.'
    ]
  }
];

// A2 Sentence Bank
export const a2Sentences: ReadAloudSentence[] = [
  {
    id: 'A2-001',
    sentence: 'My mother works in a hospital.',
    band: 'A2',
    exampleErrors: ['My mother work in hospital', 'My mudder works in a hospital', 'My... mother... um... works... in... uh... hospital'],
    feedback: [
      'Use "works" with "she"—subject-verb agreement matters.',
      'Pronounce "mother" with a soft /ð/, not "mudder."',
      'Connect words smoothly for natural speech.'
    ]
  },
  {
    id: 'A2-002',
    sentence: 'They went to the park yesterday afternoon.',
    band: 'A2',
    exampleErrors: ['They go to park yesterday afternoon', 'They went to da bark yesterday', 'They... uh... went... to the... um... park... yesterday...'],
    feedback: [
      'Use the correct past form: "went," not "go."',
      'Pay attention to final consonants—"park" should end with a /k/.',
      'Reduce fillers and speak the whole sentence in one go.'
    ]
  },
  {
    id: 'A2-003',
    sentence: 'I usually eat lunch at 1 o\'clock.',
    band: 'A2',
    exampleErrors: ['I usual eat lunch at 1 o\'clock', 'I usually eat lunch at one o-clock', 'I... usually... eat... um... lunch... at... uh... one'],
    feedback: [
      'Use adverbs properly: "usually," not "usual."',
      'Practice "o\'clock" as one word, with the stress on the second syllable.',
      'Aim for a smoother, connected delivery.'
    ]
  },
  {
    id: 'A2-004',
    sentence: 'She\'s wearing a blue dress and white shoes.',
    band: 'A2',
    exampleErrors: ['She wearing blue dress and shoes white', 'She\'s wearing a bloo dres and white choos', 'She\'s... wearing... a... um... blue... dress... and... white... shoes'],
    feedback: [
      'Include the correct auxiliary: "She\'s wearing."',
      'Watch out for vowel sounds—"shoes" is /ʃuːz/, not "choos."',
      'Keep the rhythm natural, not robotic.'
    ]
  },
  {
    id: 'A2-005',
    sentence: 'We stayed in a small hotel near the beach.',
    band: 'A2',
    exampleErrors: ['We stay in small hotel near beach', 'We stayed in a small hotail near the bich', 'We... stayed... uh... in a... small... hotel... near... the... um... beach'],
    feedback: [
      'Use correct past tense: "stayed."',
      'Watch vowel sounds: "hotel" = /hoʊˈtel/, "beach" = /biːtʃ/, not "bich."',
      'Work on pacing and reducing pauses.'
    ]
  },
  {
    id: 'A2-006',
    sentence: 'We went shopping at the new mall.',
    band: 'A2',
    exampleErrors: ['We go shopping in new mall', 'We went chopping at the mall', 'We... uh... went... shopping... at... the... um... mall'],
    feedback: [
      'Use "went" for past actions, not "go."',
      'Focus on the /ʃ/ sound in "shopping"—don\'t say "chopping."',
      'Smooth out delivery; avoid pausing between each word.'
    ]
  },
  {
    id: 'A2-007',
    sentence: 'He often listens to music when he studies.',
    band: 'A2',
    exampleErrors: ['He often listen music when he study', 'He offen lissens to musik', 'He... often... uh... listens... to... music... when... he... studies'],
    feedback: [
      'Add -s for third person: "listens," "studies."',
      'Pronounce "often" clearly (silent \'t\' acceptable); be careful with "music" /ˈmjuːzɪk/.',
      'Practice full sentence rhythm.'
    ]
  },
  {
    id: 'A2-008',
    sentence: 'I didn\'t like the movie we watched.',
    band: 'A2',
    exampleErrors: ['I don\'t liked the movie', 'I didn\'t like the moovy we watsh', 'I... didn\'t... uh... like... the... movie... we... watched'],
    feedback: [
      '"Didn\'t" is already past; keep verb in base form: "like," not "liked."',
      'Work on the /v/ and /ʧ/ sounds.',
      'Try saying the sentence more fluidly.'
    ]
  },
  {
    id: 'A2-009',
    sentence: 'There are many people at the station.',
    band: 'A2',
    exampleErrors: ['There is many people', 'Der are many pipol at the stashion', 'There... are... uh... many... people... at... the... station'],
    feedback: [
      'Use "are" for plural: "There are many people."',
      'Practice "people" as /ˈpiːpəl/, and "station" with the /ʃ/ sound.',
      'Avoid breaking the sentence into word-by-word pauses.'
    ]
  },
  {
    id: 'A2-010',
    sentence: 'I have never been on a plane before.',
    band: 'A2',
    exampleErrors: ['I never been on plane', 'I have never bin on a plan', 'I... have... never... been... on... uh... a... plane'],
    feedback: [
      'Use full present perfect structure: "have been."',
      '"Plane" should rhyme with "rain."',
      'Read with confidence and less pausing.'
    ]
  },
  {
    id: 'A2-011',
    sentence: 'She needs to buy a birthday gift for her friend.',
    band: 'A2',
    exampleErrors: ['She need buy birthday gift for friend', 'She needs to buy a birtday gif for her frand', 'She... needs... uh... to... buy... a... birthday... gift...'],
    feedback: [
      'Don\'t forget to say "needs" for third person.',
      '"Birthday" needs clear /θ/, and "gift" should end with /t/, not /f/.',
      'Keep phrases grouped naturally.'
    ]
  },
  {
    id: 'A2-012',
    sentence: 'We usually take the bus to work in the morning.',
    band: 'A2',
    exampleErrors: ['We usual take bus to work', 'We usually take the bazz to work', 'We... usually... take... uh... the... bus... to... work...'],
    feedback: [
      'Use "usually" (not "usual") and include "the."',
      'Pronounce "bus" as /bʌs/, not "buzz" or "bazz."',
      'Say the whole sentence with better flow and pitch.'
    ]
  },
  {
    id: 'A2-013',
    sentence: 'He told me an interesting story last night.',
    band: 'A2',
    exampleErrors: ['He tell me interesting story last night', 'He told me an intresting story', 'He... told... me... uh... an... story... last... night'],
    feedback: [
      '"Told" is past; good. Don\'t forget "an" before vowel sounds.',
      '"Interesting" should have at least three clear syllables: /ˈɪn.trəs.tɪŋ/.',
      'Avoid mid-sentence pauses.'
    ]
  },
  {
    id: 'A2-014',
    sentence: 'I don\'t like eating alone at restaurants.',
    band: 'A2',
    exampleErrors: ['I no like eat alone in restaurant', 'I don\'t like eating a-lawn at restront', 'I... don\'t... like... eating... uh... alone...'],
    feedback: [
      'Use "don\'t like eating," not "no like eat."',
      'Work on pronouncing "alone" and "restaurant" clearly.',
      'Practice saying this in one fluid phrase.'
    ]
  },
  {
    id: 'A2-015',
    sentence: 'My younger brother is afraid of the dark.',
    band: 'A2',
    exampleErrors: ['My young brother afraid from dark', 'My younger broder is afrad of the dark', 'My... younger... brother... is... um... afraid...'],
    feedback: [
      '"Afraid of," not "afraid from."',
      '"Brother" needs clear /ð/, not /d/.',
      'Say it in smoother rhythm, not one word at a time.'
    ]
  }
];

// B1, B2, C1 sentence banks would follow similar patterns
// For now, creating placeholder banks to meet the minimum requirement
export const b1Sentences: ReadAloudSentence[] = [
  { id: 'B1-001', sentence: 'Although it was raining heavily, we decided to continue our hike.', band: 'B1' },
  { id: 'B1-002', sentence: 'The conference will be postponed until further notice.', band: 'B1' },
  { id: 'B1-003', sentence: 'She has been working as a nurse for over ten years.', band: 'B1' },
  // Add more B1 sentences...
];

export const b2Sentences: ReadAloudSentence[] = [
  { id: 'B2-001', sentence: 'The implications of climate change on global agriculture are far-reaching and complex.', band: 'B2' },
  { id: 'B2-002', sentence: 'Despite numerous challenges, the project was completed within the allocated timeframe.', band: 'B2' },
  { id: 'B2-003', sentence: 'The government\'s implementation of new policies has resulted in significant economic improvements.', band: 'B2' },
  // Add more B2 sentences...
];

export const c1Sentences: ReadAloudSentence[] = [
  { id: 'C1-001', sentence: 'The unprecedented technological advancements have fundamentally transformed contemporary society.', band: 'C1' },
  { id: 'C1-002', sentence: 'Researchers are investigating the correlation between social media usage and psychological well-being.', band: 'C1' },
  { id: 'C1-003', sentence: 'The intricate relationship between economic policy and environmental sustainability requires careful consideration.', band: 'C1' },
  // Add more C1 sentences...
];

export const allSentences: ReadAloudSentence[] = [
  ...a1Sentences,
  ...a2Sentences,
  ...b1Sentences,
  ...b2Sentences,
  ...c1Sentences
];

export const getSentencesByBand = (band: 'A1' | 'A2' | 'B1' | 'B2' | 'C1'): ReadAloudSentence[] => {
  return allSentences.filter(sentence => sentence.band === band);
};