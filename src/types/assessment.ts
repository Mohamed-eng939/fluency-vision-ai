// Basic Types
export type QuestionType = 'multiple-choice' | 'image-selection' | 'heading-matching' | 'audio-recording' | 'essay-writing' | 'open-ended' | 'matching' | 'gap-fill' | 'short-answer' | 'paragraph-writing' | 'long-answer' | 'note-completion' | 'summary-completion';
export type CEFRLevel = 'Pre-A1' | 'A1' | 'A1+' | 'A2' | 'A2+' | 'B1' | 'B1+' | 'B2' | 'B2+' | 'C1' | 'C1+' | 'C2' | 'Below Pre-A1' | 'N/A';
export type Skill = 'reading' | 'writing' | 'listening' | 'speaking';
export type CognitiveTag = 'recall' | 'comprehend' | 'apply' | 'analyze' | 'evaluate' | 'create' | 'infer' | 'problem-solve';
export type LanguageFunction = 'identifying' | 'describing' | 'comparing' | 'arguing' | 'explaining' | 'analyzing' | 'justifying' | 'recognizing' | 'evaluating' | 'inferring' | 'hypothesizing' | 'rebutting' | 'suggesting' | 'synthesizing';

// Question and Rubric Interfaces
export interface TestRubric {
  criteria: string[];
  scale: number;
  cognitiveTag?: CognitiveTag;
  languageFunctions?: LanguageFunction[];
  canDoDescriptor?: string;
}

export interface DetailedRubricCriterion {
  name: string;
  description: string;
  levelDescriptors: Record<number, string>;
}

export interface DetailedRubric extends TestRubric {
  detailedCriteria: DetailedRubricCriterion[];
}

export interface AssessmentQuestion {
  id: string;
  type: QuestionType;
  text: string;
  audioUrl?: string;
  imageUrl?: string;
  options?: string[];
  correctAnswer?: string | string[];
  rubric: TestRubric;
}

export interface SpeakingPrompt {
  id: string;
  text: string;
  category: 'describe' | 'argue' | 'explain' | 'narrate';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  timeLimit: number;
  questionData?: AssessmentQuestion;
}

// Assessment Results Interfaces
export interface AssessmentMetrics {
  fluency: number;
  grammar: number;
  pronunciation: number;
  prosody: number;
  vocabulary: number;
  syntax: number;
  coherence: number;
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
  totalScore: number;
  cefrLevel: CEFRLevel;
  feedback: AssessmentFeedback;
  audioUrl?: string;
  duration?: number;
  speechRate?: number;
  confidenceScore?: number;
  transcript?: string;
}

// Test Structure Interfaces
export interface TestTask {
  id: string;
  title: string;
  level: string;
  skill: Skill;
  description?: string;
  instructions?: string;
  timeLimit: number;
  questions: number;
  questionsList?: AssessmentQuestion[];
  objective?: string;
  rubric?: TestRubric;
}

export interface TestSection {
  id: string;
  title: string;
  description?: string;
  tasks: TestTask[];
}

export interface FullAssessment {
  id: string;
  title: string;
  description?: string;
  estimatedTime: string;
  sections: TestSection[];
}

// Add AudioAnalysisResult to be available in Assessment.tsx
export interface AudioAnalysisResult {
  wpm: number;
  totalWords: number;
  pauseCount: number;
  pauseDuration: number;
  pauseRatio: number;
  speakingDuration: number;
  totalDuration: number;
}
