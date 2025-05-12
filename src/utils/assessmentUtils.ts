import { 
  AssessmentMetrics, 
  AssessmentResult, 
  CEFRLevel, 
  AssessmentFeedback, 
  TestTask, 
  TestSection, 
  FullAssessment,
  AssessmentQuestion
} from "../types/assessment";
import { getQuestionsForTask, enhanceTaskWithQuestions, generateRubricForQuestion } from "./questionUtils";
import { processAudioForAssessment } from "./speechAnalysisUtils";

// Enhanced audio analysis for assessment
export const analyzeAudio = async (audioBlob: Blob): Promise<AssessmentResult> => {
  try {
    // Process the audio using our new speech analysis utilities
    const processedAudio = await processAudioForAssessment(audioBlob);
    
    // Map the speech metrics to our assessment metrics
    const metrics: AssessmentMetrics = {
      fluency: processedAudio.metrics.fluency,
      grammar: Math.random() * 5 + 5, // Still random as we can't assess grammar from audio alone
      pronunciation: processedAudio.metrics.pronunciation,
      prosody: processedAudio.metrics.prosody,
      vocabulary: Math.random() * 5 + 5, // Still random as we can't assess vocabulary from audio alone
      syntax: Math.random() * 5 + 5, // Still random as we can't assess syntax from audio alone
      coherence: Math.random() * 5 + 5, // Still random as we can't assess coherence from audio alone
    };

    const totalScore = calculateTotalScore(metrics);
    const cefrLevel = determineCEFRLevel(totalScore);
    
    return {
      metrics,
      totalScore,
      cefrLevel,
      feedback: generateFeedback(metrics, cefrLevel),
      audioUrl: processedAudio.audioUrl,
      duration: processedAudio.duration,
      speechRate: processedAudio.metrics.speechRate,
      confidenceScore: processedAudio.metrics.confidenceScore
    };
  } catch (error) {
    console.error('Error in audio analysis:', error);
    
    // Fallback to the previous implementation if there's an error
    return fallbackAnalyzeAudio(audioBlob);
  }
};

// Fallback implementation - same as the old implementation
const fallbackAnalyzeAudio = (audioBlob: Blob): Promise<AssessmentResult> => {
  return new Promise((resolve) => {
    // Simulate processing time
    setTimeout(() => {
      const metrics: AssessmentMetrics = {
        fluency: Math.random() * 5 + 5, // 5-10
        grammar: Math.random() * 5 + 5,
        pronunciation: Math.random() * 5 + 5,
        prosody: Math.random() * 5 + 5,
        vocabulary: Math.random() * 5 + 5,
        syntax: Math.random() * 5 + 5,
        coherence: Math.random() * 5 + 5,
      };

      const totalScore = calculateTotalScore(metrics);
      const cefrLevel = determineCEFRLevel(totalScore);
      
      resolve({
        metrics,
        totalScore,
        cefrLevel,
        feedback: generateFeedback(metrics, cefrLevel)
      });
    }, 2000);
  });
};

export const calculateTotalScore = (metrics: AssessmentMetrics): number => {
  const { fluency, grammar, pronunciation, prosody, vocabulary, syntax, coherence } = metrics;
  const sum = fluency + grammar + pronunciation + prosody + vocabulary + syntax + coherence;
  // Convert to a score out of 100
  return Math.round((sum / 70) * 100);
};

// Enhanced CEFR level determination with more nuanced thresholds
export const determineCEFRLevel = (score: number): CEFRLevel => {
  if (score >= 95) return 'C2';
  if (score >= 85) return 'C1+';
  if (score >= 80) return 'C1';
  if (score >= 75) return 'B2+';
  if (score >= 65) return 'B2';
  if (score >= 55) return 'B1+';
  if (score >= 50) return 'B1';
  if (score >= 45) return 'A2+';
  if (score >= 35) return 'A2';
  if (score >= 25) return 'A1+';
  if (score >= 15) return 'A1';
  return 'Pre-A1';
};

