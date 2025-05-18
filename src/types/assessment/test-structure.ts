
import { Skill } from './basic';
import { TestRubric } from './rubrics';
import { AssessmentQuestion } from './questions';

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
