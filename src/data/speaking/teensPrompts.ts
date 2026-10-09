import { SpeakingPrompt } from '../../types/assessment';

/**
 * TEENS placement test (ages 11-16).
 *
 * Content and topics are drawn from the Metro curriculum, whose levels map
 * directly to CEFR: Metro Starter = Pre-A1, Metro Book 1 = A1, Metro Book 2 = A2.
 * The Teens track therefore certifies up to A2.
 *
 * The last three items are B1 "probes" (isProbe: true). They sit one band above
 * the A2 ceiling on purpose: if a teen answers them well (scores above A2), the
 * result is flagged so a human assessor can move the student up to the Adults
 * track. The system never changes the track automatically.
 *
 * Reported in CEFR only.
 */
export const teensPrompts: SpeakingPrompt[] = [
  // --- Pre-A1 / A1 (Metro Starter + Book 1): self, school, home, routines ---
  {
    id: 'T1_PreA1',
    text: 'Introduce yourself. What is your name, how old are you, and where are you from?',
    category: 'describe',
    difficulty: 'beginner',
    timeLimit: 45,
    cefrLevel: 'Pre-A1',
    topic: 'Personal info',
    track: 'teens',
    hint: 'Say your name, your age, your country and your nationality.',
  },
  {
    id: 'T2_PreA1',
    text: 'Tell me about school. What subjects do you study, and which one is your favourite?',
    category: 'describe',
    difficulty: 'beginner',
    timeLimit: 50,
    cefrLevel: 'Pre-A1',
    topic: 'School',
    track: 'teens',
    hint: 'For example: "I study maths, English and science. My favourite is…"',
  },
  {
    id: 'T3_PreA1',
    text: 'Describe your bedroom or your home. What is there, and where are things?',
    category: 'describe',
    difficulty: 'beginner',
    timeLimit: 55,
    cefrLevel: 'Pre-A1',
    topic: 'Home & places',
    track: 'teens',
    hint: 'Use "There is / There are" and words like "on, in, under, next to."',
  },
  {
    id: 'T4_A1',
    text: 'What do you do on a normal day? Talk about your daily routine and your chores at home.',
    category: 'describe',
    difficulty: 'beginner',
    timeLimit: 60,
    cefrLevel: 'A1',
    topic: 'Daily routine',
    track: 'teens',
    hint: 'Use the present simple: "I get up at…, I go to…, I help with…"',
  },
  {
    id: 'T5_A1',
    text: 'What can you do and what can\'t you do? Think about sports, music or technology.',
    category: 'describe',
    difficulty: 'beginner',
    timeLimit: 50,
    cefrLevel: 'A1',
    topic: 'Abilities',
    track: 'teens',
    hint: 'Use "I can…" and "I can\'t…" and add a little detail.',
  },
  {
    id: 'T6_A1',
    text: 'Describe a friend or a family member. What do they look like, and what are they like?',
    category: 'describe',
    difficulty: 'beginner',
    timeLimit: 60,
    cefrLevel: 'A1',
    topic: 'People',
    track: 'teens',
    hint: 'Talk about appearance (tall, short, hair) and personality (kind, funny).',
  },

  // --- A1 read-aloud ---
  {
    id: 'T7_RA_A1',
    text: 'Read aloud: "On Saturdays I usually meet my friends. We play football in the park and then we have lunch together."',
    category: 'read_aloud',
    difficulty: 'beginner',
    timeLimit: 30,
    cefrLevel: 'A1',
    topic: 'Reading',
    track: 'teens',
    isReadAloud: true,
    hint: 'Read at a natural speed.',
  },

  // --- A2 (Metro Book 2): past, plans, comparisons, experiences ---
  {
    id: 'T8_A2',
    text: 'What did you do last weekend? Tell me what happened.',
    category: 'narrate',
    difficulty: 'beginner',
    timeLimit: 70,
    cefrLevel: 'A2',
    topic: 'Past events',
    track: 'teens',
    hint: 'Use the past simple: "I went…, I saw…, we played…"',
  },
  {
    id: 'T9_A2',
    text: 'What are your plans for the next holiday or the weekend? What are you going to do?',
    category: 'describe',
    difficulty: 'beginner',
    timeLimit: 60,
    cefrLevel: 'A2',
    topic: 'Future plans',
    track: 'teens',
    hint: 'Use "I\'m going to…" and "I\'m planning to…"',
  },
  {
    id: 'T10_A2',
    text: 'Compare two things you like — for example two sports, two singers, or two cities. Which is better, and why?',
    category: 'explain',
    difficulty: 'beginner',
    timeLimit: 70,
    cefrLevel: 'A2',
    topic: 'Comparing',
    track: 'teens',
    hint: 'Use comparatives and superlatives: "faster, more exciting, the best."',
  },
  {
    id: 'T11_A2',
    text: 'Have you ever done something exciting or new? Talk about an experience you have had.',
    category: 'narrate',
    difficulty: 'beginner',
    timeLimit: 70,
    cefrLevel: 'A2',
    topic: 'Experiences',
    track: 'teens',
    hint: 'Use the present perfect: "I have (been / tried / visited)…"',
  },
  {
    id: 'T12_A2',
    text: 'Talk about a movie, TV show or video you enjoyed recently. What was it about?',
    category: 'describe',
    difficulty: 'beginner',
    timeLimit: 70,
    cefrLevel: 'A2',
    topic: 'Media',
    track: 'teens',
    hint: 'Say what it was, what happened, and why you liked it.',
  },

  // --- B1 PROBES: above the A2 ceiling. Strong answers -> human moves to Adults. ---
  {
    id: 'T13_B1_PROBE',
    text: 'Do you think students should have homework every day? Explain your opinion and give reasons.',
    category: 'argue',
    difficulty: 'intermediate',
    timeLimit: 90,
    cefrLevel: 'B1',
    topic: 'Opinion (probe)',
    track: 'teens',
    isProbe: true,
    hint: 'Give your opinion clearly and support it with one or two reasons.',
  },
  {
    id: 'T14_B1_PROBE',
    text: 'What is a problem in your town or school, and how could it be solved?',
    category: 'explain',
    difficulty: 'intermediate',
    timeLimit: 90,
    cefrLevel: 'B1',
    topic: 'Problem & solution (probe)',
    track: 'teens',
    isProbe: true,
    hint: 'Describe the problem, then suggest a solution and explain why it would help.',
  },
  {
    id: 'T15_B1_PROBE',
    text: 'Where do you see yourself in the future, and what do you need to do to get there?',
    category: 'explain',
    difficulty: 'intermediate',
    timeLimit: 90,
    cefrLevel: 'B1',
    topic: 'Future & ambition (probe)',
    track: 'teens',
    isProbe: true,
    hint: 'Talk about your goals and the steps or choices that will help you reach them.',
  },
];

export default teensPrompts;
