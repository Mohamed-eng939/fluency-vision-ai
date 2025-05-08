
export interface AssessmentMetrics {
  fluency: number;
  grammar: number;
  pronunciation: number;
  prosody: number;
  vocabulary: number;
  syntax: number;
  coherence: number;
}

export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
export type SkillType = 'listening' | 'reading' | 'speaking' | 'writing';

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
