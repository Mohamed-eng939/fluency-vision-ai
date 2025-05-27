
import { SpeakingPrompt } from '../../types/assessment';

/**
 * Finalized set of 28 CEFR-aligned speaking prompts for quick assessments
 * Ordered from A1 to C2 for adaptive testing
 */
export const mockPrompts: SpeakingPrompt[] = [
  // A1 - Elementary
  {
    id: 'Q1_A1',
    text: 'Introduce yourself.',
    category: 'describe',
    difficulty: 'beginner',
    timeLimit: 60,
    cefrLevel: 'A1',
    topic: 'Personal Info',
    hint: 'Mention your name, where you live, and how people can contact you.'
  },
  {
    id: 'Q2_A1',
    text: 'Can you describe your daily routine?',
    category: 'describe',
    difficulty: 'beginner',
    timeLimit: 60,
    cefrLevel: 'A1',
    topic: 'Routine',
    hint: 'Talk about when you wake up, go to school or work, and what you do in the evening.'
  },
  {
    id: 'Q3_A1',
    text: 'What do you usually do on weekends?',
    category: 'describe',
    difficulty: 'beginner',
    timeLimit: 60,
    cefrLevel: 'A1',
    topic: 'Weekends',
    hint: 'Mention activities like shopping, visiting family, relaxing, or studying.'
  },
  
  // A2 - Pre-Intermediate
  {
    id: 'Q4_A2',
    text: 'Can you describe your home or your neighborhood?',
    category: 'describe',
    difficulty: 'beginner',
    timeLimit: 60,
    cefrLevel: 'A2',
    topic: 'Home',
    hint: 'Talk about the size, rooms, people, or places nearby.'
  },
  {
    id: 'Q5_A2',
    text: 'What do you usually do after work or school?',
    category: 'describe',
    difficulty: 'beginner',
    timeLimit: 60,
    cefrLevel: 'A2',
    topic: 'After School',
    hint: 'Mention hobbies, meals, or rest routines.'
  },
  {
    id: 'Q6_A2',
    text: 'Tell me about your favorite place to visit.',
    category: 'describe',
    difficulty: 'beginner',
    timeLimit: 60,
    cefrLevel: 'A2',
    topic: 'Travel',
    hint: 'Explain what it looks like and why you like it.'
  },
  {
    id: 'Q7_A2',
    text: 'What did you do last weekend?',
    category: 'narrate',
    difficulty: 'beginner',
    timeLimit: 60,
    cefrLevel: 'A2',
    topic: 'Past Activities',
    hint: 'Include places you went or people you saw.'
  },
  {
    id: 'Q8_A2',
    text: 'What do you normally eat for breakfast, lunch, and dinner?',
    category: 'describe',
    difficulty: 'beginner',
    timeLimit: 60,
    cefrLevel: 'A2',
    topic: 'Food',
    hint: 'Give examples of foods and times.'
  },
  
  // B1 - Intermediate
  {
    id: 'Q9_B1',
    text: 'What kind of job do you have or would you like to have?',
    category: 'describe',
    difficulty: 'intermediate',
    timeLimit: 90,
    cefrLevel: 'B1',
    topic: 'Work',
    hint: 'Describe the job and explain why it suits you.'
  },
  {
    id: 'Q10_B1',
    text: 'Do you enjoy traveling? Tell me about a trip you liked.',
    category: 'narrate',
    difficulty: 'intermediate',
    timeLimit: 90,
    cefrLevel: 'B1',
    topic: 'Travel',
    hint: 'Include where, when, and what you did.'
  },
  {
    id: 'Q11_B1',
    text: 'What do you usually do to stay healthy?',
    category: 'explain',
    difficulty: 'intermediate',
    timeLimit: 90,
    cefrLevel: 'B1',
    topic: 'Health',
    hint: 'Talk about food, exercise, or sleep habits.'
  },
  {
    id: 'Q12_B1',
    text: 'Describe your best friend. Why are you close?',
    category: 'describe',
    difficulty: 'intermediate',
    timeLimit: 90,
    cefrLevel: 'B1',
    topic: 'Relationships',
    hint: 'Share personality traits or shared experiences.'
  },
  {
    id: 'Q13_B1',
    text: 'Tell me about a typical day at work or school.',
    category: 'describe',
    difficulty: 'intermediate',
    timeLimit: 90,
    cefrLevel: 'B1',
    topic: 'Routine',
    hint: 'Explain your schedule and responsibilities.'
  },
  
  // B2 - Upper Intermediate
  {
    id: 'Q14_B2',
    text: 'What are the advantages and disadvantages of living in your country?',
    category: 'argue',
    difficulty: 'intermediate',
    timeLimit: 90,
    cefrLevel: 'B2',
    topic: 'Culture',
    hint: 'Give one or two points for each.'
  },
  {
    id: 'Q15_B2',
    text: 'How do people in your culture celebrate holidays or special events?',
    category: 'explain',
    difficulty: 'intermediate',
    timeLimit: 90,
    cefrLevel: 'B2',
    topic: 'Traditions',
    hint: 'Mention traditional food, clothes, or activities.'
  },
  {
    id: 'Q16_B2',
    text: 'What do you think makes a good leader?',
    category: 'argue',
    difficulty: 'intermediate',
    timeLimit: 90,
    cefrLevel: 'B2',
    topic: 'Leadership',
    hint: 'Talk about qualities like honesty or communication.'
  },
  {
    id: 'Q17_B2',
    text: "What's your opinion about using social media every day?",
    category: 'argue',
    difficulty: 'intermediate',
    timeLimit: 90,
    cefrLevel: 'B2',
    topic: 'Technology',
    hint: 'Mention both positive and negative sides.'
  },
  {
    id: 'Q18_B2',
    text: 'Can you describe a personal achievement you are proud of?',
    category: 'narrate',
    difficulty: 'intermediate',
    timeLimit: 90,
    cefrLevel: 'B2',
    topic: 'Personal Achievement',
    hint: 'Say what you did, how, and why it mattered.'
  },
  
  // C1 - Advanced
  {
    id: 'Q19_C1',
    text: 'What career would you like to pursue and why?',
    category: 'explain',
    difficulty: 'advanced',
    timeLimit: 120,
    cefrLevel: 'C1',
    topic: 'Careers',
    hint: 'Explain your motivation and future goals.'
  },
  {
    id: 'Q20_C1',
    text: "What's your opinion on the education system in your country?",
    category: 'argue',
    difficulty: 'advanced',
    timeLimit: 120,
    cefrLevel: 'C1',
    topic: 'Education',
    hint: 'Discuss strengths and areas for improvement.'
  },
  {
    id: 'Q21_C1',
    text: 'How can governments encourage people to live healthier lives?',
    category: 'argue',
    difficulty: 'advanced',
    timeLimit: 120,
    cefrLevel: 'C1',
    topic: 'Health',
    hint: 'Suggest policies, education, or support.'
  },
  {
    id: 'Q22_C1',
    text: 'Do you think technology is improving or harming communication?',
    category: 'argue',
    difficulty: 'advanced',
    timeLimit: 120,
    cefrLevel: 'C1',
    topic: 'Technology',
    hint: 'Give examples and your reasoning.'
  },
  {
    id: 'Q23_C1',
    text: "What's your view on the importance of preserving the environment?",
    category: 'argue',
    difficulty: 'advanced',
    timeLimit: 120,
    cefrLevel: 'C1',
    topic: 'Environment',
    hint: 'Mention practical actions or consequences.'
  },
  
  // C2 - Proficient
  {
    id: 'Q24_C2',
    text: "Do you agree or disagree with this statement: 'Money can't buy happiness'? Explain your view.",
    category: 'argue',
    difficulty: 'advanced',
    timeLimit: 150,
    cefrLevel: 'C2',
    topic: 'Philosophy',
    hint: 'Use real-life or philosophical examples.'
  },
  {
    id: 'Q25_C2',
    text: 'How has globalization impacted your country socially and economically?',
    category: 'explain',
    difficulty: 'advanced',
    timeLimit: 150,
    cefrLevel: 'C2',
    topic: 'Globalization',
    hint: 'Give positive and/or negative impacts.'
  },
  {
    id: 'Q26_C2',
    text: 'In what ways can art or culture influence political change?',
    category: 'explain',
    difficulty: 'advanced',
    timeLimit: 150,
    cefrLevel: 'C2',
    topic: 'Culture & Politics',
    hint: 'Share examples from history or current events.'
  },
  {
    id: 'Q27_C2',
    text: 'Should governments limit access to certain types of information online?',
    category: 'argue',
    difficulty: 'advanced',
    timeLimit: 150,
    cefrLevel: 'C2',
    topic: 'Media',
    hint: 'Debate the pros and cons.'
  },
  {
    id: 'Q28_C2',
    text: "What's your perspective on how artificial intelligence may change the future of work?",
    category: 'explain',
    difficulty: 'advanced',
    timeLimit: 150,
    cefrLevel: 'C2',
    topic: 'Artificial Intelligence',
    hint: 'Include opportunities and challenges.'
  }
];

/**
 * Get prompts filtered by CEFR level
 * @param level CEFR level to filter by
 */
export const getPromptsByLevel = (level: string): SpeakingPrompt[] => {
  return mockPrompts.filter(prompt => prompt.cefrLevel === level);
};

/**
 * Get random prompt from all available prompts or filtered by level
 * @param level Optional CEFR level to filter by
 */
export const getRandomPrompt = (level?: string): SpeakingPrompt => {
  const availablePrompts = level ? getPromptsByLevel(level) : mockPrompts;
  const randomIndex = Math.floor(Math.random() * availablePrompts.length);
  return availablePrompts[randomIndex];
};

/**
 * Get prompt by ID
 * @param id Prompt ID
 */
export const getPromptById = (id: string): SpeakingPrompt | undefined => {
  return mockPrompts.find(prompt => prompt.id === id);
};
