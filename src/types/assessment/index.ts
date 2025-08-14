
// Re-export all types from their respective files
export * from './basic';
export * from './rubrics';
export * from './questions';
export * from './results';
export * from './test-structure';
export * from './audio';

// Import CEFRLevel to use in local interfaces
import { CEFRLevel } from './basic';

// Additional types for CEFR Sample Bank
export interface CEFRSample {
  id: string;
  promptId: string;
  level: CEFRLevel;
  transcript: string;
  scores: {
    vocabulary: number;
    grammar: number;
    coherence: number;
    lexicalCollocation: number;
    taskAchievement: number;
  };
  finalCEFR: CEFRLevel;
  rationale: string;
  lexicalFeatures: string[];
  grammarFeatures: string[];
  discourseMarkers: string[];
}
