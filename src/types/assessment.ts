
export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
export type TestSkill = 'reading' | 'writing' | 'listening' | 'speaking';
export type TestLevel = CEFRLevel;
export type QuestionType = 
  'multiple-choice' | 
  'gap-fill' | 
  'short-answer' | 
  'long-answer' | 
  'matching' | 
  'paragraph-writing' | 
  'essay-writing' | 
  'image-selection' | 
  'audio-recording' |
  'heading-matching' |
  'note-completion' |
  'summary-completion';

export type LanguageFunction = 
  'describing' | 
  'narrating' | 
  'arguing' | 
  'explaining' | 
  'instructing' | 
  'comparing' | 
  'hypothesizing' |
  'identifying' |
  'recognizing' |
  'suggesting' |
  'justifying' |
  'rebutting' |
  'synthesizing';

export type CognitiveTag = 
  'recall' | 
  'comprehend' | 
  'apply' | 
  'analyze' | 
  'evaluate' | 
  'create' |
  'problem-solve' |
  'infer';

export interface AssessmentMetrics {
  fluency: number; // 0-10
  grammar: number; // 0-10
  pronunciation: number; // 0-10
  prosody: number; // 0-10 (intonation, rhythm, stress)
  vocabulary: number; // 0-10
  syntax: number; // 0-10
  coherence: number; // 0-10
}

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
  totalScore: number; // 0-100
  cefrLevel: CEFRLevel;
  feedback: AssessmentFeedback;
  audioUrl?: string; // URL to the recorded audio
  duration?: number; // Duration of the recording in seconds
  speechRate?: number; // Words per minute
  confidenceScore?: number; // ML confidence score (0-1)
  transcript?: string; // Transcription of the speech
}

export interface RubricCriterion {
  name: string;
  description: string;
  levels: {
    [key: number]: string; // Maps score (typically 1-5) to descriptor
  };
}

export interface RubricEdge {
  from: string; // Criterion name
  to: string; // Criterion name
  weight: number; // 0-1, influence of one criterion on another
}

export interface DynamicRubric {
  criteria: RubricCriterion[];
  edges?: RubricEdge[]; // For weighted scoring graphs
  scale: number; // Typically 5 or 10
}

export interface AssessmentQuestion {
  id: string;
  text: string;
  type: QuestionType;
  options?: string[];
  correctAnswer?: string | string[];
  rubric?: {
    criteria: string[];
    scale: number; // typically 1-5
    cognitiveTag: CognitiveTag;
    languageFunctions: LanguageFunction[];
    weightedCriteria?: {
      [key: string]: number; // criterion: weight (0-1)
    };
  };
  audioUrl?: string;
  imageUrl?: string;
  textPassage?: string;
}

export interface SpeakingPrompt {
  id: string;
  text: string;
  category: string;
  difficulty: string;
  timeLimit: number;
}

export interface TestRubric {
  criteria: string[];
  scale: number;
  cognitiveTag: CognitiveTag;
  languageFunctions: LanguageFunction[];
  canDoDescriptor?: string;
}

export interface TestTask {
  id: string;
  title: string;
  level: TestLevel;
  skill: TestSkill;
  description: string;
  instructions: string;
  timeLimit: number; // in minutes
  questions: number;
  questionsList?: AssessmentQuestion[];
  objective?: string;
  rubric?: TestRubric;
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

// New interface for tracking progress through an assessment
export interface AssessmentProgress {
  assessmentId: string;
  currentSectionIndex: number;
  currentTaskIndex: number;
  completedTasks: string[]; // Array of completed task IDs
  answers: Record<string, any>; // Answers keyed by questionId
  results: Record<string, {
    score: number;
    criteriaScores: Record<string, number>;
  }>; // Results keyed by taskId
  startTime: Date;
  lastUpdated: Date;
}

// New interface for speech analysis details
export interface SpeechAnalysisDetails {
  audioUrl: string;
  duration: number;
  transcript: string;
  confidenceScore: number;
  speechRate: number; // Words per minute
  pausePattern: number; // 0-10 score
  energyVariation: number; // 0-10 score
  pitchRange: number; // 0-10 score
}
