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

  // Q10 – Crime experience
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
    lexicalFeatures: ['crime', 'police', 'jail'],
    grammarFeatures: ['incorrect tense forms', 'sentence structure errors'],
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
    lexicalFeatures: ['stole', 'caught', 'street'],
    grammarFeatures: ['accurate past simple use'],
    discourseMarkers: ['after']
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
    lexicalFeatures: ['broke into', 'security footage', 'felt unsafe'],
    grammarFeatures: ['past simple', 'past continuous'],
    discourseMarkers: ['fortunately', 'for a while']
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
    lexicalFeatures: ['robbery', 'fake IDs', 'stolen vehicles', 'planned the crime'],
    grammarFeatures: ['effective use of past perfect', 'modals'],
    discourseMarkers: ['like something from']
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
    lexicalFeatures: ['cybercriminals', 'sensitive data', 'perpetrators', 'sparked debate'],
    grammarFeatures: ['passive voice', 'embedded clauses'],
    discourseMarkers: ['what shocked me most', 'which sparked']
  }
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