// Enhanced feedback generation based on metrics and dynamic rubrics
export const generateFeedback = (metrics: AssessmentMetrics, cefrLevel: CEFRLevel): AssessmentFeedback => {
  return {
    fluency: getFeedbackForMetric('fluency', metrics.fluency, cefrLevel),
    grammar: getFeedbackForMetric('grammar', metrics.grammar, cefrLevel),
    pronunciation: getFeedbackForMetric('pronunciation', metrics.pronunciation, cefrLevel),
    prosody: getFeedbackForMetric('prosody', metrics.prosody, cefrLevel),
    vocabulary: getFeedbackForMetric('vocabulary', metrics.vocabulary, cefrLevel),
    syntax: getFeedbackForMetric('syntax', metrics.syntax, cefrLevel),
    coherence: getFeedbackForMetric('coherence', metrics.coherence, cefrLevel),
    overall: getOverallFeedback(cefrLevel)
  };
};

// Enhanced metric feedback with CEFR-aligned descriptors
const getFeedbackForMetric = (metric: string, score: number, cefrLevel: CEFRLevel): string => {
  const cefrSpecificFeedback = getCEFRSpecificFeedback(metric, cefrLevel);
  
  if (score > 8) {
    return `${cefrSpecificFeedback.excellent} Your ${metric} is excellent and exceeds ${cefrLevel} level expectations.`;
  } else if (score > 6) {
    return `${cefrSpecificFeedback.good} Your ${metric} is good for ${cefrLevel} level, with some areas for improvement.`;
  } else if (score > 4) {
    return `${cefrSpecificFeedback.adequate} Your ${metric} meets basic ${cefrLevel} level requirements, but needs development.`;
  } else {
    return `${cefrSpecificFeedback.needs_improvement} Your ${metric} needs significant improvement to reach ${cefrLevel} level standards.`;
  }
};

// Get CEFR-specific feedback phrases
const getCEFRSpecificFeedback = (metric: string, level: CEFRLevel): Record<string, string> => {
  const feedbackMap: Record<string, Record<CEFRLevel, Record<string, string>>> = {
    'fluency': {
      'C2': {
        excellent: 'You express yourself spontaneously, very fluently and precisely.',
        good: 'You can express yourself fluently with only occasional hesitation.',
        adequate: 'You can maintain fluent speech but with some noticeable effort.',
        needs_improvement: 'Your speech shows frequent hesitation and reformulation.'
      },
      'C1': {
        excellent: 'You can express yourself fluently and spontaneously without much obvious searching for expressions.',
        good: 'You can produce stretches of language with a fairly even tempo with few noticeably long pauses.',
        adequate: 'You can keep going comprehensibly, even though pausing for grammatical and lexical planning is evident.',
        needs_improvement: 'Your speech contains many hesitations and interruptions.'
      },
      // Add other levels...
      'B2': {
        excellent: 'You can produce stretches of language with a fairly even tempo with few noticeably long pauses.',
        good: 'You can communicate with a degree of fluency and spontaneity.',
        adequate: 'You can speak with reasonable fluency despite some formulation problems.',
        needs_improvement: 'Your speech is often hesitant with frequent pauses.'
      },
      // Default entries for other levels
      'B1': {
        excellent: 'You can express yourself with relative ease despite some pauses.',
        good: 'You can keep going comprehensibly, even though pausing is evident.',
        adequate: 'You can make yourself understood with some effort.',
        needs_improvement: 'Your speech is characterized by frequent pauses and reformulations.'
      },
      'A2': {
        excellent: 'You can make yourself understood in short contributions.',
        good: 'You can construct phrases on familiar topics with sufficient ease.',
        adequate: 'You can manage short, isolated utterances with pauses.',
        needs_improvement: 'Your speech consists of very short, isolated utterances with frequent pauses.'
      },
      'A1': {
        excellent: 'You can manage very short, isolated, rehearsed utterances.',
        good: 'You can produce basic phrases with some effort.',
        adequate: 'You can produce simple sentences with significant pauses.',
        needs_improvement: 'You can only produce words and very simple phrases with difficulty.'
      },
      'Pre-A1': {
        excellent: 'You can say some isolated words related to personal information.',
        good: 'You can produce a few basic words with support.',
        adequate: 'You can repeat some basic words when prompted.',
        needs_improvement: 'You are still developing the ability to produce basic words.'
      },
      'A1+': { 
        excellent: 'You can manage short utterances with minimal hesitation.',
        good: 'You can produce simple phrases with reasonable ease.',
        adequate: 'You can produce basic utterances with some pausing.',
        needs_improvement: 'You struggle to produce complete utterances.'
      },
      'A2+': { 
        excellent: 'You can express yourself on familiar topics with reasonable fluency.',
        good: 'You can make yourself understood with some confidence.',
        adequate: 'You can speak with some fluency on familiar topics.',
        needs_improvement: 'Your speech is hesitant even on familiar topics.'
      },
      'B1+': { 
        excellent: 'You can communicate with good fluency on familiar topics.',
        good: 'You can express yourself with relatively few pauses.',
        adequate: 'You can maintain conversation with some pauses.',
        needs_improvement: 'Your speech contains frequent hesitation.'
      },
      'B2+': { 
        excellent: 'You communicate with good fluency and spontaneity.',
        good: 'You can interact with a good degree of fluency.',
        adequate: 'You can maintain conversation with reasonable fluency.',
        needs_improvement: 'Your speech lacks the fluency expected at this level.'
      },
      'C1+': { 
        excellent: 'You express yourself fluently and spontaneously with ease.',
        good: 'You can communicate very fluently with minimal hesitation.',
        adequate: 'You can express yourself with good fluency.',
        needs_improvement: 'Your fluency is inconsistent for this level.'
      },
      'Below Pre-A1': {
        excellent: 'You can produce a few isolated words related to basic needs.',
        good: 'You can repeat some basic words with support.',
        adequate: 'You can use a few memorized words or phrases.',
        needs_improvement: 'You are at the beginning stages of developing oral language ability.'
      },
      'N/A': {
        excellent: 'Your fluency cannot be assessed within standard CEFR frameworks.',
        good: 'Your fluency shows good qualities outside standard frameworks.',
        adequate: 'Your fluency demonstrates basic competence outside standard frameworks.',
        needs_improvement: 'Your fluency needs development outside standard assessment frameworks.'
      }
    },
    // Add other metrics with their level-specific feedback...
  };

  // Default feedback if specific metric/level combination not found
  return feedbackMap[metric]?.[level] || {
    excellent: 'Excellent work!',
    good: 'Good effort.',
    adequate: 'Adequate performance.',
    needs_improvement: 'This area needs improvement.'
  };
};

