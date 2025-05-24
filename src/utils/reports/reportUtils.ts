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
    vocabulary: {
      'A1': 'Learn 5 new words a day using flashcards. Focus on concrete nouns and action verbs.',
      'A2': 'Read graded readers and note down new words. Practice using synonyms for common words.',
      'B1': 'Read articles on topics of interest and look up unfamiliar words. Practice using collocations.',
      'B2': 'Read academic texts and note down specialized vocabulary. Practice using idioms and phrasal verbs.',
      'C1': 'Read literature and analyze the author\'s word choices. Practice using abstract and nuanced vocabulary.',
      'C2': 'Read complex philosophical texts and master rare vocabulary. Practice using vocabulary for rhetorical effect.'
    },
    pronunciation: {
      'A1': 'Listen to simple dialogues and repeat the phrases. Focus on stress and intonation.',
      'A2': 'Practice minimal pairs and record yourself speaking. Focus on vowel sounds and consonant clusters.',
      'B1': 'Use online tools to check your pronunciation. Focus on linking words and sentence stress.',
      'B2': 'Shadow native speakers and record yourself. Focus on rhythm and intonation patterns.',
      'C1': 'Analyze the pronunciation of different accents. Focus on subtle phonetic differences.',
      'C2': 'Master the nuances of pronunciation in different contexts. Focus on using pronunciation for emphasis.'
    },
    coherence: {
      'A1': 'Use simple connectors like "and" and "but" to link ideas. Practice sequencing events in a logical order.',
      'A2': 'Use transition words like "however" and "therefore". Practice writing simple paragraphs with a clear topic sentence.',
      'B1': 'Use a variety of transition words and phrases. Practice writing essays with a clear thesis statement.',
      'B2': 'Use complex connectors to link ideas in a sophisticated way. Practice writing argumentative essays.',
      'C1': 'Use rhetorical devices to enhance coherence. Practice writing persuasive essays with a clear line of reasoning.',
      'C2': 'Master the art of creating seamless transitions between ideas. Practice writing complex academic papers.'
    },
    syntax: {
      'A1': 'Focus on basic sentence structures (SVO). Practice forming simple questions.',
      'A2': 'Practice using compound sentences with coordinating conjunctions. Learn to use relative clauses.',
      'B1': 'Study complex sentence structures with subordinating conjunctions. Practice using passive voice.',
      'B2': 'Work on advanced sentence structures, such as cleft sentences. Study inversion techniques.',
      'C1': 'Focus on nuanced syntax usage, like subtle differences between similar structures. Study ellipsis techniques.',
      'C2': 'Refine stylistic uses of syntax for rhetorical effect. Master all exceptions and irregularities.'
    },
    listening: {
      'A1': 'Listen to simple dialogues and repeat the phrases. Focus on recognizing familiar words.',
      'A2': 'Listen to short stories and answer simple questions. Focus on understanding the main idea.',
      'B1': 'Listen to longer conversations and take notes. Focus on identifying key information.',
      'B2': 'Listen to lectures and summarize the main points. Focus on understanding complex arguments.',
      'C1': 'Listen to debates and analyze the speakers\' arguments. Focus on identifying bias and assumptions.',
      'C2': 'Listen to complex academic discussions and evaluate the speakers\' claims. Focus on synthesizing information from multiple sources.'
    },
    reading: {
      'A1': 'Read simple texts and match words to pictures. Focus on recognizing familiar words.',
      'A2': 'Read short stories and answer simple questions. Focus on understanding the main idea.',
      'B1': 'Read articles and take notes. Focus on identifying key information.',
      'B2': 'Read academic texts and summarize the main points. Focus on understanding complex arguments.',
      'C1': 'Read literature and analyze the author\'s style. Focus on identifying themes and motifs.',
      'C2': 'Read complex philosophical texts and evaluate the author\'s claims. Focus on synthesizing information from multiple sources.'
    },
    writing: {
      'A1': 'Write simple sentences about yourself. Focus on using correct grammar and spelling.',
      'A2': 'Write short paragraphs about familiar topics. Focus on organizing your ideas.',
      'B1': 'Write essays about your experiences and opinions. Focus on supporting your claims with evidence.',
      'B2': 'Write argumentative essays on complex topics. Focus on using persuasive language.',
      'C1': 'Write research papers and analyze complex issues. Focus on using academic style.',
      'C2': 'Write dissertations and contribute to academic discourse. Focus on originality and critical thinking.'
    }
  };
  
  // Get the base level without + modifier
  const baseLevel = level.replace(/\+$/, '') as CEFRLevel;
  
  // Return recommendation if it exists, otherwise provide general advice
  return recommendations[skill.toLowerCase()]?.[baseLevel] || 
    `Continue practicing ${skill} skills through regular exposure to authentic materials and production practice.`;
};
