
import { 
  AssessmentQuestion, 
  QuestionType, 
  CognitiveTag, 
  LanguageFunction 
} from '../types/assessment';

// Sample questions for different assessment tasks
export const sampleQuestions: Record<string, AssessmentQuestion[]> = {
  'a1-listening': [
    { 
      id: 'a1-l-q1', 
      type: 'multiple-choice',
      text: 'Listen to the phrase and select the matching description.',
      audioUrl: '/sample-audio.mp3',
      options: [
        'A person eating breakfast',
        'A person reading a book',
        'A person walking a dog'
      ],
      correctAnswer: 'A person eating breakfast',
      rubric: {
        criteria: [
          'Comprehension Accuracy',
          'Attention to Detail'
        ],
        scale: 5,
        cognitiveTag: 'recall',
        languageFunctions: ['identifying'],
        canDoDescriptor: "Can understand simple phrases about everyday activities."
      }
    },
    { 
      id: 'a1-l-q2', 
      type: 'multiple-choice',
      text: 'Listen and choose the correct picture.',
      audioUrl: '/sample-audio-2.mp3',
      options: [
        'A woman driving a car',
        'A family at the beach',
        'A student in a classroom'
      ],
      correctAnswer: 'A family at the beach',
      rubric: {
        criteria: [
          'Comprehension Accuracy',
          'Attention to Detail'
        ],
        scale: 5,
        cognitiveTag: 'recall',
        languageFunctions: ['identifying'],
        canDoDescriptor: "Can understand simple phrases about familiar activities and places."
      }
    }
  ],
  'a1-reading': [
    {
      id: 'a1-r-q1',
      type: 'image-selection',
      text: 'Match the word "apple" with the correct image.',
      options: ['apple.jpg', 'banana.jpg', 'grapes.jpg', 'orange.jpg'],
      correctAnswer: 'apple.jpg',
      rubric: {
        criteria: [
          'Word Recognition',
          'Visual Association'
        ],
        scale: 5,
        cognitiveTag: 'recall',
        languageFunctions: ['identifying'],
        canDoDescriptor: "Can recognize familiar names, words and very basic phrases."
      }
    },
    {
      id: 'a1-r-q2',
      type: 'image-selection',
      text: 'Match the word "house" with the correct image.',
      options: ['house.jpg', 'building.jpg', 'school.jpg', 'tent.jpg'],
      correctAnswer: 'house.jpg',
      rubric: {
        criteria: [
          'Word Recognition',
          'Visual Association'
        ],
        scale: 5,
        cognitiveTag: 'recall',
        languageFunctions: ['identifying'],
        canDoDescriptor: "Can recognize familiar names, words and very basic phrases."
      }
    }
  ],
  'a2-listening': [
    {
      id: 'a2-l-q1',
      type: 'multiple-choice',
      text: 'Listen to the conversation. What does the woman want to do?',
      audioUrl: '/a2-conversation-1.mp3',
      options: [
        'Go to the movies',
        'Go to a restaurant',
        'Go shopping',
        'Stay at home'
      ],
      correctAnswer: 'Go to a restaurant',
      rubric: {
        criteria: [
          'Dialogue Comprehension',
          'Active Listening'
        ],
        scale: 5,
        cognitiveTag: 'comprehend',
        languageFunctions: ['identifying', 'comparing'],
        canDoDescriptor: "Can understand phrases and expressions related to immediate needs."
      }
    }
  ],
  'b1-reading': [
    {
      id: 'b1-r-q1',
      type: 'heading-matching',
      text: 'Match the following headings to paragraphs in the text.',
      options: [
        'Environmental Impact',
        'Economic Benefits',
        'Historical Background',
        'Future Developments'
      ],
      correctAnswer: ['Historical Background', 'Environmental Impact', 'Economic Benefits', 'Future Developments'],
      rubric: {
        criteria: [
          'Main Idea Identification',
          'Skimming Skill'
        ],
        scale: 5,
        cognitiveTag: 'infer',
        languageFunctions: ['recognizing', 'identifying'],
        canDoDescriptor: "Can understand texts that consist mainly of high frequency everyday or job-related language."
      }
    }
  ],
  'b2-speaking': [
    {
      id: 'b2-s-q1',
      type: 'audio-recording',
      text: 'Discuss the following problem and suggest possible solutions: "Traffic congestion in major cities"',
      rubric: {
        criteria: [
          'Task Fulfillment',
          'Fluency & Coherence',
          'Lexical Resource'
        ],
        scale: 5,
        cognitiveTag: 'problem-solve',
        languageFunctions: ['explaining', 'suggesting'],
        canDoDescriptor: "Can explain a viewpoint on a topical issue giving the advantages and disadvantages of various options."
      }
    }
  ],
  'c1-writing': [
    {
      id: 'c1-w-q1',
      type: 'essay-writing',
      text: 'Read the following editorial excerpt criticizing remote work. Write a counterargument essay of approximately 300 words.',
      rubric: {
        criteria: [
          'Argument Clarity & Relevance',
          'Organization & Coherence',
          'Lexical & Grammatical Accuracy'
        ],
        scale: 5,
        cognitiveTag: 'evaluate',
        languageFunctions: ['arguing', 'justifying', 'rebutting'],
        canDoDescriptor: "Can produce clear, well-structured, detailed text on complex subjects, showing controlled use of organizational patterns."
      }
    }
  ],
  // Adding new CEFR-aligned question types
  'b1-speaking': [
    {
      id: 'b1-s-q1',
      type: 'audio-recording',
      text: 'Describe a recent experience that made you happy and explain why it was important to you.',
      rubric: {
        criteria: [
          'Task Fulfillment',
          'Coherence',
          'Vocabulary Range'
        ],
        scale: 5,
        cognitiveTag: 'apply',
        languageFunctions: ['describing', 'explaining'],
        canDoDescriptor: "Can reasonably fluently sustain a straightforward description of subjects within their field of interest."
      }
    }
  ],
  'b2-reading': [
    {
      id: 'b2-r-q1',
      type: 'multiple-choice',
      text: 'Read the article and identify the author\'s attitude towards the new environmental policy.',
      options: [
        'Strongly supportive',
        'Cautiously optimistic',
        'Neutral',
        'Skeptical'
      ],
      correctAnswer: 'Cautiously optimistic',
      rubric: {
        criteria: [
          'Inference Ability',
          'Critical Reading'
        ],
        scale: 5,
        cognitiveTag: 'analyze',
        languageFunctions: ['inferring', 'evaluating'],
        canDoDescriptor: "Can scan quickly through long and complex texts, locating relevant details."
      }
    }
  ],
  'c2-listening': [
    {
      id: 'c2-l-q1',
      type: 'open-ended',
      text: 'Listen to the academic lecture and explain how the speaker\'s examples support their main thesis.',
      audioUrl: '/c2-lecture-1.mp3',
      rubric: {
        criteria: [
          'Critical Analysis',
          'Rhetorical Comprehension',
          'Academic Language Mastery'
        ],
        scale: 5,
        cognitiveTag: 'evaluate',
        languageFunctions: ['analyzing', 'synthesizing'],
        canDoDescriptor: "Can understand complex technical discussions within their field of specialization."
      }
    }
  ],
  'c2-speaking': [
    {
      id: 'c2-s-q1',
      type: 'audio-recording',
      text: 'Present a nuanced argument on the ethical implications of artificial intelligence in modern society.',
      rubric: {
        criteria: [
          'Critical Reasoning',
          'Rhetorical Effectiveness',
          'Linguistic Sophistication'
        ],
        scale: 5,
        cognitiveTag: 'create',
        languageFunctions: ['arguing', 'hypothesizing'],
        canDoDescriptor: "Can produce clear, smoothly flowing, well-structured discourse with an effective logical structure."
      }
    }
  ]
};

