
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
