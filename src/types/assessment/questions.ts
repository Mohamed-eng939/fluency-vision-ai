
import { QuestionType, CEFRLevel } from './basic';
import { TestRubric } from './rubrics';

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
  category: 'describe' | 'argue' | 'explain' | 'narrate' | 'read_aloud';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  timeLimit: number;
  questionData?: AssessmentQuestion;
  cefrLevel?: CEFRLevel;
  topic?: string;
  audioUrl?: string;
  imageUrl?: string;
  hint?: string;
  isReadAloud?: boolean;
}
