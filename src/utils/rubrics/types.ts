
import { CEFRLevel } from '../../types/assessment';

/**
 * Interface for a specific criterion in a rubric
 */
export interface RubricCriterion {
  name: string;
  descriptors: Record<string, string>;
  weight?: number;
}

/**
 * Interface for mapping between scoring systems
 */
export interface RubricMapping {
  ielts_to_cefr: Record<string, CEFRLevel>;
  scale_conversion?: Record<string, Record<string, number>>;
}

/**
 * Interface for a complete assessment rubric
 */
export interface Rubric {
  name: string;
  description?: string;
  version: string;
  mapping: RubricMapping;
  criteria: Record<string, Record<string, string>>;
  output_format?: Record<string, any>;
}
