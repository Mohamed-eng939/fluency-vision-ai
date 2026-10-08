
import { QuestionType, CEFRLevel, Track } from './basic';
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
  /** Which age-based test this prompt belongs to (kids / teens / adults). */
  track?: Track;
  /**
   * A "probe" question that sits one band above the track's normal ceiling
   * (e.g. a B1 item on the Teens test). Strong performance on probes is the
   * signal that a human assessor should move the student up a track.
   */
  isProbe?: boolean;
}
