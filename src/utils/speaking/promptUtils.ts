
import { SpeakingPrompt } from '../../types/assessment';

/**
 * Mock speaking prompts for quick assessments
 */
export const mockPrompts = [
  {
    id: '1',
    text: 'Describe your favorite place to visit and explain why it is special to you.',
    category: 'describe',
    difficulty: 'beginner',
    timeLimit: 60
  },
  {
    id: '2',
    text: 'Do you think technology has had a positive or negative impact on education? Support your opinion with examples.',
    category: 'argue',
    difficulty: 'intermediate',
    timeLimit: 90
  },
  {
    id: '3',
    text: 'Explain the process of learning a new language. What steps would you recommend to someone who wants to become fluent?',
    category: 'explain',
    difficulty: 'intermediate',
    timeLimit: 90
  },
  {
    id: '4',
    text: 'Tell a story about a time when you overcame a significant challenge in your life.',
    category: 'narrate',
    difficulty: 'advanced',
    timeLimit: 120
  }
] as const;
