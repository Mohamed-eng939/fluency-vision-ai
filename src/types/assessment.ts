
export interface AssessmentMetrics {
  fluency: number;
  grammar: number;
  pronunciation: number;
  prosody: number;
  vocabulary: number;
  syntax: number;
  coherence: number;
}

export type CEFRLevel = 'A0' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
export type SkillType = 'listening' | 'reading' | 'speaking' | 'writing';
export type CognitiveTag = 'recall' | 'comprehension' | 'application' | 'analysis' | 'synthesis' | 'evaluation' | 'problem-solving' | 'inference';
export type LanguageFunction = 
  'describing' | 'explaining' | 'suggesting' | 'comparing' | 
  'evaluating' | 'narrating' | 'arguing' | 'justifying' | 
  'rebutting' | 'identifying' | 'instructing' | 'synthesizing' |
  'analyzing' | 'summarizing';

export type QuestionType = 
  'multiple-choice' | 'matching' | 'gap-fill' | 'short-answer' | 
  'long-answer' | 'image-selection' | 'audio-recording' | 
  'paragraph-writing' | 'essay-writing' | 'heading-matching' | 
  'note-completion' | 'summary-completion';

export interface AssessmentFeedback {
  fluency: string;
  grammar: string;
  pronunciation: string;
  prosody: string;
  vocabulary: string;
  syntax: string;
  coherence: string;
  overall: string;
}

export interface AssessmentResult {
  metrics: AssessmentMetrics;
  totalScore: number;
  cefrLevel: CEFRLevel;
  feedback: AssessmentFeedback;
}

export interface SpeakingPrompt {
  id: string;
  text: string;
  category: 'describe' | 'argue' | 'explain' | 'narrate';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  timeLimit: number; // in seconds
}

// Enhanced question types with more CEFR-aligned structure
export interface AssessmentQuestion {
  id: string;
  text: string;
  type: QuestionType;
  options?: string[];
  imageUrl?: string;
  audioUrl?: string;
  correctAnswer?: string | string[]; // Can be a single answer or multiple answers
  rubric?: QuestionRubric;  // Scoring guidelines
}

export interface QuestionRubric {
  criteria: {
    name: string;
    description: string;
    scale: {
      1: string;
      3: string;
      5: string;
    };
  }[];
  cognitiveTag: CognitiveTag;
  languageFunctions: LanguageFunction[];
  canDoDescriptor: string;
}

// New interfaces for the full assessment system
export interface TestTask {
  id: string;
  title: string;
  level: CEFRLevel;
  skill: SkillType;
  description: string;
  instructions: string;
  timeLimit: number; // in minutes
  questions: number;
  questionsList?: AssessmentQuestion[];
  objective?: string;
  rubric?: {
    criteria: string[];
    scale: number; // 1-5 scale
    cognitiveTag: CognitiveTag;
    languageFunctions: LanguageFunction[];
    canDoDescriptor: string;
  };
}

export interface TestSection {
  id: string;
  title: string;
  description: string;
  tasks: TestTask[];
}

export interface FullAssessment {
  id: string;
  title: string;
  description: string;
  estimatedTime: string;
  sections: TestSection[];
}
