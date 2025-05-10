
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
        cognitiveTag: 'evaluate',
        languageFunctions: ['arguing', 'justifying', 'rebutting'],
        canDoDescriptor: "Can produce clear, well-structured, detailed text on complex subjects, showing controlled use of organizational patterns."
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
