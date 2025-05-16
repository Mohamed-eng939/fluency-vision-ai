
/**
 * CEFR Types
 * Type definitions for the CEFR assessment framework
 */

export type CEFRFeatureLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export interface CEFRGrammarSyntaxEntry {
  level: CEFRFeatureLevel;
  grammar: string;
  syntax: string;
  examples: {
    grammar: string;
    syntax: string;
  };
  features: string[];
  score_range: [number, number];
}

export interface CEFRGrammarSyntaxRubric {
  cefr_rubric: CEFRGrammarSyntaxEntry[];
}