const getOverallFeedback = (cefrLevel: CEFRLevel): string => {
  const feedbackMap: Record<CEFRLevel, string> = {
    'C2': 'You demonstrate mastery of the language at a professional level. Your speech is fluent, precise, and nuanced.',
    'C1': 'You can use the language flexibly and effectively for social, academic, and professional purposes.',
    'B2': 'You can interact with a degree of fluency and spontaneity that makes regular interaction with native speakers possible without strain.',
    'B1': 'You can deal with most situations likely to arise while traveling in an area where the language is spoken.',
    'A2': 'You can communicate in simple and routine tasks requiring a simple and direct exchange of information.',
    'A1': 'You can interact in a simple way provided the other person talks slowly and clearly and is prepared to help.',
    'Pre-A1': 'You are beginning to develop basic language skills and can use a few isolated words and phrases.',
    'A1+': 'You can communicate at a basic level about personal information and immediate needs.',
    'A2+': 'You can handle social exchanges with confidence, going beyond basic routine exchanges.',
    'B1+': 'You can communicate with some confidence on familiar matters and maintain conversation on a fairly wide range of topics.',
    'B2+': 'You can communicate effectively and connect ideas fluently across a range of topics.',
    'C1+': 'You have near-native fluency and can engage in extended, sophisticated discourse.',
    'Below Pre-A1': 'You are at the very initial stages of language learning, beginning to recognize and use a few isolated words.',
    'N/A': 'Your language proficiency falls outside the standard CEFR framework.'
  };

  return feedbackMap[cefrLevel] || 'Your language proficiency has been assessed.';
};

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

