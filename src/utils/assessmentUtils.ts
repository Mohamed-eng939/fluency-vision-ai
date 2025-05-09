import { 
  AssessmentMetrics, 
  AssessmentResult, 
  CEFRLevel, 
  AssessmentFeedback, 
  TestTask, 
  TestSection, 
  FullAssessment 
} from "../types/assessment";
import { getQuestionsForTask, enhanceTaskWithQuestions } from "./questionUtils";

// Mock implementation for demo purposes
// In a real app, this would connect to a backend AI service
export const analyzeAudio = (audioBlob: Blob): Promise<AssessmentResult> => {
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

export const determineCEFRLevel = (score: number): CEFRLevel => {
  if (score >= 95) return 'C2';
  if (score >= 80) return 'C1';
  if (score >= 65) return 'B2';
  if (score >= 50) return 'B1';
  if (score >= 35) return 'A2';
  return 'A1';
};

export const generateFeedback = (metrics: AssessmentMetrics, cefrLevel: CEFRLevel): AssessmentFeedback => {
  // This would typically involve more sophisticated logic based on actual speech analysis
  // For now, we'll return templated feedback based on score ranges
  
  return {
    fluency: getFeedbackForMetric('fluency', metrics.fluency),
    grammar: getFeedbackForMetric('grammar', metrics.grammar),
    pronunciation: getFeedbackForMetric('pronunciation', metrics.pronunciation),
    prosody: getFeedbackForMetric('prosody', metrics.prosody),
    vocabulary: getFeedbackForMetric('vocabulary', metrics.vocabulary),
    syntax: getFeedbackForMetric('syntax', metrics.syntax),
    coherence: getFeedbackForMetric('coherence', metrics.coherence),
    overall: getOverallFeedback(cefrLevel)
  };
};

const getFeedbackForMetric = (metric: string, score: number): string => {
  if (score > 8) {
    return `Your ${metric} is excellent. You demonstrate native-like proficiency in this area.`;
  } else if (score > 6) {
    return `Your ${metric} is good. You demonstrate clear competence with minor areas for improvement.`;
  } else if (score > 4) {
    return `Your ${metric} is adequate. There are several areas where you could improve.`;
  } else {
    return `Your ${metric} needs significant improvement. Focus on developing basic skills in this area.`;
  }
};

const getOverallFeedback = (cefrLevel: CEFRLevel): string => {
  switch(cefrLevel) {
    case 'C2':
      return 'You demonstrate mastery of the language at a professional level. Your speech is fluent, precise, and nuanced.';
    case 'C1':
      return 'You can use the language flexibly and effectively for social, academic, and professional purposes.';
    case 'B2':
      return 'You can interact with a degree of fluency and spontaneity that makes regular interaction with native speakers possible without strain.';
    case 'B1':
      return 'You can deal with most situations likely to arise while traveling in an area where the language is spoken.';
    case 'A2':
      return 'You can communicate in simple and routine tasks requiring a simple and direct exchange of information.';
    case 'A1':
      return 'You can interact in a simple way provided the other person talks slowly and clearly and is prepared to help.';
    default:
      return 'Your language proficiency has been assessed.';
  }
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
