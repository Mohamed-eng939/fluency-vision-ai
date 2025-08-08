export interface CEFRSampleResponse {
  id: string;
  promptId: string;
  cefrLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  transcript: string;
  scores: {
    fluency: number;
    grammar: number;
    vocabulary: number;
    pronunciation: number;
    prosody: number;
    syntax: number;
    coherence: number;
  };
  feedback: {
    strengths: string[];
    improvements: string[];
    justification: string;
  };
  lexicalFeatures: string[];
  grammarFeatures: string[];
  discourseMarkers: string[];
}

// Comprehensive CEFR sample responses for all 23 assessment questions
export const sampleResponses: CEFRSampleResponse[] = [
  // Q1_A1: Introduce yourself - A1 Level
  {
    id: 'intro-A1-01',
    promptId: 'Q1_A1',
    cefrLevel: 'A1',
    transcript: 'My name is Sarah. S-A-R-A-H. I am 25 years old. I am from Canada. I live in Toronto. I am student. I study English. I am single.',
    scores: { fluency: 3.5, grammar: 3.0, vocabulary: 3.0, pronunciation: 3.5, prosody: 3.0, syntax: 3.0, coherence: 3.5 },
    feedback: {
      strengths: ['Clear personal information', 'Correct spelling', 'Basic present tense'],
      improvements: ['Use articles (a/an)', 'Connect ideas better', 'Add more details'],
      justification: 'Basic A1 response with essential personal information but limited grammar range.'
    },
    lexicalFeatures: ['name', 'old', 'from', 'live', 'student', 'study', 'single'],
    grammarFeatures: ['simple present', 'basic adjectives', 'to be verb'],
    discourseMarkers: []
  },
  
  // Q1_A1: Introduce yourself - A2 Level
  {
    id: 'intro-A2-01',
    promptId: 'Q1_A1',
    cefrLevel: 'A2',
    transcript: 'Hello, my name is David Chen. That\'s D-A-V-I-D, C-H-E-N. I\'m 28 years old and I\'m from Taiwan, but I live in Vancouver now. I work as a software engineer at a tech company. I\'m married and I have one child.',
    scores: { fluency: 5.0, grammar: 4.5, vocabulary: 4.5, pronunciation: 4.5, prosody: 4.0, syntax: 4.5, coherence: 5.0 },
    feedback: {
      strengths: ['Good use of contractions', 'Clear sequencing', 'Appropriate detail level'],
      improvements: ['More complex sentence structures', 'Varied vocabulary'],
      justification: 'Solid A2 level with good basic grammar control and logical organization.'
    },
    lexicalFeatures: ['software engineer', 'tech company', 'married', 'child'],
    grammarFeatures: ['contractions', 'present simple', 'but connector'],
    discourseMarkers: ['but', 'now']
  },

  // Q1_A1: Introduce yourself - B1 Level
  {
    id: 'intro-B1-01',
    promptId: 'Q1_A1',
    cefrLevel: 'B1',
    transcript: 'Well, let me introduce myself properly. My name is Maria Rodriguez - that\'s M-A-R-I-A, R-O-D-R-I-G-U-E-Z. I\'m 32 years old and originally from Mexico, though I\'ve been living in Los Angeles for about five years now. I work as a marketing coordinator for a medium-sized advertising agency. As for my personal life, I\'m married to my husband Carlos, and we have two young children who keep us very busy.',
    scores: { fluency: 6.5, grammar: 6.0, vocabulary: 6.5, pronunciation: 6.0, prosody: 6.0, syntax: 6.5, coherence: 7.0 },
    feedback: {
      strengths: ['Natural discourse markers', 'Complex time expressions', 'Personal details integration'],
      improvements: ['More sophisticated vocabulary', 'Varied sentence structures'],
      justification: 'Good B1 level with natural flow and appropriate level of detail.'
    },
    lexicalFeatures: ['introduce', 'properly', 'originally', 'marketing coordinator', 'medium-sized', 'advertising agency', 'personal life'],
    grammarFeatures: ['present perfect continuous', 'relative clauses', 'complex sentences'],
    discourseMarkers: ['well', 'let me', 'though', 'as for']
  },

  // Q2_A1: Phone number - A1 Level  
  {
    id: 'phone-A1-01',
    promptId: 'Q2_A1',
    cefrLevel: 'A1',
    transcript: 'My phone number is 416-555-1234. You can call me morning or evening.',
    scores: { fluency: 4.0, grammar: 3.5, vocabulary: 3.0, pronunciation: 4.0, prosody: 3.5, syntax: 3.0, coherence: 4.0 },
    feedback: {
      strengths: ['Clear number pronunciation', 'Simple time references'],
      improvements: ['Use articles', 'More specific times'],
      justification: 'Functional A1 response meeting basic communication needs.'
    },
    lexicalFeatures: ['phone number', 'call', 'morning', 'evening'],
    grammarFeatures: ['simple present', 'modal can'],
    discourseMarkers: []
  },

  // Q2_A1: Phone number - A2 Level
  {
    id: 'phone-A2-01',
    promptId: 'Q2_A1',
    cefrLevel: 'A2',
    transcript: 'My phone number is 604-778-9012. The best time to call me is between 7 and 9 PM on weekdays because I\'m usually free then. On weekends, you can call me anytime during the day.',
    scores: { fluency: 5.0, grammar: 4.5, vocabulary: 4.5, pronunciation: 4.5, prosody: 4.0, syntax: 4.5, coherence: 5.0 },
    feedback: {
      strengths: ['Specific time ranges', 'Reason giving', 'Day distinctions'],
      improvements: ['More complex explanations'],
      justification: 'Good A2 level with practical information and basic reasoning.'
    },
    lexicalFeatures: ['best time', 'between', 'weekdays', 'usually', 'free', 'weekends', 'anytime'],
    grammarFeatures: ['superlative', 'time expressions', 'because clauses'],
    discourseMarkers: ['because', 'then']
  },

  // Q3_A1: Family - A1 Level
  {
    id: 'family-A1-01',
    promptId: 'Q3_A1',
    cefrLevel: 'A1',
    transcript: 'I have mother and father. My mother is teacher. My father is doctor. I have one brother. He is younger. No children.',
    scores: { fluency: 3.5, grammar: 3.0, vocabulary: 3.0, pronunciation: 3.5, prosody: 3.0, syntax: 3.0, coherence: 3.5 },
    feedback: {
      strengths: ['Basic family vocabulary', 'Simple comparisons'],
      improvements: ['Use articles', 'Connect sentences', 'Add more details'],
      justification: 'Basic A1 family description with essential information.'
    },
    lexicalFeatures: ['mother', 'father', 'teacher', 'doctor', 'brother', 'younger', 'children'],
    grammarFeatures: ['simple present', 'have got', 'comparative'],
    discourseMarkers: []
  },

  // Q5_A2: Yesterday activities - A2 Level
  {
    id: 'yesterday-A2-01',
    promptId: 'Q5_A2',
    cefrLevel: 'A2',
    transcript: 'Yesterday was Saturday, so I didn\'t work. In the morning, I went shopping with my sister. We bought some clothes and had lunch at a restaurant. In the afternoon, I stayed home and watched TV. It was a relaxing day.',
    scores: { fluency: 5.5, grammar: 5.0, vocabulary: 5.0, pronunciation: 5.0, prosody: 4.5, syntax: 5.0, coherence: 5.5 },
    feedback: {
      strengths: ['Good past tense control', 'Time sequencing', 'Connected narrative'],
      improvements: ['More descriptive adjectives', 'Complex sentences'],
      justification: 'Clear A2 level with good past tense usage and logical sequencing.'
    },
    lexicalFeatures: ['shopping', 'clothes', 'restaurant', 'relaxing'],
    grammarFeatures: ['past simple', 'negative forms', 'time expressions'],
    discourseMarkers: ['so', 'in the morning', 'in the afternoon']
  },

  // Q7_B1: Life in 10 years - B1 Level
  {
    id: 'future-B1-01',
    promptId: 'Q7_B1',
    cefrLevel: 'B1',
    transcript: 'I think my life will be quite different in ten years. First of all, I hope to finish my master\'s degree and find a better job in my field. I\'d also like to travel more and maybe live abroad for a while to improve my language skills. As for my personal life, I might get married and start a family, though I\'m not sure about that yet.',
    scores: { fluency: 6.5, grammar: 6.0, vocabulary: 6.5, pronunciation: 6.0, prosody: 6.0, syntax: 6.5, coherence: 7.0 },
    feedback: {
      strengths: ['Future forms variety', 'Personal reflection', 'Logical organization'],
      improvements: ['More sophisticated vocabulary', 'Complex subordination'],
      justification: 'Good B1 level showing ability to discuss future plans with appropriate uncertainty markers.'
    },
    lexicalFeatures: ['master\'s degree', 'field', 'abroad', 'improve', 'language skills', 'personal life'],
    grammarFeatures: ['future will', 'modal might', 'conditional would like', 'present perfect'],
    discourseMarkers: ['first of all', 'also', 'as for', 'though']
  },

  // Q8_B1: Best friend description - B1 Level
  {
    id: 'friend-B1-01',
    promptId: 'Q8_B1',
    cefrLevel: 'B1',
    transcript: 'My best friend is called Emma, and she\'s someone who really stands out in a crowd. Physically, she\'s quite tall with long curly red hair and bright green eyes. What I love most about her personality is that she\'s incredibly optimistic and always sees the positive side of things. She\'s also very reliable - if she promises to do something, you can be sure she\'ll follow through. We\'ve been friends since high school, and she\'s always been there for me during difficult times.',
    scores: { fluency: 6.5, grammar: 6.0, vocabulary: 6.5, pronunciation: 6.0, prosody: 6.0, syntax: 6.5, coherence: 7.0 },
    feedback: {
      strengths: ['Detailed physical description', 'Personality traits', 'Personal examples'],
      improvements: ['More sophisticated adjectives', 'Complex sentence variety'],
      justification: 'Solid B1 level with good descriptive language and personal connection.'
    },
    lexicalFeatures: ['stands out', 'crowd', 'physically', 'curly', 'bright', 'optimistic', 'positive side', 'reliable', 'promises', 'follow through', 'difficult times'],
    grammarFeatures: ['relative clauses', 'present perfect', 'conditional sentences'],
    discourseMarkers: ['what I love most', 'also', 'if', 'and']
  },

  // Q12_B2: Best experience - B2 Level
  {
    id: 'experience-B2-01',
    promptId: 'Q12_B2',
    cefrLevel: 'B2',
    transcript: 'The best experience I\'ve ever had was probably my volunteer work in rural Guatemala last year. What made it so special was not just the beautiful scenery, but the incredible warmth of the local community. I was helping to build a school, and even though I had no construction experience, the villagers were so patient in teaching me. By the end of the three weeks, I felt like I had gained a new perspective on life and formed genuine friendships that I still maintain today.',
    scores: { fluency: 7.5, grammar: 7.5, vocabulary: 8.0, pronunciation: 7.0, prosody: 7.0, syntax: 7.5, coherence: 8.0 },
    feedback: {
      strengths: ['Complex narrative structure', 'Emotional language', 'Cultural awareness'],
      improvements: ['Could include more specific examples'],
      justification: 'Strong B2 level with sophisticated vocabulary and ability to reflect on personal growth.'
    },
    lexicalFeatures: ['volunteer work', 'rural', 'scenery', 'incredible warmth', 'community', 'construction', 'patient', 'perspective', 'genuine friendships', 'maintain'],
    grammarFeatures: ['present perfect', 'past continuous', 'relative clauses', 'even though'],
    discourseMarkers: ['probably', 'what made it special', 'not just...but', 'even though', 'by the end']
  },

  // Q13_B2: Social media double-edged - B2 Level
  {
    id: 'social-media-B2-01',
    promptId: 'Q13_B2',
    cefrLevel: 'B2',
    transcript: 'People call social media a double-edged weapon because it has both positive and negative effects on society. On the positive side, it allows us to stay connected with friends and family across long distances, and it\'s a powerful tool for sharing information and raising awareness about important issues. However, on the negative side, it can lead to cyberbullying, the spread of misinformation, and addiction-like behaviors, especially among young people. The key is finding a balance and using these platforms responsibly.',
    scores: { fluency: 7.5, grammar: 7.5, vocabulary: 8.0, pronunciation: 7.0, prosody: 7.0, syntax: 7.5, coherence: 8.0 },
    feedback: {
      strengths: ['Balanced argumentation', 'Abstract concepts', 'Clear structure'],
      improvements: ['More nuanced examples'],
      justification: 'Strong B2 level with good analytical thinking and balanced perspective.'
    },
    lexicalFeatures: ['double-edged weapon', 'society', 'connected', 'distances', 'powerful tool', 'raising awareness', 'cyberbullying', 'misinformation', 'addiction-like behaviors', 'responsibly'],
    grammarFeatures: ['complex sentences', 'present perfect', 'modal can', 'especially'],
    discourseMarkers: ['because', 'on the positive side', 'however', 'on the negative side', 'the key is']
  },

  // Q18_C1: Business idea - C1 Level
  {
    id: 'business-C1-01',
    promptId: 'Q18_C1',
    cefrLevel: 'C1',
    transcript: 'If I were to establish my own enterprise, I would focus on sustainable technology solutions, specifically developing affordable solar energy systems for developing countries. The market opportunity is substantial, given the urgent need for clean energy infrastructure in regions where traditional power grids are either inadequate or non-existent. My target demographic would primarily comprise rural communities and small businesses that currently rely on expensive diesel generators. The pricing strategy would involve a tiered approach: basic systems for households starting at $500, with more comprehensive commercial packages scaling up to $5000, making clean energy accessible while ensuring profitability through volume sales and government partnerships.',
    scores: { fluency: 8.5, grammar: 8.5, vocabulary: 9.0, pronunciation: 8.0, prosody: 8.0, syntax: 8.5, coherence: 9.0 },
    feedback: {
      strengths: ['Sophisticated business vocabulary', 'Complex argumentation', 'Strategic thinking', 'Detailed analysis'],
      improvements: ['Already demonstrates C1 proficiency'],
      justification: 'Excellent C1 level with advanced vocabulary, complex sentence structures, and strategic business reasoning.'
    },
    lexicalFeatures: ['establish', 'enterprise', 'sustainable technology', 'affordable', 'infrastructure', 'inadequate', 'demographic', 'comprise', 'comprehensive', 'tiered approach', 'profitability'],
    grammarFeatures: ['second conditional', 'present perfect', 'complex relative clauses', 'passive voice', 'abstract nominalizations'],
    discourseMarkers: ['specifically', 'given that', 'primarily', 'while ensuring']
  },

  // Q19_C1: Solutions for poverty - C1 Level
  {
    id: 'poverty-C1-01',
    promptId: 'Q19_C1',
    cefrLevel: 'C1',
    transcript: 'Addressing the plight of the destitute requires a multifaceted approach that tackles both immediate needs and underlying systemic issues. In the short term, we need robust social safety nets including food assistance, temporary housing, and healthcare access. However, long-term solutions must focus on education and skills training programs that enable individuals to break the cycle of poverty. Furthermore, governments should implement progressive taxation and wealth redistribution policies, while simultaneously creating economic opportunities through infrastructure development and support for small businesses. International cooperation is also crucial, as poverty is often exacerbated by global economic inequalities.',
    scores: { fluency: 8.5, grammar: 8.5, vocabulary: 9.0, pronunciation: 8.0, prosody: 8.0, syntax: 8.5, coherence: 9.0 },
    feedback: {
      strengths: ['Advanced academic vocabulary', 'Complex policy analysis', 'Multi-level reasoning'],
      improvements: ['Already demonstrates C1 proficiency'],
      justification: 'Excellent C1 level with sophisticated analysis of complex social issues.'
    },
    lexicalFeatures: ['addressing', 'plight', 'destitute', 'multifaceted', 'underlying', 'systemic', 'robust', 'safety nets', 'progressive taxation', 'redistribution', 'simultaneously', 'exacerbated'],
    grammarFeatures: ['complex passive constructions', 'abstract nominalizations', 'conditional sentences'],
    discourseMarkers: ['however', 'furthermore', 'while simultaneously', 'also']
  },

  // Q22_C1: World peace - C1 Level
  {
    id: 'peace-C1-01',
    promptId: 'Q22_C1',
    cefrLevel: 'C1',
    transcript: 'Achieving world peace is arguably one of humanity\'s greatest challenges, requiring unprecedented levels of international cooperation and fundamental shifts in how we approach conflict resolution. I believe the path forward lies in strengthening multilateral institutions like the United Nations, while simultaneously addressing the root causes of conflict such as economic inequality, resource scarcity, and cultural misunderstanding. Education plays a pivotal role in fostering cross-cultural empathy and critical thinking skills. Moreover, we must prioritize diplomatic engagement over military intervention, investing heavily in peacekeeping and conflict prevention mechanisms. Ultimately, world peace will only be possible when we recognize our shared humanity and common interests.',
    scores: { fluency: 8.5, grammar: 8.5, vocabulary: 9.0, pronunciation: 8.0, prosody: 8.0, syntax: 8.5, coherence: 9.0 },
    feedback: {
      strengths: ['Sophisticated geopolitical vocabulary', 'Abstract reasoning', 'Idealistic yet practical approach'],
      improvements: ['Already demonstrates C1 proficiency'],
      justification: 'Excellent C1 level with advanced vocabulary and complex reasoning about global issues.'
    },
    lexicalFeatures: ['achieving', 'arguably', 'unprecedented', 'multilateral institutions', 'simultaneously', 'root causes', 'resource scarcity', 'pivotal role', 'cross-cultural empathy', 'diplomatic engagement', 'intervention', 'peacekeeping', 'mechanisms'],
    grammarFeatures: ['complex conditional', 'abstract nominalizations', 'participial phrases'],
    discourseMarkers: ['while simultaneously', 'moreover', 'ultimately', 'when']
  }
];