// Full assessment test structure
export const fullAssessmentTests: FullAssessment[] = [
  {
    id: 'cefr-general',
    title: 'CEFR-Aligned General English Assessment',
    description: 'A comprehensive test covering all language skills from A1 to C2 levels',
    estimatedTime: '120 minutes',
    sections: [
      {
        id: 'receptive',
        title: 'Receptive Skills',
        description: 'Assessment of listening and reading comprehension',
        tasks: [
          {
            id: 'a1-listening',
            title: 'A1 Listening - Picture Identification',
            level: 'A1',
            skill: 'listening',
            description: 'Listen to short phrases and select the corresponding image',
            instructions: 'For each audio clip, select the picture that best matches what you hear.',
            timeLimit: 5,
            questions: 5,
            objective: 'Assess ability to identify factual information in simple spoken phrases',
            rubric: {
              criteria: [
                'Comprehension Accuracy',
                'Attention to Detail'
              ],
              scale: 5,
              cognitiveTag: 'recall',
              languageFunctions: ['identifying'],
              canDoDescriptor: "Can understand phrases and the highest frequency vocabulary related to areas of most immediate personal relevance."
            }
          },
          {
            id: 'a1-reading',
            title: 'A1 Reading - Word-to-Image Matching',
            level: 'A1',
            skill: 'reading',
            description: 'Match basic words with their corresponding images',
            instructions: 'Match each word in the list with its corresponding picture.',
            timeLimit: 5,
            questions: 10,
            objective: 'Assess ability to recognize basic written vocabulary',
            rubric: {
              criteria: [
                'Word Recognition',
                'Visual Association'
              ],
              scale: 5,
              cognitiveTag: 'recall',
              languageFunctions: ['identifying'],
              canDoDescriptor: "Can understand familiar names, words and very basic phrases."
            }
          },
          {
            id: 'a2-listening',
            title: 'A2 Listening - Short Dialogue Comprehension',
            level: 'A2',
            skill: 'listening',
            description: 'Listen to short conversations and answer multiple-choice questions',
            instructions: 'Listen to each conversation and select the best answer to each question.',
            timeLimit: 10,
            questions: 5
          },
          {
            id: 'a2-reading',
            title: 'A2 Reading - Short Text Gap-Fill',
            level: 'A2',
            skill: 'reading',
            description: 'Fill in the blanks in a short text',
            instructions: 'Read the text and fill in each blank with the correct word from the dropdown list.',
            timeLimit: 10,
            questions: 5
          },
          {
            id: 'b1-listening',
            title: 'B1 Listening - Note Completion',
            level: 'B1',
            skill: 'listening',
            description: 'Listen to audio and complete notes',
            instructions: 'Listen to the recording and fill in the missing information in the notes.',
            timeLimit: 10,
            questions: 6
          },
          {
            id: 'b1-reading',
            title: 'B1 Reading - Matching Headings',
            level: 'B1',
            skill: 'reading',
            description: 'Match headings to paragraphs',
            instructions: 'Read the text and match each paragraph with the correct heading.',
            timeLimit: 10,
            questions: 4
          },
          {
            id: 'b2-listening',
            title: 'B2 Listening - Summary Completion',
            level: 'B2',
            skill: 'listening',
            description: 'Listen to a lecture and complete a summary',
            instructions: 'Listen to the lecture and complete the summary by filling in the blanks.',
            timeLimit: 15,
            questions: 8
          },
          {
            id: 'b2-reading',
            title: 'B2 Reading - Inference MCQ',
            level: 'B2',
            skill: 'reading',
            description: 'Answer multiple-choice questions requiring inference',
            instructions: 'Read the article and answer the questions about implied meanings and attitudes.',
            timeLimit: 15,
            questions: 5
          },
          {
            id: 'c1-listening',
            title: 'C1 Listening - Dual-Speaker Synthesis',
            level: 'C1',
            skill: 'listening',
            description: 'Compare and contrast viewpoints from two speakers',
            instructions: 'Listen to two speakers discussing a topic and identify areas of agreement and disagreement.',
            timeLimit: 15,
            questions: 6
          },
          {
            id: 'c1-reading',
            title: 'C1 Reading - Writer\'s Attitude Analysis',
            level: 'C1',
            skill: 'reading',
            description: 'Analyze author bias and tone',
            instructions: 'Read the opinion piece and answer questions about the author\'s tone, bias, and rhetorical devices.',
            timeLimit: 20,
            questions: 8
          },
          {
            id: 'c2-listening',
            title: 'C2 Listening - Philosophical Interpretation',
            level: 'C2',
            skill: 'listening',
            description: 'Interpret abstract academic content',
            instructions: 'Listen to the academic lecture and summarize the speaker\'s key position and critique it.',
            timeLimit: 20,
            questions: 5
          },
          {
            id: 'c2-reading',
            title: 'C2 Reading - Argument Deconstruction',
            level: 'C2',
            skill: 'reading',
            description: 'Identify logical flaws and unsupported claims',
            instructions: 'Read the persuasive article and identify instances of flawed reasoning or unsupported claims.',
            timeLimit: 20,
            questions: 6
          }
        ]
      },
      {
        id: 'productive',
        title: 'Productive Skills',
        description: 'Assessment of speaking and writing abilities',
        tasks: [
          {
            id: 'a1-speaking',
            title: 'A1 Speaking - Personal Q&A',
            level: 'A1',
            skill: 'speaking',
            description: 'Answer basic personal questions',
            instructions: 'Answer the questions about yourself clearly and simply.',
            timeLimit: 3,
            questions: 5
          },
          {
            id: 'a1-writing',
            title: 'A1 Writing - Form Completion',
            level: 'A1',
            skill: 'writing',
            description: 'Fill out a simple form',
            instructions: 'Complete the form with your personal information.',
            timeLimit: 5,
            questions: 1
          },
          {
            id: 'a2-speaking',
            title: 'A2 Speaking - Picture Description',
            level: 'A2',
            skill: 'speaking',
            description: 'Describe what is happening in a picture',
            instructions: 'Look at the picture and describe what you see and what is happening.',
            timeLimit: 5,
            questions: 1
          },
          {
            id: 'a2-writing',
            title: 'A2 Writing - Informal Email',
            level: 'A2',
            skill: 'writing',
            description: 'Write a short email to a friend',
            instructions: 'Write a 50-70 word email to your friend about your weekend.',
            timeLimit: 10,
            questions: 1
          },
          {
            id: 'b1-speaking',
            title: 'B1 Speaking - Opinion Task',
            level: 'B1',
            skill: 'speaking',
            description: 'Express an opinion on a familiar topic',
            instructions: 'Answer the question by giving your opinion and reasons to support it.',
            timeLimit: 5,
            questions: 1
          },
          {
            id: 'b1-writing',
            title: 'B1 Writing - Discursive Paragraph',
            level: 'B1',
            skill: 'writing',
            description: 'Write a paragraph expressing views on a topic',
            instructions: 'Write a 150-word paragraph discussing the advantages and disadvantages of the topic.',
            timeLimit: 15,
            questions: 1
          },
          {
            id: 'b2-speaking',
            title: 'B2 Speaking - Problem Solution Task',
            level: 'B2',
            skill: 'speaking',
            description: 'Propose solutions to a problem',
            instructions: 'Describe the problem presented and suggest possible solutions, explaining your reasoning.',
            timeLimit: 8,
            questions: 1
          },
          {
            id: 'b2-writing',
            title: 'B2 Writing - Formal Essay',
            level: 'B2',
            skill: 'writing',
            description: 'Write a structured essay',
            instructions: 'Write a 200-250 word essay addressing the topic. Include an introduction, body paragraphs, and conclusion.',
            timeLimit: 20,
            questions: 1
          },
          {
            id: 'c1-speaking',
            title: 'C1 Speaking - Abstract Monologue',
            level: 'C1',
            skill: 'speaking',
            description: 'Deliver a monologue on an abstract topic',
            instructions: 'Speak for 2 minutes on the abstract topic provided, exploring various aspects and implications.',
            timeLimit: 10,
            questions: 1
          },
          {
            id: 'c1-writing',
            title: 'C1 Writing - Analytical Response',
            level: 'C1',
            skill: 'writing',
            description: 'Write a critical response to an article',
            instructions: 'Read the article and write a 300-word analytical response, critiquing the main arguments.',
            timeLimit: 25,
            questions: 1
          },
          {
            id: 'c2-speaking',
            title: 'C2 Speaking - Formal Debate',
            level: 'C2',
            skill: 'speaking',
            description: 'Present and defend a position in a formal debate',
            instructions: 'Present your viewpoint on the controversial topic and respond to counterarguments professionally.',
            timeLimit: 10,
            questions: 1
          },
          {
            id: 'c2-writing',
            title: 'C2 Writing - Argument Critique',
            level: 'C2',
            skill: 'writing',
            description: 'Analyze and critique a complex argument',
            instructions: 'Write a 400-500 word critique of the given text, identifying logical flaws, assumptions, and rhetorical devices.',
            timeLimit: 30,
            questions: 1
          }
        ]
      }
    ]
  }
];

