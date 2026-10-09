
// Basic type definitions for CEFR levels and categorization
export type QuestionType = 'multiple-choice' | 'image-selection' | 'heading-matching' | 'audio-recording' | 'essay-writing' | 'open-ended' | 'matching' | 'gap-fill' | 'short-answer' | 'paragraph-writing' | 'long-answer' | 'note-completion' | 'summary-completion';
export type CEFRLevel = 'Pre-A1' | 'A1' | 'A1+' | 'A2' | 'A2+' | 'B1' | 'B1+' | 'B2' | 'B2+' | 'C1' | 'C1+' | 'C2' | 'Below Pre-A1' | 'N/A';
export type Skill = 'reading' | 'writing' | 'listening' | 'speaking';
// Age-based placement track. Which test a student takes is chosen from their age:
// 6-10 -> kids, 11-16 -> teens, 17+ -> adults. See src/data/assessment/tracks.ts.
export type Track = 'kids' | 'teens' | 'adults';
export type CognitiveTag = 'recall' | 'comprehend' | 'apply' | 'analyze' | 'evaluate' | 'create' | 'infer' | 'problem-solve';
export type LanguageFunction = 'identifying' | 'describing' | 'comparing' | 'arguing' | 'explaining' | 'analyzing' | 'justifying' | 'recognizing' | 'evaluating' | 'inferring' | 'hypothesizing' | 'rebutting' | 'suggesting' | 'synthesizing';
