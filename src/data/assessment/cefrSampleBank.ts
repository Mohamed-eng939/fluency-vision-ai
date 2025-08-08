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

// Sample responses for "Describe your ideal vacation destination"
export const sampleResponses: CEFRSampleResponse[] = [
  {
    id: 'vacation-A1-01',
    promptId: 'SP001',
    cefrLevel: 'A1',
    transcript: 'I like beach. Beach is nice. I go with family. We swim. We eat food. Sun is hot. I am happy.',
    scores: {
      fluency: 4.0,
      grammar: 3.5,
      vocabulary: 3.0,
      pronunciation: 4.0,
      prosody: 3.5,
      syntax: 3.0,
      coherence: 3.5
    },
    feedback: {
      strengths: ['Clear basic vocabulary', 'Simple present tense used correctly'],
      improvements: ['Connect ideas with linking words', 'Use more descriptive adjectives', 'Expand sentence length'],
      justification: 'Basic vocabulary and simple sentence structures typical of A1 level. Limited range but functional.'
    },
    lexicalFeatures: ['beach', 'nice', 'family', 'swim', 'food', 'hot', 'happy'],
    grammarFeatures: ['simple present', 'basic adjectives', 'subject-verb'],
    discourseMarkers: []
  },
  {
    id: 'vacation-A2-01',
    promptId: 'SP001',
    cefrLevel: 'A2',
    transcript: 'My ideal vacation is going to Thailand. I want to visit Bangkok because it has beautiful temples and good food. I would like to stay in a nice hotel near the beach. The weather is usually warm there, so I can swim and relax.',
    scores: {
      fluency: 5.5,
      grammar: 5.0,
      vocabulary: 5.0,
      pronunciation: 5.5,
      prosody: 5.0,
      syntax: 5.0,
      coherence: 5.5
    },
    feedback: {
      strengths: ['Uses future and conditional forms', 'Good topic vocabulary', 'Clear reasons given'],
      improvements: ['Add more complex sentences', 'Use more varied vocabulary', 'Include personal experiences'],
      justification: 'Demonstrates A2 level with basic connecting words and simple compound sentences. Good control of present and future tenses.'
    },
    lexicalFeatures: ['ideal', 'vacation', 'Bangkok', 'temples', 'weather', 'warm', 'relax'],
    grammarFeatures: ['future tense', 'conditional would', 'because clauses', 'adjective-noun'],
    discourseMarkers: ['because', 'so']
  },
  {
    id: 'vacation-B1-01',
    promptId: 'SP001',
    cefrLevel: 'B1',
    transcript: 'Well, my ideal vacation would definitely be somewhere tropical, probably the Maldives or Costa Rica. I\'m really attracted to places where I can experience both adventure and relaxation. For example, I\'d love to go snorkeling in the morning to see marine life, and then spend the afternoon reading on the beach. What I find most appealing is the combination of natural beauty and the opportunity to disconnect from technology.',
    scores: {
      fluency: 6.5,
      grammar: 6.0,
      vocabulary: 6.5,
      pronunciation: 6.0,
      prosody: 6.0,
      syntax: 6.5,
      coherence: 7.0
    },
    feedback: {
      strengths: ['Good use of discourse markers', 'Complex sentence structures', 'Topic development'],
      improvements: ['More sophisticated vocabulary', 'Vary sentence openings', 'Add personal anecdotes'],
      justification: 'Clear B1 level with good coherence and range of structures. Shows ability to express preferences and give reasons.'
    },
    lexicalFeatures: ['tropical', 'attracted', 'adventure', 'relaxation', 'snorkeling', 'marine life', 'appealing', 'combination', 'disconnect'],
    grammarFeatures: ['conditional would', 'complex sentences', 'relative clauses', 'present perfect'],
    discourseMarkers: ['well', 'definitely', 'probably', 'for example', 'and then', 'what I find']
  },
  {
    id: 'vacation-B2-01',
    promptId: 'SP001',
    cefrLevel: 'B2',
    transcript: 'If I could design my perfect vacation, I would choose somewhere that offers both cultural immersion and natural beauty. I\'ve always been fascinated by Southeast Asia, particularly Vietnam, because it seems to strike the perfect balance between rich history and stunning landscapes. I imagine myself exploring ancient temples in the morning, perhaps taking a cooking class to learn about local cuisine, and then unwinding with a sunset cruise through Halong Bay. What really appeals to me is the opportunity to engage with local communities and gain a deeper understanding of different ways of life, rather than just being a passive tourist.',
    scores: {
      fluency: 7.5,
      grammar: 7.5,
      vocabulary: 8.0,
      pronunciation: 7.0,
      prosody: 7.0,
      syntax: 7.5,
      coherence: 8.0
    },
    feedback: {
      strengths: ['Sophisticated vocabulary', 'Complex grammatical structures', 'Well-developed ideas', 'Cultural awareness'],
      improvements: ['Could include more personal experiences', 'Vary intonation patterns'],
      justification: 'Strong B2 level with good range and accuracy. Shows ability to discuss abstract concepts and personal preferences with detailed reasoning.'
    },
    lexicalFeatures: ['design', 'cultural immersion', 'fascinated', 'particularly', 'strike the perfect balance', 'stunning landscapes', 'ancient', 'cuisine', 'unwinding', 'engage', 'communities', 'passive tourist'],
    grammarFeatures: ['second conditional', 'present perfect', 'complex subordination', 'participle clauses'],
    discourseMarkers: ['if I could', 'because', 'particularly', 'perhaps', 'and then', 'what really appeals', 'rather than']
  },
  {
    id: 'vacation-C1-01',
    promptId: 'SP001',
    cefrLevel: 'C1',
    transcript: 'My conception of an ideal vacation has evolved considerably over the years. Initially, I was drawn to conventional tourist destinations, but I\'ve come to realize that what truly enriches me is authentic cultural exchange. I would be inclined to choose a destination like rural Peru or remote regions of Nepal, where tourism hasn\'t yet commodified the local experience. The prospect of homestaying with local families, participating in traditional agricultural practices, and contributing to community development projects appeals to me far more than luxury resorts. Such experiences not only broaden one\'s perspective but also challenge preconceived notions about different societies. Moreover, there\'s something profoundly satisfying about traveling in a way that gives back to the communities you visit.',
    scores: {
      fluency: 8.5,
      grammar: 8.5,
      vocabulary: 9.0,
      pronunciation: 8.0,
      prosody: 8.0,
      syntax: 8.5,
      coherence: 9.0
    },
    feedback: {
      strengths: ['Sophisticated lexical range', 'Complex discourse organization', 'Abstract thinking', 'Nuanced argumentation'],
      improvements: ['Already demonstrates C1 proficiency across all areas'],
      justification: 'Excellent C1 level with sophisticated vocabulary, complex sentence structures, and abstract reasoning. Shows ability to reflect on personal development and societal issues.'
    },
    lexicalFeatures: ['conception', 'evolved considerably', 'conventional', 'authentic cultural exchange', 'inclined', 'commodified', 'homestaying', 'agricultural practices', 'community development', 'broadens perspective', 'preconceived notions', 'profoundly satisfying'],
    grammarFeatures: ['present perfect continuous', 'complex relative clauses', 'passive constructions', 'participle clauses', 'abstract nominalizations'],
    discourseMarkers: ['initially', 'but', 'moreover', 'not only...but also', 'such experiences', 'far more than']
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