// Enhance the tasks with questions
export const enhancedFullAssessmentTests: FullAssessment[] = fullAssessmentTests.map(assessment => ({
  ...assessment,
  sections: assessment.sections.map(section => ({
    ...section,
    tasks: section.tasks.map(task => enhanceTaskWithQuestions(task.id, task))
  }))
}));

// This makes the enhanced version the default exported version
export const getFullAssessmentTests = () => enhancedFullAssessmentTests;

// New function to apply dynamic scoring to student responses
export const scoreSpeakingResponse = async (
  audioBlob: Blob, 
  question: AssessmentQuestion, 
  transcript?: string
): Promise<{
  score: number, 
  cefrLevel: CEFRLevel,
  detailedScores: Record<string, number>,
  feedback: Record<string, string>
}> => {
  // Process audio to get basic metrics
  const processedAudio = await processAudioForAssessment(audioBlob);
  
  // If we have a specific question with rubric, use that for more detailed scoring
  if (question?.rubric) {
    // Extract CEFR level from question ID or context
    const level = question.id.substring(0, 2).toUpperCase();
    
    // Generate detailed rubric with level-appropriate descriptors
    const enhancedRubric = generateRubricForQuestion(question, level);
    
    // Calculate scores for each criterion in the rubric
    const detailedScores: Record<string, number> = {};
    const feedback: Record<string, string> = {};
    
    if (enhancedRubric) {
      enhancedRubric.criteria.forEach(criterion => {
        // Calculate a score based on audio metrics and transcript analysis
        // This is a simplified version - in a real system, this would involve 
        // sophisticated NLP and speech analysis
        const score = calculateCriterionScore(
          criterion, 
          processedAudio.metrics, 
          transcript || ''
        );
        
        detailedScores[criterion] = score;
        
        // Generate feedback for this criterion
        feedback[criterion] = getCriterionFeedback(criterion, score, level as any);
      });
    }
    
    // Calculate overall score
    const overallScore = Object.values(detailedScores).reduce((sum, score) => sum + score, 0) / 
                         Object.values(detailedScores).length;
    
    // Convert to 0-100 scale
    const finalScore = Math.round((overallScore / 5) * 100);
    
    // Determine CEFR level
    const cefrLevel = determineCEFRLevel(finalScore);
    
    return {
      score: finalScore,
      cefrLevel,
      detailedScores,
      feedback
    };
  }
  
  // Fallback to basic scoring if no rubric available
  const metrics = {
    fluency: processedAudio.metrics.fluency,
    pronunciation: processedAudio.metrics.pronunciation,
    prosody: processedAudio.metrics.prosody,
    // Basic estimates for other metrics
    grammar: 7.5,
    vocabulary: 7.5,
    syntax: 7.5,
    coherence: 7.5
  };
  
  const totalScore = calculateTotalScore(metrics);
  const cefrLevel = determineCEFRLevel(totalScore);
  
  return {
    score: totalScore,
    cefrLevel,
    detailedScores: metrics,
    feedback: Object.keys(metrics).reduce((acc, key) => {
      acc[key] = getFeedbackForMetric(key, metrics[key as keyof typeof metrics], cefrLevel);
      return acc;
    }, {} as Record<string, string>)
  };
};

