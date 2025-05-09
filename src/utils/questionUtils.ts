
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
          {
            name: 'Comprehension Accuracy',
            description: 'Ability to understand simple spoken phrases',
            scale: {
              1: 'Unable to identify correct option',
              3: 'Partially identifies correct elements',
              5: 'Correctly identifies the described activity'
            }
          }
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
          {
            name: 'Comprehension Accuracy',
            description: 'Ability to understand simple spoken phrases',
            scale: {
              1: 'Unable to identify correct option',
              3: 'Partially identifies correct elements',
              5: 'Correctly identifies the described activity'
            }
          }
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
          {
            name: 'Word Recognition',
            description: 'Ability to match basic written words to images',
            scale: {
              1: 'Unable to match word with corresponding image',
              3: 'Hesitates but eventually selects correct image',
              5: 'Quickly and correctly matches word to image'
            }
          }
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
          {
            name: 'Word Recognition',
            description: 'Ability to match basic written words to images',
            scale: {
              1: 'Unable to match word with corresponding image',
              3: 'Hesitates but eventually selects correct image',
              5: 'Quickly and correctly matches word to image'
            }
          }
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
          {
            name: 'Dialogue Comprehension',
            description: 'Ability to understand the main point of short dialogues',
            scale: {
              1: 'Unable to identify main intent of speakers',
              3: 'Understands some elements but misses key information',
              5: 'Accurately identifies speaker intentions and key information'
            }
          }
        ],
        cognitiveTag: 'comprehension',
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
          {
            name: 'Main Idea Identification',
            description: 'Ability to identify the main theme of paragraphs',
            scale: {
              1: 'Unable to correctly match headings with paragraphs',
              3: 'Matches some headings correctly but misses others',
              5: 'Correctly matches all headings to appropriate paragraphs'
            }
          },
          {
            name: 'Skimming Skill',
            description: 'Ability to skim text efficiently to locate themes',
            scale: {
              1: 'Struggles to locate relevant information',
              3: 'Finds some relevant information with effort',
              5: 'Efficiently locates key information to make matches'
            }
          }
        ],
        cognitiveTag: 'inference',
        languageFunctions: ['recognizing', 'synthesizing'],
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
          {
            name: 'Task Fulfillment',
            description: 'Addresses the problem and provides solutions',
            scale: {
              1: 'Does not address problem or provide solutions',
              3: 'Partially addresses problem with vague solutions',
              5: 'Clearly presents problem and offers specific, realistic solutions'
            }
          },
          {
            name: 'Fluency & Coherence',
            description: 'Speaking flow and logical organization',
            scale: {
              1: 'Disconnected speech with frequent pauses',
              3: 'Some hesitations but generally connected ideas',
              5: 'Smooth delivery with logical progression of ideas'
            }
          },
          {
            name: 'Lexical Resource',
            description: 'Vocabulary range and appropriacy',
            scale: {
              1: 'Limited vocabulary affecting communication',
              3: 'Adequate but somewhat repetitive vocabulary',
              5: 'Wide range of topic-appropriate vocabulary'
            }
          }
        ],
        cognitiveTag: 'problem-solving',
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
          {
            name: 'Argument Clarity & Relevance',
            description: 'Quality and relevance of counterarguments',
            scale: {
              1: 'Unclear or irrelevant arguments',
              3: 'Generally relevant but underdeveloped arguments',
              5: 'Clear, well-supported counterpoints directly addressing the editorial'
            }
          },
          {
            name: 'Organization & Coherence',
            description: 'Essay structure and flow of ideas',
            scale: {
              1: 'Disorganized with unclear connections',
              3: 'Basic structure with some logical connections',
              5: 'Logical structure with effective transitions between ideas'
            }
          },
          {
            name: 'Lexical & Grammatical Accuracy',
            description: 'Vocabulary range and grammatical control',
            scale: {
              1: 'Frequent errors affecting meaning',
              3: 'Occasional errors but generally accurate',
              5: 'Wide range of language with minimal errors'
            }
          }
        ],
        cognitiveTag: 'evaluation',
        languageFunctions: ['justifying', 'rebutting'],
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
