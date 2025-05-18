
import { SpeakingPrompt } from '../../types/assessment';

/**
 * CEFR-aligned speaking prompts for quick assessments
 */
export const mockPrompts: SpeakingPrompt[] = [
  // A1 - Elementary
  {
    id: 'Q1_A1',
    text: 'Introduce yourself. You can mention your name, where you live, and how people can contact you.',
    category: 'describe',
    difficulty: 'beginner',
    timeLimit: 60,
    cefrLevel: 'A1',
    topic: 'Personal Information'
  },
  {
    id: 'Q2_A1',
    text: 'Can you describe your daily routine? (Talk about what time you wake up, go to school or work, and what you do in the evening.)',
    category: 'describe',
    difficulty: 'beginner',
    timeLimit: 60,
    cefrLevel: 'A1',
    topic: 'Daily Life'
  },
  {
    id: 'Q3_A1',
    text: 'What do you usually do on weekends? (Mention activities like shopping, visiting family, relaxing, or studying.)',
    category: 'describe',
    difficulty: 'beginner',
    timeLimit: 60,
    cefrLevel: 'A1',
    topic: 'Leisure'
  },
  
  // A2 - Pre-Intermediate
  {
    id: 'Q4_A2',
    text: 'Can you describe your home or your neighborhood? (Talk about the size, rooms, people, or places nearby.)',
    category: 'describe',
    difficulty: 'beginner',
    timeLimit: 60,
    cefrLevel: 'A2',
    topic: 'Home & Environment'
  },
  {
    id: 'Q5_A2',
    text: 'What do you usually do after work or school? (Mention hobbies, meals, or rest routines.)',
    category: 'describe',
    difficulty: 'beginner',
    timeLimit: 60,
    cefrLevel: 'A2',
    topic: 'Leisure'
  },
  {
    id: 'Q6_A2',
    text: 'Tell me about your favorite place to visit. (Explain what it looks like and why you like it.)',
    category: 'describe',
    difficulty: 'beginner',
    timeLimit: 60,
    cefrLevel: 'A2',
    topic: 'Travel'
  },
  {
    id: 'Q7_A2',
    text: 'What did you do last weekend? (Include places you went or people you saw.)',
    category: 'narrate',
    difficulty: 'beginner',
    timeLimit: 60,
    cefrLevel: 'A2',
    topic: 'Leisure'
  },
  {
    id: 'Q8_A2',
    text: 'What do you normally eat for breakfast, lunch, and dinner? (Give examples of foods and times.)',
    category: 'describe',
    difficulty: 'beginner',
    timeLimit: 60,
    cefrLevel: 'A2',
    topic: 'Food & Diet'
  },
  
  // B1 - Intermediate
  {
    id: 'Q9_B1',
    text: 'What kind of job do you have or would you like to have? (Describe the job, and explain why it suits you.)',
    category: 'describe',
    difficulty: 'intermediate',
    timeLimit: 90,
    cefrLevel: 'B1',
    topic: 'Work & Career'
  },
  {
    id: 'Q10_B1',
    text: 'Do you enjoy traveling? Tell me about a trip you liked. (Include where, when, and what you did.)',
    category: 'narrate',
    difficulty: 'intermediate',
    timeLimit: 90,
    cefrLevel: 'B1',
    topic: 'Travel'
  },
  {
    id: 'Q11_B1',
    text: 'What do you usually do to stay healthy? (Talk about food, exercise, or sleep habits.)',
    category: 'explain',
    difficulty: 'intermediate',
    timeLimit: 90,
    cefrLevel: 'B1',
    topic: 'Health & Fitness'
  },
  {
    id: 'Q12_B1',
    text: 'Describe your best friend. Why are you close? (Share some personality traits or shared experiences.)',
    category: 'describe',
    difficulty: 'intermediate',
    timeLimit: 90,
    cefrLevel: 'B1',
    topic: 'Relationships'
  },
  {
    id: 'Q13_B1',
    text: 'Tell me about a typical day at work or school. (Explain your schedule and responsibilities.)',
    category: 'describe',
    difficulty: 'intermediate',
    timeLimit: 90,
    cefrLevel: 'B1',
    topic: 'Work & Education'
  },
  
  // B2 - Upper Intermediate
  {
    id: 'Q14_B2',
    text: 'What are the advantages and disadvantages of living in your country? (Give one or two points for each.)',
    category: 'argue',
    difficulty: 'intermediate',
    timeLimit: 90,
    cefrLevel: 'B2',
    topic: 'Society & Culture'
  },
  {
    id: 'Q15_B2',
    text: 'How do people in your culture celebrate holidays or special events? (Mention traditional food, clothes, or activities.)',
    category: 'explain',
    difficulty: 'intermediate',
    timeLimit: 90,
    cefrLevel: 'B2',
    topic: 'Culture & Traditions'
  },
  {
    id: 'Q16_B2',
    text: 'What do you think makes a good leader? (Talk about qualities like honesty or communication.)',
    category: 'argue',
    difficulty: 'intermediate',
    timeLimit: 90,
    cefrLevel: 'B2',
    topic: 'Work & Leadership'
  },
  {
    id: 'Q17_B2',
    text: 'What\'s your opinion about using social media every day? (Mention both positive and negative sides.)',
    category: 'argue',
    difficulty: 'intermediate',
    timeLimit: 90,
    cefrLevel: 'B2',
    topic: 'Technology & Society'
  },
  {
    id: 'Q18_B2',
    text: 'Can you describe a personal achievement you are proud of? (Say what you did, how, and why it mattered.)',
    category: 'narrate',
    difficulty: 'intermediate',
    timeLimit: 90,
    cefrLevel: 'B2',
    topic: 'Personal Growth'
  },
  
  // C1 - Advanced
  {
    id: 'Q19_C1',
    text: 'What career would you like to pursue and why? (Explain your motivation and future goals.)',
    category: 'explain',
    difficulty: 'advanced',
    timeLimit: 120,
    cefrLevel: 'C1',
    topic: 'Work & Career'
  },
  {
    id: 'Q20_C1',
    text: 'What\'s your opinion on the education system in your country? (Discuss strengths and areas for improvement.)',
    category: 'argue',
    difficulty: 'advanced',
    timeLimit: 120,
    cefrLevel: 'C1',
    topic: 'Education'
  },
  {
    id: 'Q21_C1',
    text: 'How can governments encourage people to live healthier lives? (Suggest policies, education, or support.)',
    category: 'argue',
    difficulty: 'advanced',
    timeLimit: 120,
    cefrLevel: 'C1',
    topic: 'Health & Policy'
  },
  {
    id: 'Q22_C1',
    text: 'Do you think technology is improving or harming communication? (Give examples and your reasoning.)',
    category: 'argue',
    difficulty: 'advanced',
    timeLimit: 120,
    cefrLevel: 'C1',
    topic: 'Technology & Society'
  },
  {
    id: 'Q23_C1',
    text: 'What\'s your view on the importance of preserving the environment? (Mention practical actions or consequences.)',
    category: 'argue',
    difficulty: 'advanced',
    timeLimit: 120,
    cefrLevel: 'C1',
    topic: 'Environment'
  },
  
  // C2 - Proficient
  {
    id: 'Q24_C2',
    text: 'Do you agree or disagree with this statement: "Money can\'t buy happiness"? Explain your view. (Use real-life or philosophical examples.)',
    category: 'argue',
    difficulty: 'advanced',
    timeLimit: 150,
    cefrLevel: 'C2',
    topic: 'Philosophy & Society'
  },
  {
    id: 'Q25_C2',
    text: 'How has globalization impacted your country socially and economically? (Give positive and/or negative impacts.)',
    category: 'explain',
    difficulty: 'advanced',
    timeLimit: 150,
    cefrLevel: 'C2',
    topic: 'Globalization'
  },
  {
    id: 'Q26_C2',
    text: 'In what ways can art or culture influence political change? (Share examples from history or current events.)',
    category: 'explain',
    difficulty: 'advanced',
    timeLimit: 150,
    cefrLevel: 'C2',
    topic: 'Art & Politics'
  },
  {
    id: 'Q27_C2',
    text: 'Should governments limit access to certain types of information online? (Debate the pros and cons.)',
    category: 'argue',
    difficulty: 'advanced',
    timeLimit: 150,
    cefrLevel: 'C2',
    topic: 'Technology & Policy'
  },
  {
    id: 'Q28_C2',
    text: 'What\'s your perspective on how artificial intelligence may change the future of work? (Include opportunities and challenges.)',
    category: 'explain',
    difficulty: 'advanced',
    timeLimit: 150,
    cefrLevel: 'C2',
    topic: 'Technology & Work'
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
