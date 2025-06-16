
import { SpeakingPrompt } from '../../types/assessment';

/**
 * Updated CEFR-aligned speaking prompts for quick assessments
 * Organized by difficulty level from A1 to C1
 */
export const speakingPrompts: SpeakingPrompt[] = [
  // A1 - Elementary
  {
    id: 'Q1_A1',
    text: 'Introduce yourself. (Name and spelling– Age – Country – Residence– Job – Study – Marital status)',
    category: 'describe',
    difficulty: 'beginner',
    timeLimit: 60,
    cefrLevel: 'A1',
    topic: 'Personal Info',
    hint: 'Share your basic personal information including name, age, where you live, and what you do.'
  },
  {
    id: 'Q2_A1',
    text: "What's your phone number?",
    category: 'describe',
    difficulty: 'beginner',
    timeLimit: 30,
    cefrLevel: 'A1',
    topic: 'Personal Info',
    hint: 'Say your phone number clearly and you can also mention when people can call you.'
  },
  {
    id: 'Q3_A1',
    text: 'Introduce your family? (Parents / Siblings / Children)',
    category: 'describe',
    difficulty: 'beginner',
    timeLimit: 60,
    cefrLevel: 'A1',
    topic: 'Family',
    hint: 'Tell about your family members - parents, brothers, sisters, or children if you have any.'
  },
  {
    id: 'Q4_A1',
    text: "What's your daily routine?",
    category: 'describe',
    difficulty: 'beginner',
    timeLimit: 60,
    cefrLevel: 'A1',
    topic: 'Routine',
    hint: 'Describe what you do every day from morning to evening.'
  },
  {
    id: 'Q5_A2',
    text: 'What did you do yesterday or on your last day off?',
    category: 'narrate',
    difficulty: 'beginner',
    timeLimit: 60,
    cefrLevel: 'A2',
    topic: 'Past Activities',
    hint: 'Talk about activities you did recently, where you went, and who you were with.'
  },

  // A2-B1 - Pre-intermediate
  {
    id: 'Q6_A2',
    text: 'What are you going to do this week?',
    category: 'describe',
    difficulty: 'beginner',
    timeLimit: 60,
    cefrLevel: 'A2',
    topic: 'Future Plans',
    hint: 'Share your plans and activities for the coming week.'
  },
  {
    id: 'Q7_B1',
    text: 'How will your life be different in the next 10 years?',
    category: 'explain',
    difficulty: 'intermediate',
    timeLimit: 90,
    cefrLevel: 'B1',
    topic: 'Future',
    hint: 'Talk about your expectations and goals for the future.'
  },
  {
    id: 'Q8_B1',
    text: 'Describe the appearance and personality of your best friend.',
    category: 'describe',
    difficulty: 'intermediate',
    timeLimit: 90,
    cefrLevel: 'B1',
    topic: 'Relationships',
    hint: 'Describe what your friend looks like and what kind of person they are.'
  },
  {
    id: 'Q9_B1',
    text: 'Have you ever borrowed money from someone? Why?',
    category: 'narrate',
    difficulty: 'intermediate',
    timeLimit: 90,
    cefrLevel: 'B1',
    topic: 'Money',
    hint: 'Share an experience about borrowing money and explain the reason.'
  },
  {
    id: 'Q10_B1',
    text: 'Have you ever heard about a crime?',
    category: 'narrate',
    difficulty: 'intermediate',
    timeLimit: 90,
    cefrLevel: 'B1',
    topic: 'Society',
    hint: 'Talk about a crime you heard about in the news or from someone.'
  },
  {
    id: 'Q11_B1',
    text: 'How long have you been using the internet? And how?',
    category: 'explain',
    difficulty: 'intermediate',
    timeLimit: 90,
    cefrLevel: 'B1',
    topic: 'Technology',
    hint: 'Discuss your internet usage history and how you use it in daily life.'
  },

  // B1-B2 - Intermediate
  {
    id: 'Q12_B2',
    text: 'Talk about the best experience you have ever gained.',
    category: 'narrate',
    difficulty: 'intermediate',
    timeLimit: 90,
    cefrLevel: 'B2',
    topic: 'Personal Experience',
    hint: 'Share a meaningful experience and explain why it was significant for you.'
  },
  {
    id: 'Q13_B2',
    text: 'Why do some people say that social media is a double-edged weapon?',
    category: 'argue',
    difficulty: 'intermediate',
    timeLimit: 90,
    cefrLevel: 'B2',
    topic: 'Technology',
    hint: 'Discuss both positive and negative aspects of social media.'
  },
  {
    id: 'Q14_B2',
    text: 'What are the roots of terrorism?',
    category: 'explain',
    difficulty: 'intermediate',
    timeLimit: 120,
    cefrLevel: 'B2',
    topic: 'Society',
    hint: 'Analyze the underlying causes and factors that lead to terrorism.'
  },
  {
    id: 'Q15_B2',
    text: "Is there something you think you shouldn't have done when you were younger?",
    category: 'narrate',
    difficulty: 'intermediate',
    timeLimit: 90,
    cefrLevel: 'B2',
    topic: 'Personal Reflection',
    hint: 'Reflect on past decisions and explain what you would do differently.'
  },
  {
    id: 'Q16_B2',
    text: 'How is it possible to maintain stable relationships in life?',
    category: 'explain',
    difficulty: 'intermediate',
    timeLimit: 90,
    cefrLevel: 'B2',
    topic: 'Relationships',
    hint: 'Give advice on building and maintaining good relationships.'
  },
  {
    id: 'Q17_B2',
    text: 'How do you get your motivation? What goals are you motivated to achieve?',
    category: 'explain',
    difficulty: 'intermediate',
    timeLimit: 90,
    cefrLevel: 'B2',
    topic: 'Personal Development',
    hint: 'Discuss your sources of motivation and personal aspirations.'
  },

  // B2-C1 - Upper Intermediate
  {
    id: 'Q18_C1',
    text: 'If you could start your own business, what would it be? (Sector – Market – Target – Pricing)',
    category: 'explain',
    difficulty: 'advanced',
    timeLimit: 120,
    cefrLevel: 'C1',
    topic: 'Business',
    hint: 'Present a detailed business concept including industry, target market, and pricing strategy.'
  },
  {
    id: 'Q19_C1',
    text: 'What solutions can alleviate the suffering of the destitute?',
    category: 'argue',
    difficulty: 'advanced',
    timeLimit: 120,
    cefrLevel: 'C1',
    topic: 'Social Issues',
    hint: 'Propose concrete solutions to address poverty and social inequality.'
  },
  {
    id: 'Q20_C1',
    text: 'What features and qualities should be in a good leader?',
    category: 'explain',
    difficulty: 'advanced',
    timeLimit: 120,
    cefrLevel: 'C1',
    topic: 'Leadership',
    hint: 'Analyze the essential characteristics and skills of effective leadership.'
  },
  {
    id: 'Q21_C1',
    text: 'To what extent are you interested in fashion?',
    category: 'explain',
    difficulty: 'advanced',
    timeLimit: 120,
    cefrLevel: 'C1',
    topic: 'Fashion',
    hint: 'Discuss your relationship with fashion and its role in society and personal expression.'
  },
  {
    id: 'Q22_C1',
    text: 'How can we approach world peace?',
    category: 'argue',
    difficulty: 'advanced',
    timeLimit: 120,
    cefrLevel: 'C1',
    topic: 'Global Issues',
    hint: 'Present strategies and approaches for achieving international peace and cooperation.'
  },
  {
    id: 'Q23_C1',
    text: 'Reflect on this quote: "Technology owes ecology an apology."',
    category: 'argue',
    difficulty: 'advanced',
    timeLimit: 120,
    cefrLevel: 'C1',
    topic: 'Environment',
    hint: 'Analyze the relationship between technological advancement and environmental impact.'
  }
];