/**
 * Get sample responses for a specific prompt and CEFR level
 */
export const getSamplesByPromptAndLevel = (promptId: string, cefrLevel?: string): CEFRSampleResponse[] => {
  return sampleResponses.filter(sample => 
    sample.promptId === promptId && 
    (!cefrLevel || sample.cefrLevel === cefrLevel)
  );
};

/**
 * Get all samples for a prompt across all CEFR levels
 */
export const getSamplesByPrompt = (promptId: string): CEFRSampleResponse[] => {
  return sampleResponses.filter(sample => sample.promptId === promptId);
};

/**
 * Find the most similar sample response based on lexical overlap
 */
export const findMostSimilarSample = (
  userTranscript: string, 
  promptId: string
): { sample: CEFRSampleResponse; similarity: number } | null => {
  const promptSamples = getSamplesByPrompt(promptId);
  if (promptSamples.length === 0) return null;

  const userWords = userTranscript.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  let bestMatch = { sample: promptSamples[0], similarity: 0 };

  for (const sample of promptSamples) {
    const sampleWords = sample.transcript.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    const intersection = userWords.filter(word => sampleWords.includes(word));
    const similarity = intersection.length / Math.max(userWords.length, sampleWords.length);
    
    if (similarity > bestMatch.similarity) {
      bestMatch = { sample, similarity };
    }
  }

  return bestMatch;
};

