import { CEFRLevel } from '@/types/assessment';

/**
 * Map numeric score (0-100) to CEFR level
 */
export const mapScoreToCEFR = (score: number): CEFRLevel => {
  if (score >= 95) return 'C2';
  if (score >= 90) return 'C1+';
  if (score >= 85) return 'C1';
  if (score >= 80) return 'B2+';
  if (score >= 70) return 'B2';
  if (score >= 65) return 'B1+';
  if (score >= 55) return 'B1';
  if (score >= 45) return 'A2+';
  if (score >= 35) return 'A2';
  if (score >= 25) return 'A1+';
  if (score >= 15) return 'A1';
  if (score >= 5) return 'Pre-A1';
  return 'Below Pre-A1';
};

/**
 * Get CEFR color by level
 */
export const getCEFRColor = (level: CEFRLevel): string => {
  const colorMap: Record<string, string> = {
    'C2': '#10b981',     // Green
    'C1+': '#14b8a6',    // Teal-green
    'C1': '#0ea5e9',     // Blue
    'B2+': '#3b82f6',    // Medium blue
    'B2': '#6366f1',     // Indigo
    'B1+': '#8b5cf6',    // Purple
    'B1': '#a855f7',     // Purple-pink
    'A2+': '#d946ef',    // Pink
    'A2': '#ec4899',     // Hot pink
    'A1+': '#f43f5e',    // Red-pink
    'A1': '#ef4444',     // Red
    'Pre-A1': '#f97316', // Orange
    'Below Pre-A1': '#dc2626', // Dark red
    'N/A': '#9ca3af',    // Gray
  };
  
  return colorMap[level] || '#9ca3af'; // Gray default
};

/**
 * Format date for report
 */
export const formatReportDate = (date: Date | string): string => {
  if (typeof date === 'string') {
    date = new Date(date);
  }
  
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Get CEFR descriptions
 */
export const getCEFRDescription = (level: CEFRLevel): string => {
  const descriptions: Record<string, string> = {
    'C2': 'Can understand with ease virtually everything heard or read. Can summarize information from different spoken and written sources, reconstructing arguments and accounts in a coherent presentation.',
    'C1+': 'Advanced proficiency with superior fluency and precision. Can express ideas spontaneously without much obvious searching.',
    'C1': 'Can understand a wide range of demanding, longer texts, and recognize implicit meaning. Can express ideas fluently and spontaneously without much obvious searching for expressions.',
    'B2+': 'Upper intermediate level with more consistent accuracy and fluency. Can make effective arguments and follow complex lines of reasoning.',
    'B2': 'Can understand the main ideas of complex text. Can interact with a degree of fluency and spontaneity that makes regular interaction with native speakers quite possible.',
    'B1+': 'Intermediate level with enhanced fluency and broader vocabulary. Can describe experiences, events, and ambitions with reasonable precision.',
    'B1': 'Can understand the main points of clear standard input on familiar matters. Can deal with most situations likely to arise while traveling in an area where the language is spoken.',
    'A2+': 'Strong basic communication skills with broader vocabulary and more complex sentence structures than A2.',
    'A2': 'Can understand sentences and frequently used expressions related to areas of most immediate relevance. Can communicate in simple and routine tasks.',
    'A1+': 'Elementary language use with slightly more vocabulary and grammatical structures than A1.',
    'A1': 'Can understand and use familiar everyday expressions and very basic phrases. Can introduce themselves and others and ask and answer questions about personal details.',
    'Pre-A1': 'Emerging language skills. Can use and understand some very basic words and phrases.',
    'Below Pre-A1': 'Beginning to develop language skills, with very limited comprehension and expression.',
    'N/A': 'Assessment not available or not applicable.'
  };
  
  return descriptions[level] || 'No description available for this level.';
};

/**
 * Get skill recommendations by CEFR level
 */
export const getSkillRecommendations = (skill: string, level: CEFRLevel): string => {
  // Pre-defined recommendations for different skills and levels
  const recommendations: Record<string, Record<string, string>> = {
    fluency: {
      'A1': 'Practice speaking aloud daily, even if just for a few minutes. Try reading short texts aloud to build rhythm.',
      'A2': 'Record yourself speaking and listen back to identify pauses. Practice telling simple stories without stopping.',
      'B1': 'Join conversation groups to practice speaking spontaneously. Try shadowing techniques with native audio.',
      'B2': 'Practice impromptu speaking on various topics. Work on reducing filler words and unnecessary pauses.',
      'C1': 'Engage in debates and discussions that require quick thinking. Practice expressing complex ideas clearly.',
      'C2': 'Fine-tune your speaking with advanced presentation techniques. Work on maintaining rhythm in long discussions.'
    },
    grammar: {
      'A1': 'Focus on basic sentence structures and present tense verbs. Practice using common question forms.',
      'A2': 'Work on past tense forms and basic modal verbs. Practice combining sentences with and, but, because.',
      'B1': 'Study conditional forms and perfect tenses. Practice reported speech and passive constructions.',
      'B2': 'Work on advanced conditionals and modal perfect forms. Study complex sentence structures.',
      'C1': 'Focus on nuanced grammar usage, like subtle differences between similar structures. Study inversion techniques.',
      'C2': 'Refine stylistic uses of grammar for rhetorical effect. Master all exceptions and irregularities.'
    },
    // ... keep existing code (recommendations for other skills)
  };
  
  // Get the base level without + modifier
  const baseLevel = level.replace(/\+$/, '') as CEFRLevel;
  
  // Return recommendation if it exists, otherwise provide general advice
  return recommendations[skill.toLowerCase()]?.[baseLevel] || 
    `Continue practicing ${skill} skills through regular exposure to authentic materials and production practice.`;
};
