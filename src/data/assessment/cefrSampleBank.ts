/**
 * CEFR Sample Bank
 * Curated samples for each CEFR level to serve as benchmarks for assessment
 */

import { CEFRSample } from '../../types/assessment';

export const cefrSampleBank: { [key: string]: CEFRSample } = {
  // Q1 – Self Introduction
  'q1_a1': {
    id: 'q1_a1',
    promptId: 'q1',
    level: 'A1',
    transcript: "My name is Ali. A-L-I. I am 20 years. I live Egypt. I student. I not married.",
    scores: {
      vocabulary: 2,
      grammar: 2,
      coherence: 2,
      lexicalCollocation: 1,
      taskAchievement: 6
    },
    finalCEFR: 'A1',
    rationale: 'Sentence-level attempts with significant grammatical and lexical gaps. Basic meaning is conveyed but with low linguistic control.',
    lexicalFeatures: ['name', 'years', 'student'],
    grammarFeatures: ['be-verb errors', 'missing articles'],
    discourseMarkers: []
  },
  'q1_a2': {
    id: 'q1_a2',
    promptId: 'q1',
    level: 'A2',
    transcript: "Hello, my name is Ali, spelled A-L-I. I'm 20 years old and I come from Egypt. Now I live in Cairo with my family. I study economics at university and I am single.",
    scores: {
      vocabulary: 4,
      grammar: 6,
      coherence: 5,
      lexicalCollocation: 5,
      taskAchievement: 8
    },
    finalCEFR: 'A2',
    rationale: 'Solid A2 production. Slightly robotic but accurate, with full coverage of expected content.',
    lexicalFeatures: ['economics', 'university', 'single'],
    grammarFeatures: ['present tenses', 'minor slips'],
    discourseMarkers: ['and', 'now']
  },
  'q1_b1': {
    id: 'q1_b1',
    promptId: 'q1',
    level: 'B1',
    transcript: "Hi, my name is Ali — that's A-L-I. I'm 20 years old and I'm originally from Egypt, but I currently live in Cairo. I'm studying economics at the university and I'm single at the moment. I also work part-time in a bookstore.",
    scores: {
      vocabulary: 6,
      grammar: 7,
      coherence: 7,
      lexicalCollocation: 6,
      taskAchievement: 10
    },
    finalCEFR: 'B1',
    rationale: 'Adequate development and accurate forms. Some lexical ambition. Appropriately fluent for B1.',
    lexicalFeatures: ['currently', 'originally', 'part-time'],
    grammarFeatures: ['present continuous', 'compound sentences'],
    discourseMarkers: ['but', 'also', 'at the moment']
  },
  'q1_b2': {
    id: 'q1_b2',
    promptId: 'q1',
    level: 'B2',
    transcript: "My full name is Ali Mansour, spelled A-L-I M-A-N-S-O-U-R. I'm 20 years old and I'm from Alexandria, Egypt, where I've lived all my life. I'm currently an undergraduate student majoring in economics, and I work part-time in a local bookstore. As for my marital status, I'm single.",
    scores: {
      vocabulary: 8,
      grammar: 9,
      coherence: 9,
      lexicalCollocation: 8,
      taskAchievement: 10
    },
    finalCEFR: 'B2',
    rationale: 'Excellent clarity and command. Slightly rehearsed tone, but structurally accurate and appropriate.',
    lexicalFeatures: ['undergraduate', 'majoring', 'marital status'],
    grammarFeatures: ['mix of tenses', 'embedded clauses'],
    discourseMarkers: ['where', 'as for']
  },
  'q1_c1': {
    id: 'q1_c1',
    promptId: 'q1',
    level: 'C1',
    transcript: "Let me introduce myself — I'm Ali Mansour, that's spelled A-L-I M-A-N-S-O-U-R. I'm a 20-year-old Egyptian currently residing in Cairo. I'm pursuing a degree in economics at the American University and balancing my studies with part-time work in retail. I'm unmarried at this stage of my life.",
    scores: {
      vocabulary: 9,
      grammar: 9,
      coherence: 9,
      lexicalCollocation: 9,
      taskAchievement: 10
    },
    finalCEFR: 'C1',
    rationale: 'Advanced command with sophisticated phrasing and variety. Native-like phrasing in parts, strong sense of discourse.',
    lexicalFeatures: ['residing', 'pursuing a degree', 'balancing'],
    grammarFeatures: ['participial phrases', 'compound-complex structure'],
    discourseMarkers: ['currently', 'at this stage']
  },

  // Q3 – Introduce Your Family
  'q3_a1': {
    id: 'q3_a1',
    promptId: 'q3',
    level: 'A1',
    transcript: "I have mother and father. My mother is nice. My father work. I have one sister. No children.",
    scores: {
      vocabulary: 3,
      grammar: 2,
      coherence: 3,
      lexicalCollocation: 3,
      taskAchievement: 6
    },
    finalCEFR: 'A1',
    rationale: 'Meets the bare minimum for A1. Unconnected ideas and multiple grammatical gaps reduce clarity.',
    lexicalFeatures: ['mother', 'father', 'sister'],
    grammarFeatures: ['be-verb issues', 'missing plural forms'],
    discourseMarkers: []
  },
  'q3_a2': {
    id: 'q3_a2',
    promptId: 'q3',
    level: 'A2',
    transcript: "My family is small. I live with my mother and father. My mother is a teacher and my father is retired. I also have one brother. He is 10 years old. I don't have children.",
    scores: {
      vocabulary: 4,
      grammar: 6,
      coherence: 5,
      lexicalCollocation: 5,
      taskAchievement: 8
    },
    finalCEFR: 'A2',
    rationale: 'A2 level with solid control of structures. Some repetition and simplicity, but clear communication.',
    lexicalFeatures: ['teacher', 'retired', 'brother'],
    grammarFeatures: ['present simple', 'mostly accurate'],
    discourseMarkers: ['also']
  },
  'q3_b1': {
    id: 'q3_b1',
    promptId: 'q3',
    level: 'B1',
    transcript: "I come from a small family. My parents both live in Cairo — my mother is a teacher and my father works in IT. I also have an older sister who is studying medicine. I don't have any children, but I love spending time with my niece.",
    scores: {
      vocabulary: 6,
      grammar: 7,
      coherence: 7,
      lexicalCollocation: 6,
      taskAchievement: 10
    },
    finalCEFR: 'B1',
    rationale: 'Well-rounded response that expands meaningfully. Natural speech patterns at B1.',
    lexicalFeatures: ['niece', 'studying medicine', 'works in IT'],
    grammarFeatures: ['control over tenses', 'clauses'],
    discourseMarkers: ['but', 'also']
  },
  'q3_b2': {
    id: 'q3_b2',
    promptId: 'q3',
    level: 'B2',
    transcript: "My family consists of four people. My father works as a systems engineer, and my mother manages a small clothing store. I also have one younger brother who's in high school. I don't have children myself, but I'm very close to my cousins and often help babysit their kids.",
    scores: {
      vocabulary: 7,
      grammar: 8,
      coherence: 8,
      lexicalCollocation: 8,
      taskAchievement: 10
    },
    finalCEFR: 'B2',
    rationale: 'Strong lexical control and natural development of all task elements. Clear B2 performance.',
    lexicalFeatures: ['systems engineer', 'manages', 'babysit'],
    grammarFeatures: ['complex sentence structures', 'participle use'],
    discourseMarkers: ['also', 'but']
  },
  'q3_c1': {
    id: 'q3_c1',
    promptId: 'q3',
    level: 'C1',
    transcript: "I come from a tight-knit nuclear family. My mother is a retired lecturer and my father, who used to work in finance, now spends most of his time volunteering. I have two siblings — a younger brother who's an engineer and a sister currently pursuing her master's degree abroad. I'm not a parent myself, but I'm actively involved in my godson's upbringing.",
    scores: {
      vocabulary: 9,
      grammar: 9,
      coherence: 9,
      lexicalCollocation: 9,
      taskAchievement: 10
    },
    finalCEFR: 'C1',
    rationale: 'Sophisticated structure and idiomatic phrasing. Clearly well above B2 threshold in development and control.',
    lexicalFeatures: ['tight-knit', 'retired lecturer', 'actively involved', 'godson'],
    grammarFeatures: ['complex embedded clauses', 'correct modifier use'],
    discourseMarkers: ['who', 'currently']
  },

  // Q4 – Daily routine
  'q4_a1': {
    id: 'q4_a1',
    promptId: 'q4',
    level: 'A1',
    transcript: "I wake up. I eat. I go work. I sleep. I watch TV. Every day same.",
    scores: {
      vocabulary: 2,
      grammar: 2,
      coherence: 2,
      lexicalCollocation: 2,
      taskAchievement: 5
    },
    finalCEFR: 'A1',
    rationale: 'Minimal communication, word-level fluency, major accuracy and structural issues.',
    lexicalFeatures: ['wake up', 'eat', 'sleep'],
    grammarFeatures: ['missing articles/prepositions', 'incorrect verb use'],
    discourseMarkers: []
  },
  'q4_a2': {
    id: 'q4_a2',
    promptId: 'q4',
    level: 'A2',
    transcript: "I usually wake up at 7. I eat breakfast, then I go to work at 8. After work, I go home and have dinner. I watch TV and sleep at 10.",
    scores: {
      vocabulary: 4,
      grammar: 6,
      coherence: 5,
      lexicalCollocation: 5,
      taskAchievement: 8
    },
    finalCEFR: 'A2',
    rationale: 'Logical sequence, few errors, limited variety but all expected information is there.',
    lexicalFeatures: ['breakfast', 'dinner', 'usually'],
    grammarFeatures: ['mostly correct present simple'],
    discourseMarkers: ['then', 'after']
  },
  'q4_b1': {
    id: 'q4_b1',
    promptId: 'q4',
    level: 'B1',
    transcript: "On weekdays, I usually wake up around 6:30 and go for a short run. I take a shower, have a quick breakfast, and head to work by 8. In the evening, I cook dinner and relax by watching a movie or reading. I usually go to bed by 11.",
    scores: {
      vocabulary: 6,
      grammar: 7,
      coherence: 7,
      lexicalCollocation: 6,
      taskAchievement: 10
    },
    finalCEFR: 'B1',
    rationale: 'Good B1 fluency and structure, though not highly complex. All routine steps clearly stated.',
    lexicalFeatures: ['quick breakfast', 'head to work'],
    grammarFeatures: ['accurate present simple', 'some use of adverbs'],
    discourseMarkers: ['on weekdays', 'in the evening']
  },
  'q4_b2': {
    id: 'q4_b2',
    promptId: 'q4',
    level: 'B2',
    transcript: "My daily routine starts early. I get up at 6:30 and usually go for a run if the weather is nice. After showering, I make breakfast and catch up on the news while eating. I leave for the office at 8:30. Evenings are more relaxed — I either cook dinner, meet friends, or unwind with a book. I aim to be in bed by 11.",
    scores: {
      vocabulary: 7,
      grammar: 8,
      coherence: 8,
      lexicalCollocation: 8,
      taskAchievement: 10
    },
    finalCEFR: 'B2',
    rationale: 'Fluent, organized, and enriched with lexical variety. Routine is realistic and appropriately varied.',
    lexicalFeatures: ['catch up on the news', 'unwind', 'aim to'],
    grammarFeatures: ['variety of present structures', 'conditional clause'],
    discourseMarkers: ['if', 'either...or']
  },
  'q4_c1': {
    id: 'q4_c1',
    promptId: 'q4',
    level: 'C1',
    transcript: "Typically, I start my day around 6:30 with some light stretching or a quick jog, depending on my energy level. I prepare a healthy breakfast and skim through a few headlines before heading to work by 8:30. My workday is packed, but I try to take a walk during lunch. In the evening, I either meet friends, catch up on reading, or work on personal projects. I wind down by journaling and go to bed around 11.",
    scores: {
      vocabulary: 9,
      grammar: 9,
      coherence: 9,
      lexicalCollocation: 9,
      taskAchievement: 10
    },
    finalCEFR: 'C1',
    rationale: 'Clear command of discourse, cohesive organization, and natural fluency with embedded nuance.',
    lexicalFeatures: ['skim through', 'wind down', 'depending on my energy level'],
    grammarFeatures: ['perfect use of adverbials', 'modifiers', 'participial phrases'],
    discourseMarkers: ['typically', 'depending on', 'either...or']
  },

  // Q5 – What did you do yesterday or on your last day off?
  'q5_a1': {
    id: 'q5_a1',
    promptId: 'q5',
    level: 'A1',
    transcript: "I go shopping. I eat pizza. I sleep. I happy.",
    scores: {
      vocabulary: 2,
      grammar: 2,
      coherence: 2,
      lexicalCollocation: 2,
      taskAchievement: 4
    },
    finalCEFR: 'A1',
    rationale: 'Response is functional at word/phrase level but lacks control of tense and structure.',
    lexicalFeatures: ['shopping', 'pizza', 'sleep'],
    grammarFeatures: ['incorrect tense usage', 'missing articles'],
    discourseMarkers: []
  },
  'q5_a2': {
    id: 'q5_a2',
    promptId: 'q5',
    level: 'A2',
    transcript: "Yesterday, I went to the mall with my sister. We bought some clothes and had lunch there. After that, I came home and watched TV. It was a nice day.",
    scores: {
      vocabulary: 4,
      grammar: 6,
      coherence: 5,
      lexicalCollocation: 5,
      taskAchievement: 8
    },
    finalCEFR: 'A2',
    rationale: 'Shows A2 control of past tense and ability to sequence events. Slightly repetitive but comprehensible.',
    lexicalFeatures: ['mall', 'bought', 'clothes', 'lunch'],
    grammarFeatures: ['past simple', 'generally accurate'],
    discourseMarkers: ['after that', 'and']
  },
  'q5_b1': {
    id: 'q5_b1',
    promptId: 'q5',
    level: 'B1',
    transcript: "On my last day off, I visited my grandparents in the countryside. We spent the afternoon cooking together and talking about old memories. In the evening, I helped them clean the garden, then I took the train back home. It was tiring but very rewarding.",
    scores: {
      vocabulary: 6,
      grammar: 7,
      coherence: 7,
      lexicalCollocation: 6,
      taskAchievement: 10
    },
    finalCEFR: 'B1',
    rationale: 'Well-organized and fluent for B1. Natural variety, fully relevant to the task.',
    lexicalFeatures: ['visited', 'countryside', 'rewarding', 'memories'],
    grammarFeatures: ['past simple', 'past continuous control'],
    discourseMarkers: ['in the evening', 'then', 'but']
  },
  'q5_b2': {
    id: 'q5_b2',
    promptId: 'q5',
    level: 'B2',
    transcript: "Yesterday, I took the opportunity to completely unplug from work. I went for a hike in the nearby hills, had lunch at a small café, and then spent the rest of the afternoon reading. In the evening, I watched a documentary and prepared for the upcoming week. It was a refreshing break.",
    scores: {
      vocabulary: 7,
      grammar: 8,
      coherence: 8,
      lexicalCollocation: 8,
      taskAchievement: 10
    },
    finalCEFR: 'B2',
    rationale: 'Highly coherent response with nuanced vocabulary and tense accuracy. Clear B2 complexity.',
    lexicalFeatures: ['unplug', 'refreshing break', 'upcoming week', 'documentary'],
    grammarFeatures: ['fluent past narration', 'accurate tenses'],
    discourseMarkers: ['in the evening', 'then', 'and']
  },
  'q5_c1': {
    id: 'q5_c1',
    promptId: 'q5',
    level: 'C1',
    transcript: "On my most recent day off, I deliberately avoided digital distractions. I started my morning with some journaling and meditation, followed by a long walk in the park. In the afternoon, I attended a virtual seminar on behavioral psychology, then wrapped up the day by cooking dinner for my family. It was a calm but intellectually fulfilling day.",
    scores: {
      vocabulary: 9,
      grammar: 9,
      coherence: 9,
      lexicalCollocation: 9,
      taskAchievement: 10
    },
    finalCEFR: 'C1',
    rationale: 'Sophisticated and expressive with precise language, excellent discourse structure, and varied activities.',
    lexicalFeatures: ['deliberately', 'intellectually fulfilling', 'behavioral psychology', 'virtual seminar'],
    grammarFeatures: ['varied clause types', 'perfect past narration'],
    discourseMarkers: ['followed by', 'in the afternoon', 'then']
  },

  // Q6 – What are you going to do this week?
  'q6_a1': {
    id: 'q6_a1',
    promptId: 'q6',
    level: 'A1',
    transcript: "I go school. I going to work. I meet my friend. I eat pizza.",
    scores: {
      vocabulary: 2,
      grammar: 2,
      coherence: 2,
      lexicalCollocation: 2,
      taskAchievement: 5
    },
    finalCEFR: 'A1',
    rationale: 'Intentions expressed at word level, but grammar control and clarity are very limited.',
    lexicalFeatures: ['school', 'work', 'friend', 'pizza'],
    grammarFeatures: ['incorrect structure', 'missing articles', 'incomplete future forms'],
    discourseMarkers: []
  },
  'q6_a2': {
    id: 'q6_a2',
    promptId: 'q6',
    level: 'A2',
    transcript: "This week I'm going to work every day. On Wednesday, I'm going to visit my cousin. I also want to go shopping on the weekend.",
    scores: {
      vocabulary: 4,
      grammar: 6,
      coherence: 5,
      lexicalCollocation: 5,
      taskAchievement: 8
    },
    finalCEFR: 'A2',
    rationale: 'Future plans stated clearly using appropriate tenses. Simple but accurate.',
    lexicalFeatures: ['visit', 'cousin', 'shopping', 'weekend'],
    grammarFeatures: ['going to forms', 'mostly correct'],
    discourseMarkers: ['on Wednesday', 'also', 'on the weekend']
  },
  'q6_b1': {
    id: 'q6_b1',
    promptId: 'q6',
    level: 'B1',
    transcript: "This week is going to be quite busy. I'm working full-time from Monday to Friday, but I'm planning to visit my grandparents on Saturday. On Sunday, I'll probably stay home and clean the apartment or watch a movie.",
    scores: {
      vocabulary: 6,
      grammar: 7,
      coherence: 7,
      lexicalCollocation: 6,
      taskAchievement: 10
    },
    finalCEFR: 'B1',
    rationale: 'Well-rounded B1 response. Slight repetition but grammatically accurate and structured.',
    lexicalFeatures: ['quite busy', 'probably', 'stay home', 'apartment'],
    grammarFeatures: ['be going to', 'will', 'present continuous'],
    discourseMarkers: ['but', 'on Saturday', 'on Sunday', 'or']
  },
  'q6_b2': {
    id: 'q6_b2',
    promptId: 'q6',
    level: 'B2',
    transcript: "This week, I've got several commitments lined up. I'm going to start a new online course on marketing, and I've scheduled a few client meetings for midweek. I'm also planning to meet some friends on Friday night. Over the weekend, I'll try to relax and spend some time with my family.",
    scores: {
      vocabulary: 7,
      grammar: 8,
      coherence: 8,
      lexicalCollocation: 8,
      taskAchievement: 10
    },
    finalCEFR: 'B2',
    rationale: 'Organized and confident B2 response, varied vocabulary and tense usage, clear timeline.',
    lexicalFeatures: ['commitments lined up', 'scheduled', 'try to relax', 'online course'],
    grammarFeatures: ['strong control of future structures', 'modals'],
    discourseMarkers: ['and', 'also', 'over the weekend']
  },
  'q6_c1': {
    id: 'q6_c1',
    promptId: 'q6',
    level: 'C1',
    transcript: "This week is shaping up to be quite productive. I'm kicking things off with a team strategy meeting on Monday, followed by two client presentations midweek. In the evenings, I plan to continue working on my thesis, and I've also penciled in time for the gym. Over the weekend, I'll either take a short trip to the coast or catch up on reading. It depends on how the week goes.",
    scores: {
      vocabulary: 9,
      grammar: 9,
      coherence: 9,
      lexicalCollocation: 9,
      taskAchievement: 10
    },
    finalCEFR: 'C1',
    rationale: 'Sophisticated delivery with idiomatic expressions, strong narrative coherence, and excellent structural control.',
    lexicalFeatures: ['shaping up', 'penciled in', 'kick off', 'depends on', 'catch up on'],
    grammarFeatures: ['mixed future structures', 'conditionals'],
    discourseMarkers: ['followed by', 'in the evenings', 'either...or', 'it depends on']
  },

  // Q7 – How will your life be different in the next 10 years?
  'q7_a1': {
    id: 'q7_a1',
    promptId: 'q7',
    level: 'A1',
    transcript: "I be rich. I have big car. I no work. I happy. I play football.",
    scores: {
      vocabulary: 2,
      grammar: 2,
      coherence: 2,
      lexicalCollocation: 2,
      taskAchievement: 3
    },
    finalCEFR: 'A1',
    rationale: 'Poor accuracy and task development. Fragmented list of desires rather than a projection.',
    lexicalFeatures: ['rich', 'car', 'work', 'happy', 'football'],
    grammarFeatures: ['no correct tense forms', 'missing verbs', 'missing articles'],
    discourseMarkers: []
  },
  'q7_a2': {
    id: 'q7_a2',
    promptId: 'q7',
    level: 'A2',
    transcript: "In ten years, I think I will have a job and maybe a family. I will live in a nice house and work as an engineer. I want to travel to different countries also.",
    scores: {
      vocabulary: 4,
      grammar: 6,
      coherence: 5,
      lexicalCollocation: 5,
      taskAchievement: 8
    },
    finalCEFR: 'A2',
    rationale: 'Uses basic future speculation with moderate control. Sentence transitions could improve.',
    lexicalFeatures: ['job', 'family', 'engineer', 'travel', 'countries'],
    grammarFeatures: ['will-future correctly applied'],
    discourseMarkers: ['in ten years', 'maybe', 'also']
  },
  'q7_b1': {
    id: 'q7_b1',
    promptId: 'q7',
    level: 'B1',
    transcript: "In the next ten years, I hope to be working in my field and living in a different country. I think I'll have more responsibilities, maybe even a family. I also want to improve my English so I can work internationally.",
    scores: {
      vocabulary: 6,
      grammar: 7,
      coherence: 7,
      lexicalCollocation: 7,
      taskAchievement: 10
    },
    finalCEFR: 'B1',
    rationale: 'Clear, realistic prediction with cohesive ideas. Shows moderate variety and logical development.',
    lexicalFeatures: ['working in my field', 'responsibilities', 'internationally', 'improve'],
    grammarFeatures: ['will', 'hope to', 'future continuous'],
    discourseMarkers: ['in the next ten years', 'maybe even', 'I also', 'so I can']
  },
  'q7_b2': {
    id: 'q7_b2',
    promptId: 'q7',
    level: 'B2',
    transcript: "A decade from now, I imagine my life will look quite different. I expect to be working in a leadership position, possibly in a different country. I'll probably have a family by then, and I hope to be financially independent. I also plan to dedicate more time to personal growth, like learning languages and volunteering.",
    scores: {
      vocabulary: 7,
      grammar: 8,
      coherence: 8,
      lexicalCollocation: 8,
      taskAchievement: 10
    },
    finalCEFR: 'B2',
    rationale: 'Complex, abstract thoughts articulated clearly with strong future grammar use.',
    lexicalFeatures: ['leadership position', 'financially independent', 'personal growth', 'dedicate', 'volunteering'],
    grammarFeatures: ['modal verbs', 'future continuous', 'gerund phrases'],
    discourseMarkers: ['a decade from now', 'possibly', 'by then', 'I also', 'like']
  },
  'q7_c1': {
    id: 'q7_c1',
    promptId: 'q7',
    level: 'C1',
    transcript: "In ten years, I anticipate living abroad and having advanced significantly in my career. Ideally, I'll be managing a team or running my own company, focusing on projects I find meaningful. On a personal level, I expect to have a family and a better work–life balance. I also hope to be contributing to social causes, perhaps through mentoring or charity work. Life will be more structured, but hopefully more fulfilling as well.",
    scores: {
      vocabulary: 9,
      grammar: 9,
      coherence: 9,
      lexicalCollocation: 9,
      taskAchievement: 10
    },
    finalCEFR: 'C1',
    rationale: 'Advanced abstraction and reflection, mature tone, and wide syntactic range. Clear C1 fluency.',
    lexicalFeatures: ['anticipate', 'advanced significantly', 'mentoring', 'fulfilling', 'contributing to social causes'],
    grammarFeatures: ['modal verbs', 'complex conditionals', 'future perfect', 'future continuous'],
    discourseMarkers: ['ideally', 'on a personal level', 'perhaps', 'but hopefully', 'as well']
  },

  // Q8 – Describe the appearance and personality of your best friend
  'q8_a1': {
    id: 'q8_a1',
    promptId: 'q8',
    level: 'A1',
    transcript: "My friend is nice. He is tall. He has black hair. He is good. He is funny. I like him.",
    scores: {
      vocabulary: 2,
      grammar: 3,
      coherence: 2,
      lexicalCollocation: 2,
      taskAchievement: 5
    },
    finalCEFR: 'A1',
    rationale: 'Simple adjective listing. Meaningful but lacks elaboration and range.',
    lexicalFeatures: ['nice', 'tall', 'black hair', 'good', 'funny'],
    grammarFeatures: ['present simple correctly used', 'repetitive structure'],
    discourseMarkers: []
  },
  'q8_a2': {
    id: 'q8_a2',
    promptId: 'q8',
    level: 'A2',
    transcript: "My best friend is short and has curly brown hair. She wears glasses and usually wears jeans and T-shirts. She is friendly and always helps me when I have problems. We laugh a lot together.",
    scores: {
      vocabulary: 4,
      grammar: 6,
      coherence: 5,
      lexicalCollocation: 5,
      taskAchievement: 8
    },
    finalCEFR: 'A2',
    rationale: 'Descriptive, accurate, and linked to real-life behavior. Still mostly simple forms.',
    lexicalFeatures: ['curly', 'friendly', 'laugh a lot', 'helps', 'problems'],
    grammarFeatures: ['present simple', 'modifiers used correctly', 'adverbs'],
    discourseMarkers: ['and', 'usually', 'always', 'when']
  },
  'q8_b1': {
    id: 'q8_b1',
    promptId: 'q8',
    level: 'B1',
    transcript: "My best friend is a tall guy with short dark hair and a very athletic build. He usually wears casual clothes and has a big smile that makes people feel comfortable. Personality-wise, he's outgoing, honest, and always makes jokes. We've been friends for years, and I really admire how confident and caring he is.",
    scores: {
      vocabulary: 6,
      grammar: 7,
      coherence: 7,
      lexicalCollocation: 6,
      taskAchievement: 10
    },
    finalCEFR: 'B1',
    rationale: 'Well-developed and relevant. Mixes physical and emotional traits fluently.',
    lexicalFeatures: ['athletic build', 'outgoing', 'confident', 'caring', 'admire'],
    grammarFeatures: ['adjectives', 'modifiers', 'present perfect', 'relative clauses'],
    discourseMarkers: ['personality-wise', 'and', 'how']
  },
  'q8_b2': {
    id: 'q8_b2',
    promptId: 'q8',
    level: 'B2',
    transcript: "My best friend has a slim build, wavy shoulder-length hair, and a warm smile that immediately puts people at ease. She tends to dress creatively, always adding a personal touch to her outfits. What I appreciate most is her sense of empathy—she's a great listener, incredibly supportive, and knows how to lift my mood when I'm down.",
    scores: {
      vocabulary: 8,
      grammar: 8,
      coherence: 8,
      lexicalCollocation: 8,
      taskAchievement: 10
    },
    finalCEFR: 'B2',
    rationale: 'Balanced structure, emotional nuance, and fluent language control.',
    lexicalFeatures: ['shoulder-length', 'empathetic', 'personal touch', 'supportive', 'lift my mood'],
    grammarFeatures: ['descriptive clauses', 'adverbials', 'complex sentences'],
    discourseMarkers: ['what I appreciate most', 'always', 'when I\'m down']
  },
  'q8_c1': {
    id: 'q8_c1',
    promptId: 'q8',
    level: 'C1',
    transcript: "My closest friend is someone who immediately stands out, not just because of his striking appearance—tall, lean, with sharp features and expressive eyes—but also due to his magnetic personality. He has a dry sense of humor, is exceptionally articulate, and maintains a calm presence even under stress. I particularly value his emotional intelligence and the way he engages in meaningful conversations without ever being judgmental.",
    scores: {
      vocabulary: 9,
      grammar: 9,
      coherence: 9,
      lexicalCollocation: 9,
      taskAchievement: 10
    },
    finalCEFR: 'C1',
    rationale: 'Deep description with mature language, varied structure, and a high level of control.',
    lexicalFeatures: ['striking appearance', 'magnetic personality', 'articulate', 'judgmental', 'emotional intelligence'],
    grammarFeatures: ['clause embedding', 'sophisticated modifiers', 'complex sentence structures'],
    discourseMarkers: ['not just...but also', 'particularly', 'even under', 'without ever being']
  },

  // Q9 – Have you ever borrowed money from someone? Why?
  'q9_a1': {
    id: 'q9_a1',
    promptId: 'q9',
    level: 'A1',
    transcript: "Yes, I borrow money. My friend give me. I need buy phone. I pay later.",
    scores: {
      vocabulary: 2,
      grammar: 2,
      coherence: 2,
      lexicalCollocation: 2,
      taskAchievement: 3
    },
    finalCEFR: 'A1',
    rationale: 'Communicates the idea, but heavily flawed grammar and lack of tenses impair clarity.',
    lexicalFeatures: ['borrow', 'money', 'friend', 'phone', 'pay'],
    grammarFeatures: ['incorrect verb forms', 'no past or present perfect', 'missing articles'],
    discourseMarkers: []
  },
  'q9_a2': {
    id: 'q9_a2',
    promptId: 'q9',
    level: 'A2',
    transcript: "Yes, I borrowed money last year from my brother. I wanted to buy a new laptop for school. He helped me, and I paid him back after two months.",
    scores: {
      vocabulary: 4,
      grammar: 6,
      coherence: 5,
      lexicalCollocation: 5,
      taskAchievement: 8
    },
    finalCEFR: 'A2',
    rationale: 'Functional, accurate, with clear time reference and context.',
    lexicalFeatures: ['borrowed', 'paid back', 'laptop', 'helped', 'months'],
    grammarFeatures: ['past simple correctly used', 'clear structure'],
    discourseMarkers: ['last year', 'and', 'after']
  },
  'q9_b1': {
    id: 'q9_b1',
    promptId: 'q9',
    level: 'B1',
    transcript: "Yes, I have borrowed money a couple of times. Once, I needed help covering rent when I lost my job, and another time was for unexpected car repairs. Both times, I returned the money quickly. I really appreciated the support during difficult moments.",
    scores: {
      vocabulary: 6,
      grammar: 7,
      coherence: 7,
      lexicalCollocation: 6,
      taskAchievement: 10
    },
    finalCEFR: 'B1',
    rationale: 'Clear examples, past reasoning, and reflection show solid B1 competence.',
    lexicalFeatures: ['covering rent', 'unexpected repairs', 'appreciated the support', 'difficult moments'],
    grammarFeatures: ['present perfect', 'past simple', 'relative clauses'],
    discourseMarkers: ['once', 'another time', 'both times', 'during']
  },
  'q9_b2': {
    id: 'q9_b2',
    promptId: 'q9',
    level: 'B2',
    transcript: "I have borrowed money a few times in the past, mostly due to emergencies. One specific situation was when my laptop broke right before final exams, and I couldn't afford to buy a new one immediately. A friend lent me the money, and I made sure to repay her within a month. It was a stressful situation, but I learned to manage my finances better afterward.",
    scores: {
      vocabulary: 7,
      grammar: 8,
      coherence: 8,
      lexicalCollocation: 8,
      taskAchievement: 10
    },
    finalCEFR: 'B2',
    rationale: 'Fluent, logically structured response with personal reflection and accurate grammar.',
    lexicalFeatures: ['emergencies', 'afford', 'repay', 'manage my finances', 'stressful situation'],
    grammarFeatures: ['present perfect', 'past simple', 'conditional implications'],
    discourseMarkers: ['mostly due to', 'one specific situation', 'but', 'afterward']
  },
  'q9_c1': {
    id: 'q9_c1',
    promptId: 'q9',
    level: 'C1',
    transcript: "Yes, I have, although I generally avoid borrowing unless absolutely necessary. A few years ago, I faced an unexpected medical bill, and my savings weren't enough to cover the expense. A close colleague kindly offered to help, and I paid them back in installments over three months. The experience made me more mindful of financial planning and taught me to build an emergency fund.",
    scores: {
      vocabulary: 9,
      grammar: 9,
      coherence: 9,
      lexicalCollocation: 9,
      taskAchievement: 10
    },
    finalCEFR: 'C1',
    rationale: 'High-level lexical accuracy, sophisticated reasoning, and emotional maturity.',
    lexicalFeatures: ['absolutely necessary', 'installments', 'financial planning', 'emergency fund', 'mindful'],
    grammarFeatures: ['perfect tenses', 'complex sentence structure', 'conditionals'],
    discourseMarkers: ['although', 'unless', 'a few years ago', 'and', 'over three months']
  },

  // Q10 – Have you ever heard about a crime?
  'q10_a1': {
    id: 'q10_a1',
    promptId: 'q10',
    level: 'A1',
    transcript: "Yes, I hear crime. Man take bag. Police come. He go jail.",
    scores: {
      vocabulary: 2,
      grammar: 2,
      coherence: 2,
      lexicalCollocation: 2,
      taskAchievement: 3
    },
    finalCEFR: 'A1',
    rationale: 'Very basic lexical and grammatical output. Story structure is incomplete and lacks tense control.',
    lexicalFeatures: ['crime', 'man', 'bag', 'police', 'jail'],
    grammarFeatures: ['incorrect tense forms', 'poor sentence structure'],
    discourseMarkers: []
  },
  'q10_a2': {
    id: 'q10_a2',
    promptId: 'q10',
    level: 'A2',
    transcript: "Yes, I heard about a crime near my house last year. A man stole a phone from a woman in the street. People saw him and called the police. They caught him after five minutes.",
    scores: {
      vocabulary: 4,
      grammar: 6,
      coherence: 5,
      lexicalCollocation: 5,
      taskAchievement: 8
    },
    finalCEFR: 'A2',
    rationale: 'A short but logically structured and grammatically sound narrative.',
    lexicalFeatures: ['stole', 'phone', 'caught', 'called the police'],
    grammarFeatures: ['accurate past simple use', 'clear sentence structure'],
    discourseMarkers: ['last year', 'and', 'after']
  },
  'q10_b1': {
    id: 'q10_b1',
    promptId: 'q10',
    level: 'B1',
    transcript: "Yes, I remember a case that happened two years ago in my neighborhood. Someone broke into a small shop at night and stole money and electronics. Fortunately, the police found the person using security camera footage. It made me feel unsafe for a while.",
    scores: {
      vocabulary: 6,
      grammar: 7,
      coherence: 7,
      lexicalCollocation: 7,
      taskAchievement: 10
    },
    finalCEFR: 'B1',
    rationale: 'Detailed and well-paced recount with proper tense usage and personal reflection.',
    lexicalFeatures: ['broke into', 'security footage', 'felt unsafe', 'electronics'],
    grammarFeatures: ['past simple', 'past continuous correctly used'],
    discourseMarkers: ['two years ago', 'fortunately', 'for a while']
  },
  'q10_b2': {
    id: 'q10_b2',
    promptId: 'q10',
    level: 'B2',
    transcript: "Yes, I read about a robbery at a local bank last year. The criminals managed to escape with a large amount of money and weren't caught for several weeks. The article explained how they planned the crime, using fake IDs and stolen vehicles. It was like something from a movie, and I was surprised such a thing could happen in my city.",
    scores: {
      vocabulary: 7,
      grammar: 8,
      coherence: 8,
      lexicalCollocation: 8,
      taskAchievement: 10
    },
    finalCEFR: 'B2',
    rationale: 'Strong storytelling, accurate tenses, idiomatic use of crime-related vocabulary.',
    lexicalFeatures: ['robbery', 'fake IDs', 'stolen vehicles', 'planned the crime', 'managed to escape'],
    grammarFeatures: ['past perfect', 'modals', 'passive voice'],
    discourseMarkers: ['and', 'for several weeks', 'it was like']
  },
  'q10_c1': {
    id: 'q10_c1',
    promptId: 'q10',
    level: 'C1',
    transcript: "Yes, I vividly remember a high-profile crime that occurred during my final year at university. A group of cybercriminals hacked into a local company's database and stole sensitive client information. The case received national attention because of the scale and sophistication of the breach. What shocked me most was that the perpetrators were never caught, which sparked a major debate about online security and law enforcement capabilities.",
    scores: {
      vocabulary: 9,
      grammar: 9,
      coherence: 9,
      lexicalCollocation: 9,
      taskAchievement: 10
    },
    finalCEFR: 'C1',
    rationale: 'Well-structured with detailed narrative and abstract reflection. Mature vocabulary and fluency.',
    lexicalFeatures: ['cybercriminals', 'sensitive data', 'sophistication', 'perpetrators', 'law enforcement capabilities'],
    grammarFeatures: ['clause embedding', 'passive voice', 'complex past tenses'],
    discourseMarkers: ['during my final year', 'because of', 'what shocked me most', 'which sparked']
  },

  // Q11 – How long have you been using the internet? And how?
  'q11_a1': {
    id: 'q11_a1',
    promptId: 'q11',
    level: 'A1',
    transcript: 'I use internet five years. I look YouTube. I chat. I like internet. It good.',
    scores: {
      vocabulary: 2,
      grammar: 2,
      coherence: 2,
      lexicalCollocation: 2,
      taskAchievement: 4
    },
    finalCEFR: 'A1',
    rationale: 'Low grammatical control and limited vocabulary. The idea is communicated at word level.',
    lexicalFeatures: ['internet', 'YouTube', 'chat', 'like', 'good'],
    grammarFeatures: ['missing auxiliary verbs', 'incorrect tense usage'],
    discourseMarkers: []
  },
  'q11_a2': {
    id: 'q11_a2',
    promptId: 'q11',
    level: 'A2',
    transcript: 'I have used the internet for about six years. I usually use it to watch videos, chat with friends, and check the news. I use my phone and sometimes my laptop.',
    scores: {
      vocabulary: 4,
      grammar: 6,
      coherence: 5,
      lexicalCollocation: 5,
      taskAchievement: 8
    },
    finalCEFR: 'A2',
    rationale: 'Fully on-topic, functional, and structurally sound for A2. Some repetition.',
    lexicalFeatures: ['watch videos', 'chat with friends', 'check the news', 'phone', 'laptop'],
    grammarFeatures: ['present perfect used correctly', 'clear structure'],
    discourseMarkers: ['for about', 'usually', 'and', 'sometimes']
  },
  'q11_b1': {
    id: 'q11_b1',
    promptId: 'q11',
    level: 'B1',
    transcript: "I've been using the internet for around ten years, mostly for entertainment and communication. I check my emails daily, use social media like Instagram and Facebook, and watch series on streaming platforms. It's also useful for online shopping and reading articles.",
    scores: {
      vocabulary: 6,
      grammar: 7,
      coherence: 7,
      lexicalCollocation: 6,
      taskAchievement: 10
    },
    finalCEFR: 'B1',
    rationale: 'Structured, varied, and fluent. Shows range in how the internet is used.',
    lexicalFeatures: ['streaming platforms', 'online shopping', 'reading articles', 'social media', 'entertainment'],
    grammarFeatures: ['present perfect continuous', 'routine tenses correctly used'],
    discourseMarkers: ['for around', 'mostly', 'daily', 'like', 'also']
  },
  'q11_b2': {
    id: 'q11_b2',
    promptId: 'q11',
    level: 'B2',
    transcript: "I've been actively using the internet for over 15 years. It plays a central role in my daily life—from managing emails and remote work to staying updated through podcasts and digital newspapers. I also take online courses and use cloud tools for collaboration. It's become almost impossible to function without it.",
    scores: {
      vocabulary: 8,
      grammar: 8,
      coherence: 8,
      lexicalCollocation: 8,
      taskAchievement: 10
    },
    finalCEFR: 'B2',
    rationale: 'Advanced vocabulary and clear examples support a highly relevant, detailed answer.',
    lexicalFeatures: ['cloud tools', 'collaboration', 'digital newspapers', 'remote work', 'managing emails'],
    grammarFeatures: ['present perfect', 'present simple usage', 'complex structures'],
    discourseMarkers: ['for over', 'from...to', 'also', 'it has become']
  },
  'q11_c1': {
    id: 'q11_c1',
    promptId: 'q11',
    level: 'C1',
    transcript: "I've been using the internet extensively for nearly two decades, both personally and professionally. I rely on it for remote collaboration, research, and staying connected with global events. I also use it as a learning tool—taking online certifications, reading academic papers, and attending webinars. Its integration into my workflow is so seamless that I rarely distinguish between 'online' and 'offline' activities anymore.",
    scores: {
      vocabulary: 9,
      grammar: 9,
      coherence: 9,
      lexicalCollocation: 9,
      taskAchievement: 10
    },
    finalCEFR: 'C1',
    rationale: 'Demonstrates digital fluency and high lexical sophistication. Clearly reflects C1-level competence.',
    lexicalFeatures: ['remote collaboration', 'certifications', 'integration', 'workflow', 'academic papers', 'webinars'],
    grammarFeatures: ['mastery of tense forms', 'embedded clauses', 'complex sentence structures'],
    discourseMarkers: ['for nearly', 'both...and', 'so...that', 'anymore']
  },

};

// Export individual functions for accessing samples
export const getSamplesByPrompt = (promptId: string): CEFRSample[] => {
  return Object.values(cefrSampleBank).filter(sample => sample.promptId === promptId);
};

export const getSamplesByLevel = (level: string): CEFRSample[] => {
  return Object.values(cefrSampleBank).filter(sample => sample.level === level);
};

export const getSampleById = (id: string): CEFRSample | undefined => {
  return cefrSampleBank[id];
};