/**
 * Calibrate user score based on similar sample
 */
export const calibrateScoreWithSample = (
  userTranscript: string,
  promptId: string,
  rawScores: any
): { adjustedScores: any; justification: string; referenceSample?: CEFRSampleResponse } => {
  const match = findMostSimilarSample(userTranscript, promptId);
  
  if (!match || match.similarity < 0.1) {
    return {
      adjustedScores: rawScores,
      justification: 'No suitable reference sample found for calibration.'
    };
  }

  const { sample, similarity } = match;
  const adjustedScores = { ...rawScores };
  
  // Adjust scores towards the reference sample based on similarity
  const adjustmentFactor = Math.min(0.3, similarity * 0.5); // Max 30% adjustment
  
  Object.keys(sample.scores).forEach(metric => {
    if (adjustedScores[metric] !== undefined) {
      const sampleScore = sample.scores[metric as keyof typeof sample.scores];
      const userScore = adjustedScores[metric];
      const difference = sampleScore - userScore;
      adjustedScores[metric] = userScore + (difference * adjustmentFactor);
    }
  });

  return {
    adjustedScores,
    justification: `Score calibrated using ${sample.cefrLevel} reference sample (${(similarity * 100).toFixed(1)}% similarity). ${sample.feedback.justification}`,
    referenceSample: sample
  };
};