export function getQuestionsForTask(taskId: string): AssessmentQuestion[] {
  return sampleQuestions[taskId] || [];
}

export function enhanceTaskWithQuestions(taskId: string, task: any) {
  const questions = getQuestionsForTask(taskId);
  return {
    ...task,
    questionsList: questions,
    questions: questions.length // Update the question count
  };
}

// Dynamic rubric generation based on question type and level
export function generateRubricForQuestion(question: AssessmentQuestion, level: string) {
  const baseRubric = question.rubric;
  if (!baseRubric) return null;

  // Enhance rubric with level-appropriate descriptors
  const enhancedRubric = {
    ...baseRubric,
    detailedCriteria: baseRubric.criteria.map(criterion => ({
      name: criterion,
      description: getDescriptionForCriterion(criterion, level),
      levelDescriptors: getLevelDescriptorsForCriterion(criterion)
    }))
  };

  return enhancedRubric;
}

// Helper function to get descriptions for rubric criteria
function getDescriptionForCriterion(criterion: string, level: string): string {
  const descriptions: Record<string, Record<string, string>> = {
    'Comprehension Accuracy': {
      'A1': 'Ability to understand very simple phrases and instructions',
      'A2': 'Ability to understand straightforward factual information',
      'B1': 'Ability to understand main points of clear standard speech',
      'B2': 'Ability to understand extended speech and complex arguments',
      'C1': 'Ability to understand extended speech even when not clearly structured',
      'C2': 'Ability to understand any kind of spoken language with ease'
    },
    'Task Fulfillment': {
      'A1': 'Completion of basic communicative tasks',
      'A2': 'Completion of routine exchange tasks',
      'B1': 'Completion of straightforward communicative tasks',
      'B2': 'Effective handling of problem-solving tasks',
      'C1': 'Full and appropriate response to complex tasks',
      'C2': 'Complete and sophisticated response to all aspects of tasks'
    },
    // Add more criteria descriptions as needed
  };
  
  return descriptions[criterion]?.[level] || 
    `Assessment of ${criterion} appropriate for ${level} level`;
}

// Helper function to get level descriptors for criteria
function getLevelDescriptorsForCriterion(criterion: string): Record<number, string> {
  const descriptors: Record<string, Record<number, string>> = {
    'Comprehension Accuracy': {
      1: 'Very limited understanding of basic elements',
      2: 'Limited understanding of main points',
      3: 'Reasonable understanding of key information',
      4: 'Good understanding with only minor misinterpretations',
      5: 'Complete and accurate understanding of all content'
    },
    'Task Fulfillment': {
      1: 'Task largely unfulfilled',
      2: 'Task partially fulfilled',
      3: 'Task adequately fulfilled',
      4: 'Task well fulfilled',
      5: 'Task fully and effectively fulfilled'
    },
    // Add more level descriptors as needed
  };
  
  return descriptors[criterion] || {
    1: 'Insufficient',
    2: 'Limited',
    3: 'Adequate',
    4: 'Good',
    5: 'Excellent'
  };
}
