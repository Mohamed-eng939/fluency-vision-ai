
import { CognitiveTag, LanguageFunction } from './basic';

// Rubric and assessment criteria
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