// Helper function to calculate a criterion score based on audio metrics and transcript
const calculateCriterionScore = (
  criterion: string,
  audioMetrics: any,
  transcript: string
): number => {
  // In a real implementation, this would use sophisticated analysis
  // For now, we'll use a simplified mapping
  switch (criterion) {
    case 'Fluency & Coherence':
    case 'Fluency':
      return audioMetrics.fluency;
    case 'Pronunciation':
      return audioMetrics.pronunciation;
    case 'Prosody':
      return audioMetrics.pausePattern;
    // For other criteria, we'd need deeper text analysis
    // This is a placeholder implementation
    default:
      // Return a value between 6-9 for now
      return Math.random() * 3 + 6;
  }
};

// Get specific feedback for a criterion based on score and level
const getCriterionFeedback = (criterion: string, score: number, level: string): string => {
  // This would be expanded with much more detailed, criterion-specific feedback
  if (score > 8) {
    return `Your ${criterion} shows excellent mastery at ${level} level. Keep up the great work!`;
  } else if (score > 6) {
    return `Your ${criterion} is good for ${level} level, showing solid competence with minor areas to improve.`;
  } else if (score > 4) {
    return `Your ${criterion} is adequate for ${level} level, but shows several areas where focused practice would help.`;
  } else {
    return `Your ${criterion} needs significant improvement to meet ${level} level standards. Consider focused practice.`;
  }
};
