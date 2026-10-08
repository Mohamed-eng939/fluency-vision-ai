import { SpeakingPrompt } from '../../types/assessment';

/**
 * KIDS placement test (ages 6-10).
 *
 * Content and topics are drawn from the Family & Friends curriculum
 * (family, toys, school, animals, food, clothes, weather, daily routine,
 * hobbies). The language ladder runs from A1 up to B1. Prompts are short,
 * warm and concrete so young children can answer by speaking, and two gentle
 * read-aloud items are included (the "use both formats" decision).
 *
 * Reported in CEFR only (no Mild/Medium/Spicy stage labels in the result).
 */
export const kidsPrompts: SpeakingPrompt[] = [
  // --- A1: getting started (self, family, favourites) ---
  {
    id: 'K1_A1',
    text: 'Hello! What is your name and how old are you?',
    category: 'describe',
    difficulty: 'beginner',
    timeLimit: 40,
    cefrLevel: 'A1',
    topic: 'About me',
    track: 'kids',
    hint: 'Say "My name is…" and "I am … years old."',
  },
  {
    id: 'K2_A1',
    text: 'Tell me about your family. Who is in your family?',
    category: 'describe',
    difficulty: 'beginner',
    timeLimit: 45,
    cefrLevel: 'A1',
    topic: 'Family',
    track: 'kids',
    hint: 'You can talk about your mum, dad, brothers, sisters, grandma and grandpa.',
  },
  {
    id: 'K3_A1',
    text: 'What is your favourite toy or game? What colour is it?',
    category: 'describe',
    difficulty: 'beginner',
    timeLimit: 45,
    cefrLevel: 'A1',
    topic: 'Toys & colours',
    track: 'kids',
    hint: 'Say "My favourite toy is…" and "It is (red / blue / green)."',
  },
  {
    id: 'K4_A1',
    text: 'What food do you like? What food do you not like?',
    category: 'describe',
    difficulty: 'beginner',
    timeLimit: 45,
    cefrLevel: 'A1',
    topic: 'Food',
    track: 'kids',
    hint: 'Say "I like…" and "I don\'t like…"',
  },

  // --- A1 read-aloud (gentle, kid-friendly format) ---
  {
    id: 'K5_RA_A1',
    text: 'Read aloud: "I have a little red ball. I play with my dog in the park."',
    category: 'read_aloud',
    difficulty: 'beginner',
    timeLimit: 30,
    cefrLevel: 'A1',
    topic: 'Reading',
    track: 'kids',
    isReadAloud: true,
    hint: 'Read the two sentences slowly and clearly.',
  },

  // --- A2: routines, abilities, describing ---
  {
    id: 'K6_A2',
    text: 'What do you do every day? Tell me about your day from morning to night.',
    category: 'describe',
    difficulty: 'beginner',
    timeLimit: 60,
    cefrLevel: 'A2',
    topic: 'Daily routine',
    track: 'kids',
    hint: 'For example: "I get up, I go to school, I play, I go to bed."',
  },
  {
    id: 'K7_A2',
    text: 'What can you do well? For example, can you swim, draw, sing or ride a bike?',
    category: 'describe',
    difficulty: 'beginner',
    timeLimit: 50,
    cefrLevel: 'A2',
    topic: 'Abilities',
    track: 'kids',
    hint: 'Say "I can…" and "I can\'t…"',
  },
  {
    id: 'K8_A2',
    text: 'Tell me about your best friend. What do they look like? What do you play together?',
    category: 'describe',
    difficulty: 'beginner',
    timeLimit: 60,
    cefrLevel: 'A2',
    topic: 'Friends',
    track: 'kids',
    hint: 'You can say "My friend has… hair" and "We like playing…"',
  },
  {
    id: 'K9_A2',
    text: 'What is the weather like today? What clothes do you wear when it is cold?',
    category: 'describe',
    difficulty: 'beginner',
    timeLimit: 50,
    cefrLevel: 'A2',
    topic: 'Weather & clothes',
    track: 'kids',
    hint: 'For example: "It is sunny / rainy / cold," and "I wear a coat and a hat."',
  },

  // --- A2 read-aloud ---
  {
    id: 'K10_RA_A2',
    text: 'Read aloud: "Yesterday we went to the zoo. We saw a big elephant and two funny monkeys."',
    category: 'read_aloud',
    difficulty: 'beginner',
    timeLimit: 30,
    cefrLevel: 'A2',
    topic: 'Reading',
    track: 'kids',
    isReadAloud: true,
    hint: 'Read it like you are telling a story.',
  },

  // --- B1: short narrative + simple opinion + future (stretch items) ---
  {
    id: 'K11_B1',
    text: 'Tell me a story about something fun you did last weekend. What happened?',
    category: 'narrate',
    difficulty: 'intermediate',
    timeLimit: 75,
    cefrLevel: 'B1',
    topic: 'Past events',
    track: 'kids',
    hint: 'Talk about where you went, who you were with, and what you did.',
  },
  {
    id: 'K12_B1',
    text: 'What do you want to be when you grow up? Why do you like it?',
    category: 'explain',
    difficulty: 'intermediate',
    timeLimit: 75,
    cefrLevel: 'B1',
    topic: 'Future & reasons',
    track: 'kids',
    hint: 'Say "I want to be a…" and give one reason, like "because…"',
  },
];

export default kidsPrompts;
