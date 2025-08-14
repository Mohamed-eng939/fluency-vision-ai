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
  },
  
  // Added benchmark samples for Q1, Q3, Q4, Q5, Q6, Q7, Q8, Q9, Q10 (A1–C1)
  // Q1 – Introduce Yourself
  {
    id: 'Q1-A1-ali',
    promptId: 'Q1',
    cefrLevel: 'A1',
    transcript: 'My name is Ali. A-L-I. I am 20 years. I live Egypt. I student. I not married.',
    scores: { fluency: 2, grammar: 2, vocabulary: 2, pronunciation: 3, prosody: 2, syntax: 2, coherence: 2 },
    feedback: {
      strengths: ['Covers most points briefly'],
      improvements: ['Articles and be-verb usage', 'Add prepositions (live in Egypt)', 'Connect ideas'],
      justification: 'Sentence-level attempts with significant grammatical and lexical gaps. Basic meaning conveyed but low control.'
    },
    lexicalFeatures: ['name', 'age', 'live', 'student', 'married'],
    grammarFeatures: ['be-verb errors', 'article omission', 'prepositions missing'],
    discourseMarkers: []
  },
  {
    id: 'Q1-A2-ali',
    promptId: 'Q1',
    cefrLevel: 'A2',
    transcript: 'Hello, my name is Ali, spelled A-L-I. I\'m 20 years old and I come from Egypt. Now I live in Cairo with my family. I study economics at university and I am single.',
    scores: { fluency: 5, grammar: 6, vocabulary: 4, pronunciation: 5, prosody: 5, syntax: 5, coherence: 5 },
    feedback: {
      strengths: ['Clear, simple sequencing', 'All points addressed'],
      improvements: ['More varied connectors', 'Wider vocabulary'],
      justification: 'Solid A2 production. Accurate, slightly robotic, full coverage of expected content.'
    },
    lexicalFeatures: ['study at university', 'come from', 'live in'],
    grammarFeatures: ['present simple control', 'contractions'],
    discourseMarkers: ['now', 'and']
  },
  {
    id: 'Q1-B1-ali',
    promptId: 'Q1',
    cefrLevel: 'B1',
    transcript: 'Hi, my name is Ali — that\'s A-L-I. I\'m 20 years old and I\'m originally from Egypt, but I currently live in Cairo. I\'m studying economics at the university and I\'m single at the moment. I also work part-time in a bookstore.',
    scores: { fluency: 7, grammar: 7, vocabulary: 6, pronunciation: 6, prosody: 6, syntax: 6, coherence: 7 },
    feedback: {
      strengths: ['Well-sequenced', 'Natural linking words', 'Additional detail'],
      improvements: ['More lexical variety'],
      justification: 'Adequate development and accurate forms. Appropriate B1 fluency.'
    },
    lexicalFeatures: ['originally', 'currently', 'part-time'],
    grammarFeatures: ['present continuous', 'compound sentences'],
    discourseMarkers: ['but', 'also']
  },
  {
    id: 'Q1-B2-ali',
    promptId: 'Q1',
    cefrLevel: 'B2',
    transcript: 'My full name is Ali Mansour, spelled A-L-I M-A-N-S-O-U-R. I\'m 20 years old and I\'m from Alexandria, Egypt, where I\'ve lived all my life. I\'m currently an undergraduate student majoring in economics, and I work part-time in a local bookstore. As for my marital status, I\'m single.',
    scores: { fluency: 8, grammar: 9, vocabulary: 8, pronunciation: 8, prosody: 8, syntax: 8, coherence: 9 },
    feedback: {
      strengths: ['Formal register', 'Cohesive structure', 'Precise phrasing'],
      improvements: ['Slightly rehearsed tone'],
      justification: 'Excellent clarity and command; structurally accurate and appropriate.'
    },
    lexicalFeatures: ['undergraduate', 'majoring in', 'marital status'],
    grammarFeatures: ['embedded clauses', 'mix of tenses'],
    discourseMarkers: ['as for']
  },
  {
    id: 'Q1-C1-ali',
    promptId: 'Q1',
    cefrLevel: 'C1',
    transcript: 'Let me introduce myself — I\'m Ali Mansour, that\'s spelled A-L-I M-A-N-S-O-U-R. I\'m a 20-year-old Egyptian currently residing in Cairo. I\'m pursuing a degree in economics at the American University and balancing my studies with part-time work in retail. I\'m unmarried at this stage of my life.',
    scores: { fluency: 9, grammar: 9, vocabulary: 9, pronunciation: 9, prosody: 9, syntax: 9, coherence: 9 },
    feedback: {
      strengths: ['Sophisticated phrasing', 'Excellent flow', 'Varied structures'],
      improvements: [],
      justification: 'Advanced command with native-like phrasing and strong discourse.'
    },
    lexicalFeatures: ['residing', 'pursuing a degree', 'balancing studies'],
    grammarFeatures: ['compound-complex structures', 'participial phrases'],
    discourseMarkers: ['at this stage']
  },
  
  // Q3 – Introduce Your Family
  {
    id: 'Q3-A1-family',
    promptId: 'Q3',
    cefrLevel: 'A1',
    transcript: 'I have mother and father. My mother is nice. My father work. I have one sister. No children.',
    scores: { fluency: 3, grammar: 2, vocabulary: 3, pronunciation: 3, prosody: 3, syntax: 2, coherence: 3 },
    feedback: {
      strengths: ['Mentions required members'],
      improvements: ['Plural forms', 'Be-verb agreement', 'Add transitions'],
      justification: 'Meets bare minimum with unconnected ideas and multiple grammatical gaps.'
    },
    lexicalFeatures: ['mother', 'father', 'sister', 'children'],
    grammarFeatures: ['plural -s', 'third person -s', 'articles'],
    discourseMarkers: []
  },
  {
    id: 'Q3-A2-family',
    promptId: 'Q3',
    cefrLevel: 'A2',
    transcript: 'My family is small. I live with my mother and father. My mother is a teacher and my father is retired. I also have one brother. He is 10 years old. I don\'t have children.',
    scores: { fluency: 5, grammar: 6, vocabulary: 4, pronunciation: 5, prosody: 5, syntax: 5, coherence: 5 },
    feedback: {
      strengths: ['Clear coverage', 'Accurate present simple'],
      improvements: ['Reduce repetition', 'Add variety'],
      justification: 'A2 control of structures; simple but clear.'
    },
    lexicalFeatures: ['retired', 'years old', 'live with'],
    grammarFeatures: ['present simple', 'articles'],
    discourseMarkers: ['also']
  },
  {
    id: 'Q3-B1-family',
    promptId: 'Q3',
    cefrLevel: 'B1',
    transcript: 'I come from a small family. My parents both live in Cairo — my mother is a teacher and my father works in IT. I also have an older sister who is studying medicine. I don\'t have any children, but I love spending time with my niece.',
    scores: { fluency: 7, grammar: 7, vocabulary: 6, pronunciation: 6, prosody: 6, syntax: 6, coherence: 7 },
    feedback: {
      strengths: ['Varied structure', 'Natural phrasing'],
      improvements: ['More detail in roles'],
      justification: 'Well-rounded response with natural speech patterns at B1.'
    },
    lexicalFeatures: ['works in IT', 'studying medicine', 'niece'],
    grammarFeatures: ['relative clauses', 'present continuous'],
    discourseMarkers: ['also', 'but']
  },
  {
    id: 'Q3-B2-family',
    promptId: 'Q3',
    cefrLevel: 'B2',
    transcript: 'My family consists of four people. My father works as a systems engineer, and my mother manages a small clothing store. I also have one younger brother who\'s in high school. I don\'t have children myself, but I\'m very close to my cousins and often help babysit their kids.',
    scores: { fluency: 8, grammar: 8, vocabulary: 7, pronunciation: 8, prosody: 8, syntax: 8, coherence: 8 },
    feedback: {
      strengths: ['Good variety and cohesion', 'Accurate collocations'],
      improvements: ['Could add anecdotes'],
      justification: 'Strong lexical control and full development of task elements.'
    },
    lexicalFeatures: ['systems engineer', 'manage a store', 'babysit'],
    grammarFeatures: ['complex sentences', 'participles'],
    discourseMarkers: []
  },
  {
    id: 'Q3-C1-family',
    promptId: 'Q3',
    cefrLevel: 'C1',
    transcript: 'I come from a tight-knit nuclear family. My mother is a retired lecturer and my father, who used to work in finance, now spends most of his time volunteering. I have two siblings — a younger brother who\'s an engineer and a sister currently pursuing her master\'s degree abroad. I\'m not a parent myself, but I\'m actively involved in my godson\'s upbringing.',
    scores: { fluency: 9, grammar: 9, vocabulary: 9, pronunciation: 9, prosody: 9, syntax: 9, coherence: 9 },
    feedback: {
      strengths: ['Sophisticated structure', 'Idiomatic phrasing'],
      improvements: [],
      justification: 'Clearly above B2 in development and control.'
    },
    lexicalFeatures: ['tight-knit', 'retired lecturer', 'pursuing her degree', 'involved in upbringing'],
    grammarFeatures: ['embedded clauses', 'modifier control'],
    discourseMarkers: []
  },
  
  // Q4 – Daily Routine
  {
    id: 'Q4-A1-routine',
    promptId: 'Q4',
    cefrLevel: 'A1',
    transcript: 'I wake up. I eat. I go work. I sleep. I watch TV. Every day same.',
    scores: { fluency: 2, grammar: 2, vocabulary: 2, pronunciation: 3, prosody: 2, syntax: 2, coherence: 2 },
    feedback: {
      strengths: ['Basic actions conveyed'],
      improvements: ['Prepositions', 'Transitions', 'Articles'],
      justification: 'Minimal communication with major accuracy issues.'
    },
    lexicalFeatures: ['wake up', 'eat', 'watch TV'],
    grammarFeatures: ['verb patterns', 'articles', 'prepositions'],
    discourseMarkers: []
  },
  {
    id: 'Q4-A2-routine',
    promptId: 'Q4',
    cefrLevel: 'A2',
    transcript: 'I usually wake up at 7. I eat breakfast, then I go to work at 8. After work, I go home and have dinner. I watch TV and sleep at 10.',
    scores: { fluency: 5, grammar: 6, vocabulary: 4, pronunciation: 5, prosody: 5, syntax: 5, coherence: 5 },
    feedback: {
      strengths: ['Logical sequence', 'Correct present simple'],
      improvements: ['Reduce repetition', 'Add variety of connectors'],
      justification: 'Logical sequence with basic variety; limited but full information.'
    },
    lexicalFeatures: ['go to work', 'have dinner'],
    grammarFeatures: ['present simple', 'time expressions'],
    discourseMarkers: ['then', 'after']
  },
  {
    id: 'Q4-B1-routine',
    promptId: 'Q4',
    cefrLevel: 'B1',
    transcript: 'On weekdays, I usually wake up around 6:30 and go for a short run. I take a shower, have a quick breakfast, and head to work by 8. In the evening, I cook dinner and relax by watching a movie or reading. I usually go to bed by 11.',
    scores: { fluency: 7, grammar: 7, vocabulary: 6, pronunciation: 6, prosody: 6, syntax: 6, coherence: 7 },
    feedback: {
      strengths: ['Time flow', 'Natural phrasing'],
      improvements: ['More complex variety'],
      justification: 'Good B1 fluency and structure; all steps stated.'
    },
    lexicalFeatures: ['head to work', 'quick breakfast'],
    grammarFeatures: ['adverbs of frequency', 'present simple/continuous'],
    discourseMarkers: ['in the evening']
  },
  {
    id: 'Q4-B2-routine',
    promptId: 'Q4',
    cefrLevel: 'B2',
    transcript: 'My daily routine starts early. I get up at 6:30 and usually go for a run if the weather is nice. After showering, I make breakfast and catch up on the news while eating. I leave for the office at 8:30. Evenings are more relaxed — I either cook dinner, meet friends, or unwind with a book. I aim to be in bed by 11.',
    scores: { fluency: 8, grammar: 8, vocabulary: 7, pronunciation: 8, prosody: 8, syntax: 8, coherence: 8 },
    feedback: {
      strengths: ['Varied structures', 'Idiomatic collocations'],
      improvements: ['Minor style refinements'],
      justification: 'Fluent, organized, enriched with lexical variety.'
    },
    lexicalFeatures: ['catch up on the news', 'unwind with a book', 'aim to'],
    grammarFeatures: ['conditionals', 'participial phrases'],
    discourseMarkers: ['while']
  },
  {
    id: 'Q4-C1-routine',
    promptId: 'Q4',
    cefrLevel: 'C1',
    transcript: 'Typically, I start my day around 6:30 with some light stretching or a quick jog, depending on my energy level. I prepare a healthy breakfast and skim through a few headlines before heading to work by 8:30. My workday is packed, but I try to take a walk during lunch. In the evening, I either meet friends, catch up on reading, or work on personal projects. I wind down by journaling and go to bed around 11.',
    scores: { fluency: 9, grammar: 9, vocabulary: 9, pronunciation: 9, prosody: 9, syntax: 9, coherence: 9 },
    feedback: {
      strengths: ['Nuanced modifiers', 'Excellent cohesion'],
      improvements: [],
      justification: 'C1-level control with embedded nuance and balance.'
    },
    lexicalFeatures: ['skim through', 'wind down', 'work on personal projects'],
    grammarFeatures: ['adverbials', 'clause embedding'],
    discourseMarkers: ['depending on']
  },
  
  // Q5 – Yesterday / Last day off
  {
    id: 'Q5-A1-yesterday',
    promptId: 'Q5',
    cefrLevel: 'A1',
    transcript: 'I go shopping. I eat pizza. I sleep. I happy.',
    scores: { fluency: 2, grammar: 2, vocabulary: 2, pronunciation: 3, prosody: 2, syntax: 2, coherence: 2 },
    feedback: {
      strengths: ['Basic ideas communicated'],
      improvements: ['Past tense forms', 'Articles', 'Time sequencing'],
      justification: 'Functional at word/phrase level; lacks tense and structure.'
    },
    lexicalFeatures: ['shopping', 'pizza'],
    grammarFeatures: ['past simple errors', 'be-verb missing'],
    discourseMarkers: []
  },
  {
    id: 'Q5-A2-yesterday',
    promptId: 'Q5',
    cefrLevel: 'A2',
    transcript: 'Yesterday, I went to the mall with my sister. We bought some clothes and had lunch there. After that, I came home and watched TV. It was a nice day.',
    scores: { fluency: 5, grammar: 6, vocabulary: 4, pronunciation: 5, prosody: 5, syntax: 5, coherence: 5 },
    feedback: {
      strengths: ['Correct past simple', 'Clear sequencing'],
      improvements: ['More detail and variety'],
      justification: 'A2 control with ability to sequence events.'
    },
    lexicalFeatures: ['went to the mall', 'had lunch', 'came home'],
    grammarFeatures: ['past simple'],
    discourseMarkers: ['after that']
  },
  {
    id: 'Q5-B1-yesterday',
    promptId: 'Q5',
    cefrLevel: 'B1',
    transcript: 'On my last day off, I visited my grandparents in the countryside. We spent the afternoon cooking together and talking about old memories. In the evening, I helped them clean the garden, then I took the train back home. It was tiring but very rewarding.',
    scores: { fluency: 7, grammar: 7, vocabulary: 6, pronunciation: 6, prosody: 6, syntax: 6, coherence: 7 },
    feedback: {
      strengths: ['Clear time flow', 'Varied actions'],
      improvements: ['More complex linking'],
      justification: 'Well-organized and fluent; fully relevant to task.'
    },
    lexicalFeatures: ['countryside', 'took the train', 'rewarding'],
    grammarFeatures: ['past simple/continuous'],
    discourseMarkers: ['in the evening', 'then']
  },
  {
    id: 'Q5-B2-yesterday',
    promptId: 'Q5',
    cefrLevel: 'B2',
    transcript: 'Yesterday, I took the opportunity to completely unplug from work. I went for a hike in the nearby hills, had lunch at a small café, and then spent the rest of the afternoon reading. In the evening, I watched a documentary and prepared for the upcoming week. It was a refreshing break.',
    scores: { fluency: 8, grammar: 8, vocabulary: 7, pronunciation: 8, prosody: 8, syntax: 8, coherence: 8 },
    feedback: {
      strengths: ['Nuanced vocabulary', 'Consistent tone'],
      improvements: ['Minor stylistic variation'],
      justification: 'Highly coherent with nuanced vocabulary and tense accuracy.'
    },
    lexicalFeatures: ['unplug', 'refreshing break', 'upcoming week'],
    grammarFeatures: ['past narration'],
    discourseMarkers: []
  },
  {
    id: 'Q5-C1-yesterday',
    promptId: 'Q5',
    cefrLevel: 'C1',
    transcript: 'On my most recent day off, I deliberately avoided digital distractions. I started my morning with some journaling and meditation, followed by a long walk in the park. In the afternoon, I attended a virtual seminar on behavioral psychology, then wrapped up the day by cooking dinner for my family. It was a calm but intellectually fulfilling day.',
    scores: { fluency: 9, grammar: 9, vocabulary: 9, pronunciation: 9, prosody: 9, syntax: 9, coherence: 9 },
    feedback: {
      strengths: ['Sophisticated language', 'Excellent structure'],
      improvements: [],
      justification: 'Sophisticated and expressive with precise language and discourse.'
    },
    lexicalFeatures: ['deliberately', 'intellectually fulfilling', 'wrapped up the day'],
    grammarFeatures: ['complex clauses', 'perfect tenses'],
    discourseMarkers: []
  },
  
  // Q6 – Plans this week
  {
    id: 'Q6-A1-plans',
    promptId: 'Q6',
    cefrLevel: 'A1',
    transcript: 'I go school. I going to work. I meet my friend. I eat pizza.',
    scores: { fluency: 2, grammar: 2, vocabulary: 2, pronunciation: 3, prosody: 2, syntax: 2, coherence: 2 },
    feedback: {
      strengths: ['Intentions partly clear'],
      improvements: ['Be going to structure', 'Prepositions', 'Articles'],
      justification: 'Intentions expressed at word level; very limited control.'
    },
    lexicalFeatures: ['go to school', 'meet friend'],
    grammarFeatures: ['future forms errors'],
    discourseMarkers: []
  },
  {
    id: 'Q6-A2-plans',
    promptId: 'Q6',
    cefrLevel: 'A2',
    transcript: 'This week I\'m going to work every day. On Wednesday, I\'m going to visit my cousin. I also want to go shopping on the weekend.',
    scores: { fluency: 5, grammar: 6, vocabulary: 4, pronunciation: 5, prosody: 5, syntax: 5, coherence: 5 },
    feedback: {
      strengths: ['Appropriate future forms', 'Clear time markers'],
      improvements: ['Add more events'],
      justification: 'Future plans stated clearly using appropriate tenses.'
    },
    lexicalFeatures: ['visit my cousin', 'go shopping'],
    grammarFeatures: ['be going to', 'present continuous'],
    discourseMarkers: ['on Wednesday', 'also']
  },
  {
    id: 'Q6-B1-plans',
    promptId: 'Q6',
    cefrLevel: 'B1',
    transcript: 'This week is going to be quite busy. I\'m working full-time from Monday to Friday, but I\'m planning to visit my grandparents on Saturday. On Sunday, I\'ll probably stay home and clean the apartment or watch a movie.',
    scores: { fluency: 7, grammar: 7, vocabulary: 6, pronunciation: 6, prosody: 6, syntax: 6, coherence: 7 },
    feedback: {
      strengths: ['Mixed future structures', 'Good organization'],
      improvements: ['Reduce repetition'],
      justification: 'Well-rounded B1 response with accurate grammar and structure.'
    },
    lexicalFeatures: ['probably', 'clean the apartment'],
    grammarFeatures: ['going to', 'will', 'present continuous'],
    discourseMarkers: ['but']
  },
  {
    id: 'Q6-B2-plans',
    promptId: 'Q6',
    cefrLevel: 'B2',
    transcript: 'This week, I\'ve got several commitments lined up. I\'m going to start a new online course on marketing, and I\'ve scheduled a few client meetings for midweek. I\'m also planning to meet some friends on Friday night. Over the weekend, I\'ll try to relax and spend some time with my family.',
    scores: { fluency: 8, grammar: 8, vocabulary: 7, pronunciation: 8, prosody: 8, syntax: 8, coherence: 8 },
    feedback: {
      strengths: ['Strong control of structures', 'Time-specific organization'],
      improvements: ['Minor stylistic variety'],
      justification: 'Organized and confident with varied vocabulary and tenses.'
    },
    lexicalFeatures: ['commitments lined up', 'scheduled', 'spend time'],
    grammarFeatures: ['mixed future', 'modals'],
    discourseMarkers: []
  },
  {
    id: 'Q6-C1-plans',
    promptId: 'Q6',
    cefrLevel: 'C1',
    transcript: 'This week is shaping up to be quite productive. I\'m kicking things off with a team strategy meeting on Monday, followed by two client presentations midweek. In the evenings, I plan to continue working on my thesis, and I\'ve also penciled in time for the gym. Over the weekend, I\'ll either take a short trip to the coast or catch up on reading. It depends on how the week goes.',
    scores: { fluency: 9, grammar: 9, vocabulary: 9, pronunciation: 9, prosody: 9, syntax: 9, coherence: 9 },
    feedback: {
      strengths: ['Idiomatic expressions', 'Nuanced sequencing'],
      improvements: [],
      justification: 'Sophisticated delivery with excellent structural control.'
    },
    lexicalFeatures: ['shaping up', 'penciled in', 'kick things off'],
    grammarFeatures: ['conditionals', 'mixed future structures'],
    discourseMarkers: ['followed by', 'either']
  },
  
  // Q7 – Life in 10 years
  {
    id: 'Q7-A1-future',
    promptId: 'Q7',
    cefrLevel: 'A1',
    transcript: 'I be rich. I have big car. I no work. I happy. I play football.',
    scores: { fluency: 2, grammar: 2, vocabulary: 2, pronunciation: 3, prosody: 2, syntax: 2, coherence: 2 },
    feedback: {
      strengths: ['Some future intent'],
      improvements: ['Be-verb forms', 'Articles', 'Connect ideas'],
      justification: 'Fragmented desires rather than a projection.'
    },
    lexicalFeatures: ['rich', 'big car'],
    grammarFeatures: ['be-verb errors', 'negation errors'],
    discourseMarkers: []
  },
  {
    id: 'Q7-A2-future',
    promptId: 'Q7',
    cefrLevel: 'A2',
    transcript: 'In ten years, I think I will have a job and maybe a family. I will live in a nice house and work as an engineer. I want to travel to different countries also.',
    scores: { fluency: 5, grammar: 6, vocabulary: 4, pronunciation: 5, prosody: 5, syntax: 5, coherence: 5 },
    feedback: {
      strengths: ['Basic speculation', 'Correct will-future'],
      improvements: ['Transitions', 'Avoid repetition'],
      justification: 'Basic future speculation with moderate control.'
    },
    lexicalFeatures: ['work as an engineer', 'travel to countries'],
    grammarFeatures: ['will-future', 'modals'],
    discourseMarkers: ['maybe', 'also']
  },
  {
    id: 'Q7-B1-future',
    promptId: 'Q7',
    cefrLevel: 'B1',
    transcript: 'In the next ten years, I hope to be working in my field and living in a different country. I think I\'ll have more responsibilities, maybe even a family. I also want to improve my English so I can work internationally.',
    scores: { fluency: 7, grammar: 7, vocabulary: 6, pronunciation: 6, prosody: 6, syntax: 6, coherence: 7 },
    feedback: {
      strengths: ['Cohesive ideas', 'Appropriate hedging'],
      improvements: ['More complex subordination'],
      justification: 'Clear, realistic prediction with cohesive ideas.'
    },
    lexicalFeatures: ['responsibilities', 'work internationally'],
    grammarFeatures: ['future continuous', 'hope to'],
    discourseMarkers: ['maybe', 'also']
  },
  {
    id: 'Q7-B2-future',
    promptId: 'Q7',
    cefrLevel: 'B2',
    transcript: 'A decade from now, I imagine my life will look quite different. I expect to be working in a leadership position, possibly in a different country. I\'ll probably have a family by then, and I hope to be financially independent. I also plan to dedicate more time to personal growth, like learning languages and volunteering.',
    scores: { fluency: 8, grammar: 8, vocabulary: 7, pronunciation: 8, prosody: 8, syntax: 8, coherence: 8 },
    feedback: {
      strengths: ['Structured reflection', 'Nuanced vocabulary'],
      improvements: ['More specifics'],
      justification: 'Complex, abstract thoughts articulated clearly.'
    },
    lexicalFeatures: ['leadership position', 'financially independent', 'personal growth'],
    grammarFeatures: ['modals', 'future continuous'],
    discourseMarkers: ['by then', 'also']
  },
  {
    id: 'Q7-C1-future',
    promptId: 'Q7',
    cefrLevel: 'C1',
    transcript: 'In ten years, I anticipate living abroad and having advanced significantly in my career. Ideally, I\'ll be managing a team or running my own company, focusing on projects I find meaningful. On a personal level, I expect to have a family and a better work–life balance. I also hope to be contributing to social causes, perhaps through mentoring or charity work. Life will be more structured, but hopefully more fulfilling as well.',
    scores: { fluency: 9, grammar: 9, vocabulary: 9, pronunciation: 9, prosody: 9, syntax: 9, coherence: 9 },
    feedback: {
      strengths: ['Advanced abstraction', 'Mature tone'],
      improvements: [],
      justification: 'Advanced abstraction and reflection with wide syntactic range.'
    },
    lexicalFeatures: ['work–life balance', 'mentoring', 'fulfilling'],
    grammarFeatures: ['future perfect/continuous', 'complex conditionals'],
    discourseMarkers: []
  },
  
  // Q8 – Best friend description
  {
    id: 'Q8-A1-friend',
    promptId: 'Q8',
    cefrLevel: 'A1',
    transcript: 'My friend is nice. He is tall. He has black hair. He is good. He is funny. I like him.',
    scores: { fluency: 3, grammar: 3, vocabulary: 2, pronunciation: 3, prosody: 3, syntax: 3, coherence: 2 },
    feedback: {
      strengths: ['Covers both appearance and personality'],
      improvements: ['Add linking', 'Use wider adjectives', 'Elaborate'],
      justification: 'Simple adjective listing; meaningful but lacks elaboration.'
    },
    lexicalFeatures: ['tall', 'funny', 'black hair'],
    grammarFeatures: ['present simple', 'adjectives'],
    discourseMarkers: []
  },
  {
    id: 'Q8-A2-friend',
    promptId: 'Q8',
    cefrLevel: 'A2',
    transcript: 'My best friend is short and has curly brown hair. She wears glasses and usually wears jeans and T-shirts. She is friendly and always helps me when I have problems. We laugh a lot together.',
    scores: { fluency: 5, grammar: 6, vocabulary: 4, pronunciation: 5, prosody: 5, syntax: 5, coherence: 5 },
    feedback: {
      strengths: ['Appearance + personality', 'Behavior-linked traits'],
      improvements: ['Variety in connectors/adjectives'],
      justification: 'Descriptive, accurate, and linked to behavior.'
    },
    lexicalFeatures: ['curly hair', 'wears glasses', 'laugh a lot'],
    grammarFeatures: ['present simple', 'adverbs of frequency'],
    discourseMarkers: []
  },
  {
    id: 'Q8-B1-friend',
    promptId: 'Q8',
    cefrLevel: 'B1',
    transcript: 'My best friend is a tall guy with short dark hair and a very athletic build. He usually wears casual clothes and has a big smile that makes people feel comfortable. Personality-wise, he’s outgoing, honest, and always makes jokes. We’ve been friends for years, and I really admire how confident and caring he is.',
    scores: { fluency: 7, grammar: 7, vocabulary: 6, pronunciation: 6, prosody: 6, syntax: 6, coherence: 7 },
    feedback: {
      strengths: ['Clear linking between appearance and traits', 'Personal examples'],
      improvements: ['More sophisticated adjectives'],
      justification: 'Well-developed and relevant with fluent description.'
    },
    lexicalFeatures: ['athletic build', 'outgoing', 'admire'],
    grammarFeatures: ['present perfect', 'relative clauses'],
    discourseMarkers: []
  },
  {
    id: 'Q8-B2-friend',
    promptId: 'Q8',
    cefrLevel: 'B2',
    transcript: 'My best friend has a slim build, wavy shoulder-length hair, and a warm smile that immediately puts people at ease. She tends to dress creatively, always adding a personal touch to her outfits. What I appreciate most is her sense of empathy—she’s a great listener, incredibly supportive, and knows how to lift my mood when I’m down.',
    scores: { fluency: 8, grammar: 8, vocabulary: 8, pronunciation: 8, prosody: 8, syntax: 8, coherence: 8 },
    feedback: {
      strengths: ['Advanced collocations', 'Smooth transition from physical to emotional'],
      improvements: [],
      justification: 'Balanced structure with emotional nuance and fluent control.'
    },
    lexicalFeatures: ['puts people at ease', 'personal touch', 'lift my mood'],
    grammarFeatures: ['descriptive clauses', 'adverbials'],
    discourseMarkers: []
  },
  {
    id: 'Q8-C1-friend',
    promptId: 'Q8',
    cefrLevel: 'C1',
    transcript: 'My closest friend stands out, not just because of his striking appearance—tall, lean, with sharp features and expressive eyes—but also due to his magnetic personality. He has a dry sense of humor, is exceptionally articulate, and maintains a calm presence even under stress. I particularly value his emotional intelligence and the way he engages in meaningful conversations without being judgmental.',
    scores: { fluency: 9, grammar: 9, vocabulary: 9, pronunciation: 9, prosody: 9, syntax: 9, coherence: 9 },
    feedback: {
      strengths: ['Sophisticated descriptors', 'High cohesion'],
      improvements: [],
      justification: 'Deep description with mature language and varied structure.'
    },
    lexicalFeatures: ['striking appearance', 'magnetic personality', 'dry sense of humor', 'emotional intelligence'],
    grammarFeatures: ['clause embedding', 'modifiers'],
    discourseMarkers: []
  },
  
  // Q9 – Borrowed money
  {
    id: 'Q9-A1-borrow',
    promptId: 'Q9',
    cefrLevel: 'A1',
    transcript: 'Yes, I borrow money. My friend give me. I need buy phone. I pay later.',
    scores: { fluency: 2, grammar: 2, vocabulary: 2, pronunciation: 3, prosody: 2, syntax: 2, coherence: 2 },
    feedback: {
      strengths: ['Core meaning present'],
      improvements: ['Past/present perfect forms', 'Verb patterns'],
      justification: 'Heavily flawed grammar and lack of tenses impair clarity.'
    },
    lexicalFeatures: ['borrow', 'pay later'],
    grammarFeatures: ['verb forms', 'articles'],
    discourseMarkers: []
  },
  {
    id: 'Q9-A2-borrow',
    promptId: 'Q9',
    cefrLevel: 'A2',
    transcript: 'Yes, I borrowed money last year from my brother. I wanted to buy a new laptop for school. He helped me, and I paid him back after two months.',
    scores: { fluency: 5, grammar: 6, vocabulary: 4, pronunciation: 5, prosody: 5, syntax: 5, coherence: 5 },
    feedback: {
      strengths: ['Past simple accuracy', 'Full answer with reason'],
      improvements: ['More detail or reflection'],
      justification: 'Functional, accurate, with clear time reference and context.'
    },
    lexicalFeatures: ['paid back', 'buy a laptop'],
    grammarFeatures: ['past simple'],
    discourseMarkers: []
  },
  {
    id: 'Q9-B1-borrow',
    promptId: 'Q9',
    cefrLevel: 'B1',
    transcript: 'Yes, I have borrowed money a couple of times. Once, I needed help covering rent when I lost my job, and another time was for unexpected car repairs. Both times, I returned the money quickly. I really appreciated the support during difficult moments.',
    scores: { fluency: 7, grammar: 7, vocabulary: 6, pronunciation: 6, prosody: 6, syntax: 6, coherence: 7 },
    feedback: {
      strengths: ['Present perfect + past simple mix', 'Clear explanations'],
      improvements: ['More variety of connectors'],
      justification: 'Clear examples, reasoning, and reflection show solid B1.'
    },
    lexicalFeatures: ['covering rent', 'unexpected repairs', 'appreciated the support'],
    grammarFeatures: ['present perfect with frequency', 'past simple events'],
    discourseMarkers: []
  },
  {
    id: 'Q9-B2-borrow',
    promptId: 'Q9',
    cefrLevel: 'B2',
    transcript: 'I have borrowed money a few times in the past, mostly due to emergencies. One specific situation was when my laptop broke right before final exams, and I couldn\'t afford to buy a new one immediately. A friend lent me the money, and I made sure to repay her within a month. It was a stressful situation, but I learned to manage my finances better afterward.',
    scores: { fluency: 8, grammar: 8, vocabulary: 7, pronunciation: 8, prosody: 8, syntax: 8, coherence: 8 },
    feedback: {
      strengths: ['Structured progression', 'Accurate grammar'],
      improvements: ['Minor stylistic variation'],
      justification: 'Fluent, logically structured with reflection and accurate grammar.'
    },
    lexicalFeatures: ['afford', 'repay', 'manage finances'],
    grammarFeatures: ['present perfect + past simple', 'modals'],
    discourseMarkers: []
  },
  {
    id: 'Q9-C1-borrow',
    promptId: 'Q9',
    cefrLevel: 'C1',
    transcript: 'Yes, I have, although I generally avoid borrowing unless absolutely necessary. A few years ago, I faced an unexpected medical bill, and my savings weren\'t enough to cover the expense. A close colleague kindly offered to help, and I paid them back in installments over three months. The experience made me more mindful of financial planning and taught me to build an emergency fund.',
    scores: { fluency: 9, grammar: 9, vocabulary: 9, pronunciation: 9, prosody: 9, syntax: 9, coherence: 9 },
    feedback: {
      strengths: ['Sophisticated vocabulary', 'Cause-effect logic'],
      improvements: [],
      justification: 'High-level lexical accuracy and complex sentence structure.'
    },
    lexicalFeatures: ['installments', 'financial planning', 'emergency fund'],
    grammarFeatures: ['perfect tenses', 'complex subordination'],
    discourseMarkers: []
  },
  
  // Q10 – Heard about a crime
  {
    id: 'Q10-A1-crime',
    promptId: 'Q10',
    cefrLevel: 'A1',
    transcript: 'Yes, I hear crime. Man take bag. Police come. He go jail.',
    scores: { fluency: 2, grammar: 2, vocabulary: 2, pronunciation: 3, prosody: 2, syntax: 2, coherence: 2 },
    feedback: {
      strengths: ['Core meaning communicated'],
      improvements: ['Past forms', 'Articles', 'Sequencing'],
      justification: 'Very basic output with incomplete story structure and tense control.'
    },
    lexicalFeatures: ['police', 'jail'],
    grammarFeatures: ['past tense errors'],
    discourseMarkers: []
  },
  {
    id: 'Q10-A2-crime',
    promptId: 'Q10',
    cefrLevel: 'A2',
    transcript: 'Yes, I heard about a crime near my house last year. A man stole a phone from a woman in the street. People saw him and called the police. They caught him after five minutes.',
    scores: { fluency: 5, grammar: 6, vocabulary: 4, pronunciation: 5, prosody: 5, syntax: 5, coherence: 5 },
    feedback: {
      strengths: ['Accurate past simple', 'Full example'],
      improvements: ['Add detail or reflection'],
      justification: 'Short but logically structured and grammatically sound narrative.'
    },
    lexicalFeatures: ['stole a phone', 'called the police', 'caught him'],
    grammarFeatures: ['past simple'],
    discourseMarkers: []
  },
  {
    id: 'Q10-B1-crime',
    promptId: 'Q10',
    cefrLevel: 'B1',
    transcript: 'Yes, I remember a case that happened two years ago in my neighborhood. Someone broke into a small shop at night and stole money and electronics. Fortunately, the police found the person using security camera footage. It made me feel unsafe for a while.',
    scores: { fluency: 7, grammar: 7, vocabulary: 6, pronunciation: 6, prosody: 6, syntax: 6, coherence: 7 },
    feedback: {
      strengths: ['Clear structure', 'Emotional impact'],
      improvements: ['More detail or analysis'],
      justification: 'Detailed and well-paced recount with proper tenses.'
    },
    lexicalFeatures: ['broke into', 'security footage', 'felt unsafe'],
    grammarFeatures: ['past simple/continuous'],
    discourseMarkers: []
  },
  {
    id: 'Q10-B2-crime',
    promptId: 'Q10',
    cefrLevel: 'B2',
    transcript: 'Yes, I read about a robbery at a local bank last year. The criminals managed to escape with a large amount of money and weren\'t caught for several weeks. The article explained how they planned the crime, using fake IDs and stolen vehicles. It was like something from a movie, and I was surprised such a thing could happen in my city.',
    scores: { fluency: 8, grammar: 8, vocabulary: 7, pronunciation: 8, prosody: 8, syntax: 8, coherence: 8 },
    feedback: {
      strengths: ['Strong storytelling', 'Accurate tenses', 'Idiomatic vocabulary'],
      improvements: [],
      justification: 'Descriptive, detailed, and complete with accurate vocabulary.'
    },
    lexicalFeatures: ['robbery', 'fake IDs', 'stolen vehicles'],
    grammarFeatures: ['past perfect', 'modals'],
    discourseMarkers: []
  },
  {
    id: 'Q10-C1-crime',
    promptId: 'Q10',
    cefrLevel: 'C1',
    transcript: 'Yes, I vividly remember a high-profile crime that occurred during my final year at university. A group of cybercriminals hacked into a local company’s database and stole sensitive client information. The case received national attention because of the scale and sophistication of the breach. What shocked me most was that the perpetrators were never caught, which sparked a major debate about online security and law enforcement capabilities.',
    scores: { fluency: 9, grammar: 9, vocabulary: 9, pronunciation: 9, prosody: 9, syntax: 9, coherence: 9 },
    feedback: {
      strengths: ['Strong narrative arc', 'Abstract reflection'],
      improvements: [],
      justification: 'Well-structured with detailed narrative and abstract reflection.'
    },
    lexicalFeatures: ['cybercriminals', 'sensitive data', 'perpetrators', 'sparked debate'],
    grammarFeatures: ['passive voice', 'embedded clauses'],
    discourseMarkers: []
  }
  
  // Additional Q11-Q23 samples will be added with proper syntax
};
    id: 'q21_a1',
    promptId: 'q21',
    level: 'A1',
    transcript: "I like clothes. I wear jeans and shirt. I don't like fashion show. I buy clothes in shop. My style is simple.",
    scores: {
      vocabulary: 2,
      grammar: 2,
      coherence: 2,
      lexicalCollocation: 2,
      taskAchievement: 3
    },
    finalCEFR: 'A1',
    rationale: 'The learner can express a simple opinion but with extremely limited range and fluency.',
    lexicalFeatures: ['jeans', 'shirt', 'shop'],
    grammarFeatures: ['basic present simple', 'some errors'],
    discourseMarkers: []
  },
  'q21_a2': {
    id: 'q21_a2',
    promptId: 'q21',
    level: 'A2',
    transcript: "I like fashion a little. I don't follow trends, but I like to look nice. I buy clothes online, like jackets and shoes. I don't care about brands. My favorite color is black because it's easy to wear.",
    scores: {
      vocabulary: 4,
      grammar: 5,
      coherence: 5,
      lexicalCollocation: 4,
      taskAchievement: 7
    },
    finalCEFR: 'A2',
    rationale: 'A straightforward and personal answer with some topic control.',
    lexicalFeatures: ['trends', 'brands', 'favorite color'],
    grammarFeatures: ['mostly correct simple tenses'],
    discourseMarkers: ['but', 'because']
  },
  'q21_b1': {
    id: 'q21_b1',
    promptId: 'q21',
    level: 'B1',
    transcript: "I'm fairly interested in fashion, especially casual styles. I like to look presentable, but I don't follow every new trend. I usually shop during sales and try to buy clothes that are comfortable and affordable. I think fashion is important for self-expression, but it's not the most important thing for me.",
    scores: {
      vocabulary: 6,
      grammar: 7,
      coherence: 7,
      lexicalCollocation: 7,
      taskAchievement: 10
    },
    finalCEFR: 'B1',
    rationale: 'Expresses a balanced opinion with topic-specific examples.',
    lexicalFeatures: ['presentable', 'affordable', 'self-expression'],
    grammarFeatures: ['conditionals', 'contrasting structures'],
    discourseMarkers: ['especially', 'but', 'usually']
  },
  'q21_b2': {
    id: 'q21_b2',
    promptId: 'q21',
    level: 'B2',
    transcript: "I would say I'm moderately interested in fashion. I don't chase every seasonal trend, but I care about how I present myself, especially in professional settings. I appreciate minimalist styles and neutral colors, and I tend to choose brands that align with my values, like sustainability. For me, fashion is less about appearance and more about identity.",
    scores: {
      vocabulary: 8,
      grammar: 8,
      coherence: 8,
      lexicalCollocation: 8,
      taskAchievement: 10
    },
    finalCEFR: 'B2',
    rationale: 'Rich, introspective response with fluent control and structure.',
    lexicalFeatures: ['seasonal trend', 'professional settings', 'sustainability'],
    grammarFeatures: ['modal phrasing', 'contrast clauses', 'passive voice'],
    discourseMarkers: ['especially', 'like', 'for me']
  },
  'q21_c1': {
    id: 'q21_c1',
    promptId: 'q21',
    level: 'C1',
    transcript: "I consider fashion a dynamic form of self-expression that reflects culture, personality, and even politics. While I don't obsess over high fashion or designer brands, I'm deeply interested in the evolution of trends and how they mirror societal shifts. I tend to invest in pieces that are both stylish and ethically made, and I appreciate designers who blend functionality with innovation.",
    scores: {
      vocabulary: 9,
      grammar: 9,
      coherence: 9,
      lexicalCollocation: 9,
      taskAchievement: 10
    },
    finalCEFR: 'C1',
    rationale: 'Complex ideas expressed with fluency, reflection, and stylistic maturity.',
    lexicalFeatures: ['self-expression', 'mirror societal shifts', 'ethically made'],
    grammarFeatures: ['sophisticated clause structures', 'nominalizations'],
    discourseMarkers: ['while', 'and even', 'both...and']
  },
  
  // Q22 – World peace approach
  'q22_a1': {
    id: 'q22_a1',
    promptId: 'q22',
    level: 'A1',
    transcript: "Peace is good. No war. People be nice. No fight. Everyone happy. World is quiet.",
    scores: {
      vocabulary: 2,
      grammar: 2,
      coherence: 2,
      lexicalCollocation: 2,
      taskAchievement: 3
    },
    finalCEFR: 'A1',
    rationale: 'Understands the basic theme, but lacks language control or elaboration.',
    lexicalFeatures: ['peace', 'war', 'happy'],
    grammarFeatures: ['minimal sentence control', 'missing auxiliary verbs'],
    discourseMarkers: []
  },
  'q22_a2': {
    id: 'q22_a2',
    promptId: 'q22',
    level: 'A2',
    transcript: "World peace is possible if countries stop fighting. Leaders should talk and work together. Also, people can learn to respect each other. If we help poor people and give education, we can stop hate. I hope world peace can come soon.",
    scores: {
      vocabulary: 4,
      grammar: 5,
      coherence: 5,
      lexicalCollocation: 4,
      taskAchievement: 7
    },
    finalCEFR: 'A2',
    rationale: 'Covers key ideas in simple language with basic linking.',
    lexicalFeatures: ['respect', 'leaders', 'education'],
    grammarFeatures: ['modals', 'conditionals'],
    discourseMarkers: ['if', 'also']
  },
  'q22_b1': {
    id: 'q22_b1',
    promptId: 'q22',
    level: 'B1',
    transcript: "World peace requires cooperation between nations and respect among cultures. Governments must prioritize dialogue over violence and invest in education, especially for the younger generation. People also need to be more tolerant and open-minded. If we focus on solving poverty and injustice, there will be fewer reasons for conflict.",
    scores: {
      vocabulary: 6,
      grammar: 7,
      coherence: 7,
      lexicalCollocation: 7,
      taskAchievement: 10
    },
    finalCEFR: 'B1',
    rationale: 'Well-organized, addresses the question with cause-effect logic and relevant vocabulary.',
    lexicalFeatures: ['tolerant', 'dialogue', 'invest in education'],
    grammarFeatures: ['modal verbs', 'complex structures'],
    discourseMarkers: ['especially', 'also', 'if']
  },
  'q22_b2': {
    id: 'q22_b2',
    promptId: 'q22',
    level: 'B2',
    transcript: "Achieving world peace is a complex challenge that requires action on multiple levels. Countries must strengthen diplomatic relationships and collaborate on global issues like climate change and inequality. Educating youth about empathy, human rights, and nonviolence can create long-term cultural change. Social media can also play a role in promoting understanding, rather than spreading division.",
    scores: {
      vocabulary: 8,
      grammar: 8,
      coherence: 8,
      lexicalCollocation: 8,
      taskAchievement: 10
    },
    finalCEFR: 'B2',
    rationale: 'Addresses the topic with both breadth and depth, using elevated vocabulary.',
    lexicalFeatures: ['diplomatic relationships', 'cultural change', 'nonviolence'],
    grammarFeatures: ['passive voice', 'modals', 'nominalizations'],
    discourseMarkers: ['like', 'rather than', 'also']
  },
  'q22_c1': {
    id: 'q22_c1',
    promptId: 'q22',
    level: 'C1',
    transcript: "World peace cannot be attained through idealism alone—it demands structural reform, cultural empathy, and persistent diplomacy. At the geopolitical level, disarmament and transparent governance are key. Equally important are grassroots movements that foster intercultural dialogue and media that amplifies narratives of unity rather than division. Peace is a process, not an event, and must be embedded in education systems, policies, and everyday behavior.",
    scores: {
      vocabulary: 9,
      grammar: 9,
      coherence: 9,
      lexicalCollocation: 9,
      taskAchievement: 10
    },
    finalCEFR: 'C1',
    rationale: 'Mature, philosophical response with layered structure and abstract reasoning.',
    lexicalFeatures: ['disarmament', 'transparent governance', 'intercultural dialogue'],
    grammarFeatures: ['high-level academic register', 'conditionals', 'nominal phrases'],
    discourseMarkers: ['equally important', 'rather than', 'not...but']
  },
  
  // Q23 – Technology and ecology quote reflection
  'q23_a1': {
    id: 'q23_a1',
    promptId: 'q23',
    level: 'A1',
    transcript: "Technology is good. Ecology is trees and animals. Sorry is good when you do bad. Technology maybe hurt trees. People should say sorry.",
    scores: {
      vocabulary: 2,
      grammar: 2,
      coherence: 2,
      lexicalCollocation: 2,
      taskAchievement: 3
    },
    finalCEFR: 'A1',
    rationale: 'Can identify individual elements but lacks ability to relate or reflect meaningfully.',
    lexicalFeatures: ['trees', 'sorry'],
    grammarFeatures: ['simple present only', 'limited control'],
    discourseMarkers: ['maybe']
  },
  'q23_a2': {
    id: 'q23_a2',
    promptId: 'q23',
    level: 'A2',
    transcript: "The quote means that technology sometimes makes problems for nature. For example, pollution from cars or factories. People use too much energy and hurt the earth. So, we must be more careful and protect animals, water, and trees.",
    scores: {
      vocabulary: 4,
      grammar: 5,
      coherence: 5,
      lexicalCollocation: 4,
      taskAchievement: 7
    },
    finalCEFR: 'A2',
    rationale: 'Simple, clear answer with environmental awareness and causal logic.',
    lexicalFeatures: ['pollution', 'protect', 'nature'],
    grammarFeatures: ['mostly correct present/simple past', 'modals used'],
    discourseMarkers: ['for example', 'so']
  },
  'q23_b1': {
    id: 'q23_b1',
    promptId: 'q23',
    level: 'B1',
    transcript: "I think the quote means that technological progress has harmed the environment in many ways. For example, factories cause air and water pollution, and cars release too much CO2. While technology helps humans, it often damages nature. So, we must balance progress with environmental care and invest in green energy.",
    scores: {
      vocabulary: 6,
      grammar: 7,
      coherence: 7,
      lexicalCollocation: 7,
      taskAchievement: 10
    },
    finalCEFR: 'B1',
    rationale: 'Good use of real-world examples and moderately abstract reasoning.',
    lexicalFeatures: ['progress', 'pollution', 'green energy'],
    grammarFeatures: ['cause/effect', 'modals', 'present perfect'],
    discourseMarkers: ['for example', 'while', 'so']
  },
  'q23_b2': {
    id: 'q23_b2',
    promptId: 'q23',
    level: 'B2',
    transcript: "The quote suggests that technological advancement has often come at the expense of ecological balance. Industrialization has led to deforestation, biodiversity loss, and rising carbon emissions. In this sense, 'an apology' symbolizes a moral responsibility. We now have the tools to reverse some damage—renewable energy, eco-friendly design—but must act intentionally and globally.",
    scores: {
      vocabulary: 8,
      grammar: 8,
      coherence: 8,
      lexicalCollocation: 8,
      taskAchievement: 10
    },
    finalCEFR: 'B2',
    rationale: 'Rich vocabulary and insight, approaching academic tone.',
    lexicalFeatures: ['deforestation', 'ecological balance', 'biodiversity'],
    grammarFeatures: ['complex', 'accurate', 'well-sequenced'],
    discourseMarkers: ['in this sense', 'but']
  },
  'q23_c1': {
    id: 'q23_c1',
    promptId: 'q23',
    level: 'C1',
    transcript: "This quote encapsulates the moral tension between human progress and environmental degradation. For centuries, technological innovation—from industrial machines to digital infrastructure—has prioritized speed and profit over sustainability. The 'apology' metaphor implies a reckoning, urging us to reconcile innovation with stewardship. As we enter the age of AI and automation, the real challenge is designing systems that regenerate rather than extract.",
    scores: {
      vocabulary: 9,
      grammar: 9,
      coherence: 9,
      lexicalCollocation: 9,
      taskAchievement: 10
    },
    finalCEFR: 'C1',
    rationale: 'Mature insight, native-level phrasing, and seamless development.',
    lexicalFeatures: ['encapsulates', 'reckoning', 'stewardship', 'regenerate'],
  },
  
  // Q11 – Internet usage duration and habits
  {
    id: 'Q11-A1-internet',
    promptId: 'Q11_B1',
    cefrLevel: 'A1',
    transcript: 'I use internet five years. I look YouTube. I chat. I like internet. It good.',
    scores: { fluency: 2, grammar: 2, vocabulary: 2, pronunciation: 3, prosody: 2, syntax: 2, coherence: 2 },
    feedback: {
      strengths: ['Answers both parts minimally (how long and how)'],
      improvements: ['Use auxiliaries (have been)', 'Present perfect form', 'Add prepositions (use the internet, look at YouTube)'],
      justification: 'Low grammatical control and limited vocabulary. Idea communicated at word level.'
    },
    lexicalFeatures: ['YouTube', 'chat', 'internet'],
    grammarFeatures: ['present simple errors', 'missing auxiliaries', 'target: present perfect continuous'],
    discourseMarkers: []
  },
  {
    id: 'Q11-A2-internet',
    promptId: 'Q11_B1',
    cefrLevel: 'A2',
    transcript: 'I have used the internet for about six years. I usually use it to watch videos, chat with friends, and check the news. I use my phone and sometimes my laptop.',
    scores: { fluency: 5, grammar: 6, vocabulary: 4, pronunciation: 5, prosody: 5, syntax: 5, coherence: 5 },
    feedback: {
      strengths: ['Correct present perfect duration', 'Clear list of uses'],
      improvements: ['Reduce repetition', 'Add variety of connectors'],
      justification: 'Functional, on-topic, and structurally sound for A2.'
    },
    lexicalFeatures: ['watch videos', 'chat with friends', 'check the news', 'laptop'],
    grammarFeatures: ['present perfect', 'adverbs of frequency'],
    discourseMarkers: ['usually', 'and']
  },
  {
    id: 'Q11-B1-internet',
    promptId: 'Q11_B1',
    cefrLevel: 'B1',
    transcript: 'I’ve been using the internet for around ten years, mostly for entertainment and communication. I check my emails daily, use social media like Instagram and Facebook, and watch series on streaming platforms. It’s also useful for online shopping and reading articles.',
    scores: { fluency: 7, grammar: 7, vocabulary: 6, pronunciation: 6, prosody: 6, syntax: 6, coherence: 7 },
    feedback: {
      strengths: ['Appropriate use of present perfect continuous', 'Well-organized by function'],
      improvements: ['Add more variety of connectors'],
      justification: 'Structured, varied, and fluent; shows range of uses.'
    },
    lexicalFeatures: ['streaming platforms', 'online shopping', 'reading articles', 'social media'],
    grammarFeatures: ['present perfect continuous', 'habitual present'],
    discourseMarkers: ['mostly', 'also']
  },
  {
    id: 'Q11-B2-internet',
    promptId: 'Q11_B1',
    cefrLevel: 'B2',
    transcript: 'I’ve been actively using the internet for over 15 years. It plays a central role in my daily life—from managing emails and remote work to staying updated through podcasts and digital newspapers. I also take online courses and use cloud tools for collaboration. It’s become almost impossible to function without it.',
    scores: { fluency: 8, grammar: 8, vocabulary: 7, pronunciation: 8, prosody: 8, syntax: 8, coherence: 8 },
    feedback: {
      strengths: ['Advanced collocations', 'Clear categorization of habits'],
      improvements: ['Minor stylistic variation'],
      justification: 'Detailed, specific, and reflective; clear B2 control.'
    },
    lexicalFeatures: ['cloud tools', 'digital newspapers', 'remote work', 'podcasts', 'collaboration'],
    grammarFeatures: ['present perfect', 'complex noun phrases'],
    discourseMarkers: ['from … to', 'also']
  },
  {
    id: 'Q11-C1-internet',
    promptId: 'Q11_B1',
    cefrLevel: 'C1',
    transcript: 'I’ve been using the internet extensively for nearly two decades, both personally and professionally. I rely on it for remote collaboration, research, and staying connected with global events. I also use it as a learning tool—taking online certifications, reading academic papers, and attending webinars. Its integration into my workflow is so seamless that I rarely distinguish between “online” and “offline” activities anymore.',
    scores: { fluency: 9, grammar: 9, vocabulary: 9, pronunciation: 9, prosody: 9, syntax: 9, coherence: 9 },
    feedback: {
      strengths: ['Sophisticated register', 'Abstract commentary', 'Excellent cohesion'],
      improvements: [],
      justification: 'Demonstrates digital fluency and high lexical sophistication.'
    },
    lexicalFeatures: ['remote collaboration', 'certifications', 'workflow', 'webinars', 'integration'],
    grammarFeatures: ['embedded clauses', 'perfect aspect control'],
    discourseMarkers: ['both … and', 'that']
  },
  
  // Q12 – Best experience ever gained
  {
    id: 'Q12-A1-experience',
    promptId: 'Q12_B2',
    cefrLevel: 'A1',
    transcript: 'I have good experience. I go to beach. I swim. I happy. It nice.',
    scores: { fluency: 2, grammar: 2, vocabulary: 2, pronunciation: 3, prosody: 2, syntax: 2, coherence: 2 },
    feedback: {
      strengths: ['Basic idea conveyed'],
      improvements: ['Use past tense and present perfect', 'Add description', 'Fix be-verb and article use'],
      justification: 'Very limited vocabulary and grammar; no structure or depth.'
    },
    lexicalFeatures: ['beach', 'swim'],
    grammarFeatures: ['past tense errors', 'present perfect target'],
    discourseMarkers: []
  },
  {
    id: 'Q12-A2-experience',
    promptId: 'Q12_B2',
    cefrLevel: 'A2',
    transcript: 'My best experience was a trip to the mountains with my family. We went last summer. I liked the weather and we did hiking. I saw animals and took many pictures. It was fun and relaxing.',
    scores: { fluency: 5, grammar: 6, vocabulary: 4, pronunciation: 5, prosody: 5, syntax: 5, coherence: 5 },
    feedback: {
      strengths: ['Clear sequence', 'Correct past simple'],
      improvements: ['Improve collocations (go hiking)', 'Add transitions'],
      justification: 'Basic but complete; on-topic with simple reasoning.'
    },
    lexicalFeatures: ['trip', 'mountains', 'pictures', 'relaxing'],
    grammarFeatures: ['past simple', 'time expressions'],
    discourseMarkers: ['last summer']
  },
  {
    id: 'Q12-B1-experience',
    promptId: 'Q12_B2',
    cefrLevel: 'B1',
    transcript: 'One of the best experiences I’ve ever had was studying abroad for a semester in Spain. I made new friends, improved my Spanish, and learned about a new culture. At first it was difficult, but it helped me become more independent and open-minded. It’s something I’ll never forget.',
    scores: { fluency: 7, grammar: 7, vocabulary: 6, pronunciation: 6, prosody: 6, syntax: 6, coherence: 7 },
    feedback: {
      strengths: ['Balanced narrative and reflection'],
      improvements: ['Add more specific examples'],
      justification: 'Controlled grammar with clear emotional tone; well organized.'
    },
    lexicalFeatures: ['studying abroad', 'independent', 'open-minded'],
    grammarFeatures: ['present perfect', 'past simple'],
    discourseMarkers: ['at first', 'but']
  },
  {
    id: 'Q12-B2-experience-2',
    promptId: 'Q12_B2',
    cefrLevel: 'B2',
    transcript: 'The best experience I’ve ever gained was volunteering at a refugee center during my last year of university. It gave me the opportunity to connect with people from different backgrounds and understand their challenges. I organized activities for children, helped with language lessons, and even translated documents. The experience not only improved my communication skills, but also shaped my perspective on social responsibility.',
    scores: { fluency: 8, grammar: 8, vocabulary: 8, pronunciation: 8, prosody: 8, syntax: 8, coherence: 8 },
    feedback: {
      strengths: ['Clear intro–development–reflection', 'Strong collocations'],
      improvements: [],
      justification: 'Fluent, structured narrative with impact.'
    },
    lexicalFeatures: ['refugee center', 'translated documents', 'social responsibility'],
    grammarFeatures: ['present perfect', 'past perfect (implied)', 'complex clauses'],
    discourseMarkers: ['not only … but also']
  },
  {
    id: 'Q12-C1-experience',
    promptId: 'Q12_B2',
    cefrLevel: 'C1',
    transcript: 'The most transformative experience I’ve ever had was launching a student-led environmental campaign during high school. It began as a small initiative but evolved into a regional awareness project with media coverage and community events. Coordinating a team, dealing with setbacks, and presenting to stakeholders taught me project management and leadership under pressure. It was formative in shaping my current interest in sustainability and policy-making.',
    scores: { fluency: 9, grammar: 9, vocabulary: 9, pronunciation: 9, prosody: 9, syntax: 9, coherence: 9 },
    feedback: {
      strengths: ['Sophisticated structure', 'Abstract reasoning', 'Rich collocations'],
      improvements: [],
      justification: 'C1-level storytelling with advanced control and insight.'
    },
    lexicalFeatures: ['student-led campaign', 'media coverage', 'stakeholders', 'policy-making'],
    grammarFeatures: ['nominalizations', 'embedded clauses', 'participial phrases'],
    discourseMarkers: ['while', 'as']
  },
  
  // Q13 – Social media double-edged weapon
  {
    id: 'Q13-A1-social',
    promptId: 'Q13_B2',
    cefrLevel: 'A1',
    transcript: 'Social media is good and bad. People use it. Sometimes it make problem. Sometimes it help. I like it.',
    scores: { fluency: 2, grammar: 2, vocabulary: 2, pronunciation: 3, prosody: 2, syntax: 2, coherence: 2 },
    feedback: {
      strengths: ['States both sides minimally'],
      improvements: ['Verb agreement', 'Examples and reasons', 'Linking words'],
      justification: 'Extremely basic with minimal logic or language control.'
    },
    lexicalFeatures: ['social media'],
    grammarFeatures: ['present simple errors'],
    discourseMarkers: []
  },
  {
    id: 'Q13-A2-social',
    promptId: 'Q13_B2',
    cefrLevel: 'A2',
    transcript: 'Social media helps people to talk and share pictures. But sometimes people write bad things and make others sad. It is good and bad at the same time.',
    scores: { fluency: 5, grammar: 5, vocabulary: 4, pronunciation: 5, prosody: 5, syntax: 5, coherence: 5 },
    feedback: {
      strengths: ['Clear contrast', 'Functional cause–effect'],
      improvements: ['Add detail and variety'],
      justification: 'Shows contrast and purpose but lacks depth.'
    },
    lexicalFeatures: ['share pictures', 'write bad things'],
    grammarFeatures: ['contrast with but', 'present simple'],
    discourseMarkers: ['but']
  },
  {
    id: 'Q13-B1-social',
    promptId: 'Q13_B2',
    cefrLevel: 'B1',
    transcript: 'Social media is seen as a double-edged weapon because it has both positive and negative sides. On the one hand, it helps people stay connected and share ideas. On the other hand, it can cause stress, spread fake news, and even hurt mental health. It depends on how people use it.',
    scores: { fluency: 7, grammar: 7, vocabulary: 6, pronunciation: 6, prosody: 6, syntax: 6, coherence: 7 },
    feedback: {
      strengths: ['Structured contrast', 'Relevant examples'],
      improvements: ['More nuance or mitigation language'],
      justification: 'Clear, well-organized argument at B1.'
    },
    lexicalFeatures: ['stay connected', 'fake news', 'mental health'],
    grammarFeatures: ['on the one hand / other hand', 'modals'],
    discourseMarkers: ['because', 'on the one hand', 'on the other hand']
  },
  {
    id: 'Q13-B2-social',
    promptId: 'Q13_B2',
    cefrLevel: 'B2',
    transcript: 'Social media is often called a double-edged weapon because while it connects people across the world and provides platforms for self-expression, it also facilitates cyberbullying, misinformation, and screen addiction. Many users are influenced by unrealistic beauty standards or become anxious from constant online comparisons. It’s a powerful tool that requires responsible use.',
    scores: { fluency: 8, grammar: 8, vocabulary: 8, pronunciation: 8, prosody: 8, syntax: 8, coherence: 8 },
    feedback: {
      strengths: ['Advanced vocabulary', 'Nuanced contrast'],
      improvements: [],
      justification: 'Fluent, logical, and well-developed B2 response.'
    },
    lexicalFeatures: ['self-expression', 'cyberbullying', 'unrealistic standards', 'responsible use'],
    grammarFeatures: ['complex sentences', 'subordination'],
    discourseMarkers: ['while', 'also']
  },
  {
    id: 'Q13-C1-social',
    promptId: 'Q13_B2',
    cefrLevel: 'C1',
    transcript: 'Describing social media as a double-edged weapon highlights its paradoxical nature—it empowers free speech and social movements, yet simultaneously enables disinformation, manipulation, and polarization. While it democratizes information and offers marginalized voices a platform, it also amplifies hate speech and echo chambers. This duality makes it both a revolutionary tool and a societal risk, depending largely on regulation and media literacy.',
    scores: { fluency: 9, grammar: 9, vocabulary: 9, pronunciation: 9, prosody: 9, syntax: 9, coherence: 9 },
    feedback: {
      strengths: ['Academic register', 'Conceptual clarity'],
      improvements: [],
      justification: 'Expert-level reflection with high lexical and structural range.'
    },
    lexicalFeatures: ['paradoxical nature', 'democratizes', 'echo chambers', 'media literacy'],
    grammarFeatures: ['nominalizations', 'passive voice'],
    discourseMarkers: ['while', 'yet']
  },
  
  // Q14 – Roots of terrorism
  {
    id: 'Q14-A1-terrorism',
    promptId: 'Q14_B2',
    cefrLevel: 'A1',
    transcript: 'Terrorism is bad. People fight. People die. It make people sad and scared.',
    scores: { fluency: 2, grammar: 2, vocabulary: 2, pronunciation: 3, prosody: 2, syntax: 2, coherence: 2 },
    feedback: {
      strengths: ['Recognizes topic'],
      improvements: ['Explain causes', 'Correct verbs', 'Add connectors'],
      justification: 'Emotion shown but lacks grammar, vocabulary, and structure.'
    },
    lexicalFeatures: ['sad', 'scared'],
    grammarFeatures: ['present simple errors'],
    discourseMarkers: []
  },
  {
    id: 'Q14-A2-terrorism',
    promptId: 'Q14_B2',
    cefrLevel: 'A2',
    transcript: 'Terrorism happens because some people are angry or poor. They don’t have job or food. They do bad things to show their problems. It is dangerous and makes people afraid.',
    scores: { fluency: 5, grammar: 5, vocabulary: 4, pronunciation: 5, prosody: 5, syntax: 5, coherence: 5 },
    feedback: {
      strengths: ['Basic cause–effect'],
      improvements: ['Wider vocabulary', 'More precise reasons'],
      justification: 'Structurally sound but limited in scope and precision.'
    },
    lexicalFeatures: ['dangerous', 'problems'],
    grammarFeatures: ['because-clauses', 'present simple'],
    discourseMarkers: ['because']
  },
  {
    id: 'Q14-B1-terrorism',
    promptId: 'Q14_B2',
    cefrLevel: 'B1',
    transcript: 'There are many reasons why terrorism exists. One cause is poverty—when people don’t have enough resources or jobs, they may become angry and join extremist groups. Another reason is politics or religion, especially if people feel oppressed or treated unfairly. These groups use violence to send messages or gain power, which is very harmful to society.',
    scores: { fluency: 7, grammar: 7, vocabulary: 6, pronunciation: 6, prosody: 6, syntax: 6, coherence: 7 },
    feedback: {
      strengths: ['Clear organization', 'Appropriate lexis'],
      improvements: ['Add more nuanced linking'],
      justification: 'Strong structure with reasons and explanation.'
    },
    lexicalFeatures: ['extremist groups', 'gain power', 'treated unfairly'],
    grammarFeatures: ['conditionals', 'modals of possibility'],
    discourseMarkers: ['another reason', 'which']
  },
  {
    id: 'Q14-B2-terrorism',
    promptId: 'Q14_B2',
    cefrLevel: 'B2',
    transcript: 'Terrorism can be rooted in a combination of political, economic, and ideological factors. In some cases, individuals join terrorist organizations because they feel marginalized or powerless in their society. Unstable governments, foreign intervention, and lack of education can also contribute to radicalization. Moreover, social media sometimes spreads hate speech and propaganda, further encouraging violent actions.',
    scores: { fluency: 8, grammar: 8, vocabulary: 8, pronunciation: 8, prosody: 8, syntax: 8, coherence: 8 },
    feedback: {
      strengths: ['Balanced analysis', 'Advanced topic vocabulary'],
      improvements: [],
      justification: 'Insightful argument with solid cohesion at B2.'
    },
    lexicalFeatures: ['marginalized', 'radicalization', 'propaganda'],
    grammarFeatures: ['passive voice', 'complex clauses'],
    discourseMarkers: ['in some cases', 'moreover']
  },
  {
    id: 'Q14-C1-terrorism',
    promptId: 'Q14_B2',
    cefrLevel: 'C1',
    transcript: 'The origins of terrorism are multifaceted, stemming from deep-seated political grievances, socio-economic disparity, and ideological manipulation. Often, terrorist groups exploit vulnerable populations by appealing to identity, religion, or nationalism, turning personal frustration into collective violence. In regions with weak governance or historical injustice, radical narratives thrive. Additionally, global connectivity allows extremist ideologies to spread rapidly through digital platforms, further complicating efforts to address root causes.',
    scores: { fluency: 9, grammar: 9, vocabulary: 9, pronunciation: 9, prosody: 9, syntax: 9, coherence: 9 },
    feedback: {
      strengths: ['High lexical range', 'Sophisticated reasoning'],
      improvements: [],
      justification: 'Advanced, abstract analysis with mature phrasing.'
    },
    lexicalFeatures: ['deep-seated grievances', 'ideological manipulation', 'historical injustice'],
    grammarFeatures: ['nominalizations', 'participial phrases', 'subordination'],
    discourseMarkers: ['additionally', 'often']
  },
  
  // Q15 – Regret about youth
  {
    id: 'Q15-A1-regret',
    promptId: 'Q15_B2',
    cefrLevel: 'A1',
    transcript: 'When I small, I go school late. I not listen teacher. I play games. I think bad.',
    scores: { fluency: 2, grammar: 2, vocabulary: 2, pronunciation: 3, prosody: 2, syntax: 2, coherence: 2 },
    feedback: {
      strengths: ['Regret implied'],
      improvements: ['Use modals of regret (shouldn’t have…)','Use past forms','Add cause–effect'],
      justification: 'Conveys regret but lacks grammar and vocabulary to express it.'
    },
    lexicalFeatures: ['play games', 'listen to the teacher'],
    grammarFeatures: ['modal of regret target', 'past simple errors'],
    discourseMarkers: []
  },
  {
    id: 'Q15-A2-regret',
    promptId: 'Q15_B2',
    cefrLevel: 'A2',
    transcript: 'I think I shouldn’t have stopped studying English when I was a child. I wanted to play with friends more, so I didn’t go to class. Now, I think it was a mistake.',
    scores: { fluency: 5, grammar: 6, vocabulary: 4, pronunciation: 5, prosody: 5, syntax: 5, coherence: 5 },
    feedback: {
      strengths: ['Correct modal of regret', 'Clear explanation'],
      improvements: ['Add more detail'],
      justification: 'Direct and functional with basic coherence.'
    },
    lexicalFeatures: ['study English', 'go to class', 'play with friends'],
    grammarFeatures: ['shouldn’t have + past participle', 'past simple'],
    discourseMarkers: ['so', 'now']
  },
  {
    id: 'Q15-B1-regret',
    promptId: 'Q15_B2',
    cefrLevel: 'B1',
    transcript: 'When I was younger, I shouldn’t have wasted so much time playing video games. I didn’t study enough, and as a result, I struggled in school. If I had been more focused, maybe I could have had better grades. I learned from this and now manage my time better.',
    scores: { fluency: 7, grammar: 7, vocabulary: 6, pronunciation: 6, prosody: 6, syntax: 6, coherence: 7 },
    feedback: {
      strengths: ['Modal of regret + conditional', 'Clear cause–effect'],
      improvements: ['Add concrete examples'],
      justification: 'Accurate and reflective with strong structure.'
    },
    lexicalFeatures: ['wasted time', 'struggled', 'better grades', 'manage my time'],
    grammarFeatures: ['third conditional', 'modal of regret'],
    discourseMarkers: ['as a result', 'if']
  },
  {
    id: 'Q15-B2-regret',
    promptId: 'Q15_B2',
    cefrLevel: 'B2',
    transcript: 'Looking back, I probably shouldn’t have ignored my parents’ advice about learning a second language earlier. At the time, I thought it wasn’t important, but now I realize how much easier it would’ve been to start young. This mistake taught me the value of taking opportunities seriously.',
    scores: { fluency: 8, grammar: 8, vocabulary: 8, pronunciation: 8, prosody: 8, syntax: 8, coherence: 8 },
    feedback: {
      strengths: ['Balanced reflection', 'Advanced collocations'],
      improvements: [],
      justification: 'Natural tone and grammatically complex B2 response.'
    },
    lexicalFeatures: ['ignored advice', 'take opportunities seriously', 'start young'],
    grammarFeatures: ['modals of regret', 'reported thought'],
    discourseMarkers: ['at the time', 'but now']
  },
  {
    id: 'Q15-C1-regret',
    promptId: 'Q15_B2',
    cefrLevel: 'C1',
    transcript: 'In retrospect, I shouldn’t have dismissed extracurricular activities as a waste of time during my school years. While I focused solely on academics, I missed out on developing soft skills like teamwork and communication. This narrow approach, although academically rewarding, left me socially unprepared in my early career. That realization pushed me to intentionally grow in those areas later.',
    scores: { fluency: 9, grammar: 9, vocabulary: 9, pronunciation: 9, prosody: 9, syntax: 9, coherence: 9 },
    feedback: {
      strengths: ['Sophisticated modals and structure', 'Abstract reflection'],
      improvements: [],
      justification: 'Mature, cohesive, and linguistically rich.'
    },
    lexicalFeatures: ['extracurricular', 'soft skills', 'socially unprepared'],
    grammarFeatures: ['nominalization', 'contrastive clauses'],
    discourseMarkers: ['while', 'although']
  },
  
  // Q16 – Maintaining stable relationships
  {
    id: 'Q16-A1-relationships',
    promptId: 'Q16_B2',
    cefrLevel: 'A1',
    transcript: 'To have good friends, you be nice. Talk good. Not angry. Help friend. Be happy.',
    scores: { fluency: 2, grammar: 2, vocabulary: 2, pronunciation: 3, prosody: 2, syntax: 2, coherence: 2 },
    feedback: {
      strengths: ['Intent expressed'],
      improvements: ['Use modals (should, can)', 'Correct sentences', 'Add reasons'],
      justification: 'On theme but undeveloped and inaccurate.'
    },
    lexicalFeatures: ['friends', 'help'],
    grammarFeatures: ['modal target', 'imperatives'],
    discourseMarkers: []
  },
  {
    id: 'Q16-A2-relationships',
    promptId: 'Q16_B2',
    cefrLevel: 'A2',
    transcript: 'To keep good relationships, you should be kind and listen. People want respect and help. You can call your family and friends to talk and not forget them. This makes people happy.',
    scores: { fluency: 5, grammar: 5, vocabulary: 4, pronunciation: 5, prosody: 5, syntax: 5, coherence: 5 },
    feedback: {
      strengths: ['Advice structures with modals', 'Logical sequence'],
      improvements: ['Add variety and examples'],
      justification: 'Clear message with simple grammar and vocabulary.'
    },
    lexicalFeatures: ['respect', 'listen', 'call your family'],
    grammarFeatures: ['should/can modals', 'condition/result'],
    discourseMarkers: ['to', 'and']
  },
  {
    id: 'Q16-B1-relationships',
    promptId: 'Q16_B2',
    cefrLevel: 'B1',
    transcript: 'Stable relationships are possible when people make time for each other and communicate openly. Trust and honesty are very important. I think saying sorry when you make a mistake and showing appreciation regularly help keep relationships strong. Also, it’s important to solve problems together instead of ignoring them.',
    scores: { fluency: 7, grammar: 7, vocabulary: 6, pronunciation: 6, prosody: 6, syntax: 6, coherence: 7 },
    feedback: {
      strengths: ['Actionable advice', 'Good collocations'],
      improvements: ['Add conditional framing'],
      justification: 'Relevant, organized, and natural B1 response.'
    },
    lexicalFeatures: ['make time', 'show appreciation', 'solve problems'],
    grammarFeatures: ['modals', 'infinitive clauses'],
    discourseMarkers: ['also', 'instead of']
  },
  {
    id: 'Q16-B2-relationships',
    promptId: 'Q16_B2',
    cefrLevel: 'B2',
    transcript: 'Maintaining stable relationships requires mutual effort, emotional intelligence, and consistent communication. Being able to express feelings without judgment, admit mistakes, and resolve disagreements constructively plays a key role. Additionally, respecting boundaries and giving space when needed helps prevent conflict and resentment.',
    scores: { fluency: 8, grammar: 8, vocabulary: 8, pronunciation: 8, prosody: 8, syntax: 8, coherence: 8 },
    feedback: {
      strengths: ['Advanced vocabulary', 'Constructive framing'],
      improvements: [],
      justification: 'Mature reasoning with clear, cohesive development.'
    },
    lexicalFeatures: ['emotional intelligence', 'constructively', 'boundaries', 'resentment'],
    grammarFeatures: ['gerund phrases', 'complex clauses'],
    discourseMarkers: ['additionally']
  },
  {
    id: 'Q16-C1-relationships',
    promptId: 'Q16_B2',
    cefrLevel: 'C1',
    transcript: 'Long-term relationship stability hinges on deep trust, vulnerability, and aligned values. It’s essential to cultivate empathy and maintain open, non-defensive dialogue even in moments of tension. Navigating conflicts collaboratively, while honoring individual autonomy, fosters long-term emotional safety. Above all, consistency in actions and emotional availability often define lasting bonds.',
    scores: { fluency: 9, grammar: 9, vocabulary: 9, pronunciation: 9, prosody: 9, syntax: 9, coherence: 9 },
    feedback: {
      strengths: ['Abstract vocabulary', 'Nuanced structure'],
      improvements: [],
      justification: 'Highly developed and cohesive C1 response.'
    },
    lexicalFeatures: ['vulnerability', 'non-defensive dialogue', 'emotional availability'],
    grammarFeatures: ['nominalizations', 'subjunctive tone'],
    discourseMarkers: ['above all', 'while']
  },
  
  // Q17 – Motivation and goals
  {
    id: 'Q17-A1-motivation',
    promptId: 'Q17_B2',
    cefrLevel: 'A1',
    transcript: 'I want job. I go to work. I need money. I like food. Motivation is job.',
    scores: { fluency: 2, grammar: 2, vocabulary: 2, pronunciation: 3, prosody: 2, syntax: 2, coherence: 2 },
    feedback: {
      strengths: ['Mentions a goal'],
      improvements: ['Explain reasons', 'Link ideas', 'Correct grammar'],
      justification: 'Fragmented and unclear; basic meaning only.'
    },
    lexicalFeatures: ['job', 'money'],
    grammarFeatures: ['present simple errors'],
    discourseMarkers: []
  },
  {
    id: 'Q17-A2-motivation',
    promptId: 'Q17_B2',
    cefrLevel: 'A2',
    transcript: 'I get motivation from my family. They help me work hard. My goal is to have good job and happy life. I want to learn more English and travel to other countries.',
    scores: { fluency: 5, grammar: 5, vocabulary: 4, pronunciation: 5, prosody: 5, syntax: 5, coherence: 5 },
    feedback: {
      strengths: ['Addresses both parts', 'Positive and clear'],
      improvements: ['Refine collocations (a good job)', 'Add examples'],
      justification: 'Simple, optimistic, and clearly structured.'
    },
    lexicalFeatures: ['motivation', 'goal', 'travel'],
    grammarFeatures: ['present and future forms'],
    discourseMarkers: ['and']
  },
  {
    id: 'Q17-B1-motivation',
    promptId: 'Q17_B2',
    cefrLevel: 'B1',
    transcript: 'My motivation mostly comes from my desire to improve my future. I’m motivated by success stories of people who worked hard and changed their lives. One of my biggest goals is to start my own business and become financially independent. I also want to improve my English and move abroad.',
    scores: { fluency: 7, grammar: 7, vocabulary: 6, pronunciation: 6, prosody: 6, syntax: 6, coherence: 7 },
    feedback: {
      strengths: ['Personal, structured, and clear'],
      improvements: ['Add time frames and milestones'],
      justification: 'Well-developed B1 response with good collocations.'
    },
    lexicalFeatures: ['success stories', 'financially independent', 'move abroad'],
    grammarFeatures: ['infinitive purpose', 'present/future mix'],
    discourseMarkers: ['also']
  },
  {
    id: 'Q17-B2-motivation',
    promptId: 'Q17_B2',
    cefrLevel: 'B2',
    transcript: 'I find motivation through personal growth and setting clear, achievable goals. Listening to motivational podcasts and surrounding myself with driven people also plays a big role. My current objectives include completing my degree, launching a freelance career, and becoming fluent in English. These goals give me a sense of direction and push me to stay disciplined.',
    scores: { fluency: 8, grammar: 8, vocabulary: 8, pronunciation: 8, prosody: 8, syntax: 8, coherence: 8 },
    feedback: {
      strengths: ['Advanced collocations', 'Strong thematic flow'],
      improvements: [],
      justification: 'Expressive, focused, and logically framed.'
    },
    lexicalFeatures: ['achievable goals', 'sense of direction', 'stay disciplined'],
    grammarFeatures: ['complex clauses', 'gerunds'],
    discourseMarkers: ['also', 'include']
  },
  {
    id: 'Q17-C1-motivation',
    promptId: 'Q17_B2',
    cefrLevel: 'C1',
    transcript: 'My motivation is deeply rooted in a desire for long-term fulfillment and contribution. I draw inspiration from mentors, books on psychology and leadership, and the tangible progress I see in my personal and professional life. I’m particularly driven to lead impactful projects that align with my values—especially in education and ethical innovation. These goals fuel both my ambition and sense of purpose.',
    scores: { fluency: 9, grammar: 9, vocabulary: 9, pronunciation: 9, prosody: 9, syntax: 9, coherence: 9 },
    feedback: {
      strengths: ['Sophisticated and reflective', 'High lexical precision'],
      improvements: [],
      justification: 'Nuanced, cohesive, and near-native fluency.'
    },
    lexicalFeatures: ['long-term fulfillment', 'ethical innovation', 'sense of purpose'],
    grammarFeatures: ['nominalizations', 'embedded clauses'],
    discourseMarkers: ['especially']
  },
  
  // Q18 – Hypothetical business
  {
    id: 'Q18-A1-business',
    promptId: 'Q18_C1',
    cefrLevel: 'A1',
    transcript: 'I want to open shop. I sell food. People come buy. I happy. Price cheap.',
    scores: { fluency: 2, grammar: 2, vocabulary: 2, pronunciation: 3, prosody: 2, syntax: 2, coherence: 2 },
    feedback: {
      strengths: ['Basic idea presented'],
      improvements: ['Use conditionals (If I could… I would…)','Add details: sector, target, pricing','Fix phrase structure'],
      justification: 'Basic idea but lacks clarity, detail, and structure.'
    },
    lexicalFeatures: ['shop', 'food', 'price'],
    grammarFeatures: ['conditional target', 'article/preposition errors'],
    discourseMarkers: []
  },
  {
    id: 'Q18-A2-business',
    promptId: 'Q18_C1',
    cefrLevel: 'A2',
    transcript: 'I would open a coffee shop. I like coffee. My customers are students and workers. I want to sell cheap drinks and fast snacks. The shop is small, but I want it to be nice.',
    scores: { fluency: 5, grammar: 5, vocabulary: 4, pronunciation: 5, prosody: 5, syntax: 5, coherence: 5 },
    feedback: {
      strengths: ['Covers sector, target, pricing'],
      improvements: ['Add reasons and strategy'],
      justification: 'Answers all components with limited expression and detail.'
    },
    lexicalFeatures: ['coffee shop', 'customers', 'snacks'],
    grammarFeatures: ['would + base', 'simple present'],
    discourseMarkers: ['but']
  },
  {
    id: 'Q18-B1-business',
    promptId: 'Q18_C1',
    cefrLevel: 'B1',
    transcript: 'If I could start a business, I’d create an online tutoring platform for students. The sector would be education, and I would target high school and university learners who need help with English. I’d offer affordable subscriptions, maybe $10 per month, and provide both group and private sessions.',
    scores: { fluency: 7, grammar: 7, vocabulary: 6, pronunciation: 6, prosody: 6, syntax: 6, coherence: 7 },
    feedback: {
      strengths: ['Clear conditional framing', 'Full coverage of prompt'],
      improvements: ['Add market differentiation'],
      justification: 'Practical, structured, and functional business language.'
    },
    lexicalFeatures: ['platform', 'subscriptions', 'private sessions'],
    grammarFeatures: ['second conditional', 'modals'],
    discourseMarkers: []
  },
  {
    id: 'Q18-B2-business',
    promptId: 'Q18_C1',
    cefrLevel: 'B2',
    transcript: 'I’d launch a health-focused meal delivery service operating in urban areas. The sector would be food and wellness, targeting busy professionals and fitness enthusiasts. Meals would be customizable, using organic ingredients, and pricing would follow a tiered model—standard plans starting at $50 per week. I’d focus on convenience, nutrition, and sustainability.',
    scores: { fluency: 8, grammar: 8, vocabulary: 8, pronunciation: 8, prosody: 8, syntax: 8, coherence: 8 },
    feedback: {
      strengths: ['Strong structure', 'Precise business lexis'],
      improvements: [],
      justification: 'Well-developed and realistic business proposal.'
    },
    lexicalFeatures: ['meal delivery service', 'tiered model', 'customizable'],
    grammarFeatures: ['complex noun phrases', 'modals'],
    discourseMarkers: []
  },
  {
    id: 'Q18-C1-business-2',
    promptId: 'Q18_C1',
    cefrLevel: 'C1',
    transcript: 'I would found an edtech startup that merges AI-driven learning with human mentoring. The business would operate in the global education sector, targeting corporate professionals in non-native English-speaking countries. The model would be B2B SaaS, offering tailored language programs priced per seat, starting at $99/month. My aim would be to blend personalization with scale while maintaining measurable ROI for clients.',
    scores: { fluency: 9, grammar: 9, vocabulary: 9, pronunciation: 9, prosody: 9, syntax: 9, coherence: 9 },
    feedback: {
      strengths: ['High-level business discourse', 'Complete strategic framing'],
      improvements: [],
      justification: 'C1-level plan with advanced vocabulary and structure.'
    },
    lexicalFeatures: ['edtech', 'B2B SaaS', 'tailored programs', 'ROI'],
    grammarFeatures: ['passive voice', 'nominalizations'],
    discourseMarkers: ['while']
  },
  
  // Q19 – Solutions for the destitute
  {
    id: 'Q19-A1-poverty',
    promptId: 'Q19_C1',
    cefrLevel: 'A1',
    transcript: 'Poor people need food. Government give money. People can help. I think help is good.',
    scores: { fluency: 2, grammar: 2, vocabulary: 2, pronunciation: 3, prosody: 2, syntax: 2, coherence: 2 },
    feedback: {
      strengths: ['On-topic'],
      improvements: ['Use modals of obligation/possibility correctly','Add structure and detail'],
      justification: 'Underdeveloped with minimal vocabulary and control.'
    },
    lexicalFeatures: ['food', 'money', 'help'],
    grammarFeatures: ['modals target'],
    discourseMarkers: []
  },
  {
    id: 'Q19-A2-poverty',
    promptId: 'Q19_C1',
    cefrLevel: 'A2',
    transcript: 'The government should give homes and food for poor people. Also, we can help by giving clothes and money. I think education is important too. If people go to school, they can get jobs and better life.',
    scores: { fluency: 5, grammar: 5, vocabulary: 4, pronunciation: 5, prosody: 5, syntax: 5, coherence: 5 },
    feedback: {
      strengths: ['Multiple ideas', 'Simple cause–effect'],
      improvements: ['Refine collocations (a better life)', 'Add examples'],
      justification: 'Relevant and clear with simple execution.'
    },
    lexicalFeatures: ['education', 'jobs', 'homes'],
    grammarFeatures: ['should', 'first conditional'],
    discourseMarkers: ['also', 'if']
  },
  {
    id: 'Q19-B1-poverty',
    promptId: 'Q19_C1',
    cefrLevel: 'B1',
    transcript: 'There are many ways to help people living in poverty. Governments should invest in education and healthcare so the poor can break the cycle. NGOs can also provide short-term support like food and shelter. In the long term, creating job opportunities and offering free training programs are key to reducing suffering.',
    scores: { fluency: 7, grammar: 7, vocabulary: 6, pronunciation: 6, prosody: 6, syntax: 6, coherence: 7 },
    feedback: {
      strengths: ['Short- vs long-term logic', 'Appropriate register'],
      improvements: ['More data/examples'],
      justification: 'Logical and complete answer with effective reasoning.'
    },
    lexicalFeatures: ['break the cycle', 'NGOs', 'job opportunities'],
    grammarFeatures: ['modals', 'purpose clauses'],
    discourseMarkers: ['in the long term', 'also']
  },
  {
    id: 'Q19-B2-poverty',
    promptId: 'Q19_C1',
    cefrLevel: 'B2',
    transcript: 'Alleviating destitution requires both systemic and community-based solutions. On a national level, governments should prioritize universal education, fair wages, and affordable housing. Meanwhile, community initiatives like food banks, skill-building centers, and microloans empower individuals to regain stability. Collaboration between sectors—public, private, and nonprofit—is vital to lasting impact.',
    scores: { fluency: 8, grammar: 8, vocabulary: 8, pronunciation: 8, prosody: 8, syntax: 8, coherence: 8 },
    feedback: {
      strengths: ['Balanced structure', 'Precise vocabulary'],
      improvements: [],
      justification: 'Professional and fluent with deep understanding.'
    },
    lexicalFeatures: ['destitution', 'microloans', 'prioritize'],
    grammarFeatures: ['passive voice', 'parallel structures'],
    discourseMarkers: ['meanwhile', 'on a national level']
  },
  {
    id: 'Q19-C1-poverty-2',
    promptId: 'Q19_C1',
    cefrLevel: 'C1',
    transcript: 'To meaningfully alleviate the suffering of the destitute, governments must adopt comprehensive welfare policies—ranging from universal healthcare and housing subsidies to income support and job creation initiatives. Equally crucial are grassroots movements and social enterprises that drive empowerment through education and economic inclusion. Sustainable change stems from equity-focused reforms, not just temporary aid.',
    scores: { fluency: 9, grammar: 9, vocabulary: 9, pronunciation: 9, prosody: 9, syntax: 9, coherence: 9 },
    feedback: {
      strengths: ['Policy register', 'Multi-level reasoning'],
      improvements: [],
      justification: 'High-level policy language with structured argument.'
    },
    lexicalFeatures: ['comprehensive welfare', 'economic inclusion', 'equity-focused reforms'],
    grammarFeatures: ['subjunctive tone', 'nominalizations'],
    discourseMarkers: ['ranging from', 'not just … but']
  },
  
  // Q20 – Qualities of a good leader
  {
    id: 'Q20-A1-leader',
    promptId: 'Q20_C1',
    cefrLevel: 'A1',
    transcript: 'Good leader is nice. He say what to do. People like him. He make rules. He help.',
    scores: { fluency: 2, grammar: 2, vocabulary: 2, pronunciation: 3, prosody: 2, syntax: 2, coherence: 2 },
    feedback: {
      strengths: ['Lists traits'],
      improvements: ['Fix subject–verb agreement', 'Add examples and reasons'],
      justification: 'Limited content with major grammatical errors.'
    },
    lexicalFeatures: ['rules', 'help'],
    grammarFeatures: ['subject–verb agreement errors'],
    discourseMarkers: []
  },
  {
    id: 'Q20-A2-leader',
    promptId: 'Q20_C1',
    cefrLevel: 'A2',
    transcript: 'A good leader should be kind and strong. They must listen to people. They also make decisions. I think a leader needs to be smart and help team. If workers are happy, work is good.',
    scores: { fluency: 5, grammar: 5, vocabulary: 4, pronunciation: 5, prosody: 5, syntax: 5, coherence: 5 },
    feedback: {
      strengths: ['Modals and conditional used', 'Covers core traits'],
      improvements: ['Refine collocations (help the team)', 'Add depth'],
      justification: 'Simple, structured, and fully relevant.'
    },
    lexicalFeatures: ['make decisions', 'listen'],
    grammarFeatures: ['should/must', 'first conditional'],
    discourseMarkers: ['also', 'if']
  },
  {
    id: 'Q20-B1-leader',
    promptId: 'Q20_C1',
    cefrLevel: 'B1',
    transcript: 'A good leader should be confident, organized, and able to inspire others. It’s important that they listen to their team and make fair decisions. In my opinion, a leader must also take responsibility when things go wrong. If a leader treats everyone with respect, the team will trust them.',
    scores: { fluency: 7, grammar: 7, vocabulary: 6, pronunciation: 6, prosody: 6, syntax: 6, coherence: 7 },
    feedback: {
      strengths: ['Workplace tone', 'Well-developed structure'],
      improvements: ['Add examples of behaviors'],
      justification: 'Competent response with relevant tone and development.'
    },
    lexicalFeatures: ['inspire others', 'take responsibility', 'treat with respect'],
    grammarFeatures: ['modals', 'conditionals'],
    discourseMarkers: ['in my opinion', 'if']
  },
  {
    id: 'Q20-B2-leader',
    promptId: 'Q20_C1',
    cefrLevel: 'B2',
    transcript: 'Leadership requires a unique blend of communication, empathy, and strategic thinking. A good leader must motivate others, remain calm under pressure, and make decisions that balance team well-being with organizational goals. They should also give constructive feedback and model ethical behavior. These traits build trust and encourage long-term collaboration.',
    scores: { fluency: 8, grammar: 8, vocabulary: 8, pronunciation: 8, prosody: 8, syntax: 8, coherence: 8 },
    feedback: {
      strengths: ['Advanced workplace lexis', 'Clear impact focus'],
      improvements: [],
      justification: 'Richly elaborated and relevant B2 response.'
    },
    lexicalFeatures: ['strategic thinking', 'constructive feedback', 'ethical behavior'],
    grammarFeatures: ['complex/compound structures'],
    discourseMarkers: []
  },
  {
    id: 'Q20-C1-leader',
    promptId: 'Q20_C1',
    cefrLevel: 'C1',
    transcript: 'An effective leader combines vision, emotional intelligence, and adaptability. They don’t simply give orders—they foster environments where autonomy, innovation, and accountability can thrive. A strong leader anticipates challenges, listens actively, and navigates interpersonal dynamics with tact. Leadership today demands authenticity and the ability to unite diverse teams around a common purpose.',
    scores: { fluency: 9, grammar: 9, vocabulary: 9, pronunciation: 9, prosody: 9, syntax: 9, coherence: 9 },
    feedback: {
      strengths: ['Abstract and idiomatic', 'Sophisticated structure'],
      improvements: [],
      justification: 'Highly developed and insightful C1 response.'
    },
    lexicalFeatures: ['autonomy', 'accountability', 'interpersonal dynamics', 'authenticity'],
    grammarFeatures: ['advanced subordination', 'passive structures'],
    discourseMarkers: ['where', 'around']
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