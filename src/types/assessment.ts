
// Basic Types
export type QuestionType = 'multiple-choice' | 'image-selection' | 'heading-matching' | 'audio-recording' | 'essay-writing' | 'open-ended' | 'matching' | 'gap-fill' | 'short-answer' | 'paragraph-writing' | 'long-answer' | 'note-completion' | 'summary-completion';
export type CEFRLevel = 'Pre-A1' | 'A1' | 'A1+' | 'A2' | 'A2+' | 'B1' | 'B1+' | 'B2' | 'B2+' | 'C1' | 'C1+' | 'C2' | 'Below Pre-A1' | 'N/A';
export type Skill = 'reading' | 'writing' | 'listening' | 'speaking';
export type CognitiveTag = 'recall' | 'comprehend' | 'apply' | 'analyze' | 'evaluate' | 'create' | 'infer' | 'problem-solve';
export type LanguageFunction = 'identifying' | 'describing' | 'comparing' | 'arguing' | 'explaining' | 'analyzing' | 'justifying' | 'recognizing' | 'evaluating' | 'inferring' | 'hypothesizing' | 'rebutting' | 'suggesting' | 'synthesizing';

// Question and Rubric Interfaces
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
  category: 'describe' | 'argue' | 'explain' | 'narrate';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  timeLimit: number;
  questionData?: AssessmentQuestion;
}

// Assessment Results Interfaces
export interface AssessmentMetrics {
  fluency: number;
  grammar: number;
  pronunciation: number;
  prosody: number;
  vocabulary: number;
  syntax: number;
  coherence: number;
  // Optional skill metrics for full assessments
  listening?: number;
  reading?: number;
  writing?: number;
}

export interface AssessmentFeedback {
  fluency: string;
  grammar: string;
  pronunciation: string;
  prosody: string;
  vocabulary: string;
  syntax: string;
  coherence: string;
  overall: string;
  // Optional skill feedback for full assessments
  listening?: string;
  reading?: string;
  writing?: string;
}

export interface AssessmentResult {
  metrics: AssessmentMetrics;
  totalScore: number;
  cefrLevel: CEFRLevel;
  feedback: AssessmentFeedback;
  audioUrl?: string;
  duration?: number;
  speechRate?: number;
  confidenceScore?: number;
  transcript?: string;
  // Additional metadata for reports
  audioAnalysis?: AudioAnalysisResult;
  learnerName?: string;
  sessionId?: string;
  dateOfTest?: string;
  assessmentType?: 'quick' | 'full';
  assessmentName?: string;
}

// Test Structure Interfaces
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

// AudioAnalysisResult interface with all required properties
export interface AudioAnalysisResult {
  wpm: number;
  totalWords: number;
  pauseCount: number;
  pauseDuration: number;
  pauseRatio: number;
  speakingDuration: number;
  totalDuration: number;
  syllableCount?: number;
  syllablesPerMinute?: number;
  // Enhanced speech analysis metrics
  mlrScore?: number;            // Mean Length of Runs score
  articulationRate?: number;    // Syllables per second of speech
  speakingTime?: number;        // Time spent speaking (excluding pauses)
  silenceTime?: number;         // Time spent in silence
  pauseDurations?: any[];       // Detailed information about pauses
  wordTimings?: any[];          // Word-level timing information
  // Fluency analysis metrics
  hesitationCount?: number;      // Number of hesitation markers detected
  hesitationRatio?: number;      // Ratio of hesitation markers to total words
  hesitationMarkers?: string[];  // List of detected hesitation markers
  repetitionCount?: number;      // Number of repetitions detected
  repetitions?: string[];        // List of detected repetitions
  fluencyJustification?: string; // Explanation of fluency assessment
  // Grammar and pronunciation analysis
  grammaticalErrors?: GrammaticalError[];
  syntaxComplexity?: SyntaxComplexity;
  grammarScore?: number;
  syntaxScore?: number;
  cefrGrammarLevel?: string;
  cefrSyntaxLevel?: string;
  grammarJustification?: string;
  syntaxJustification?: string;
  promptCEFRLevel?: string;
  levelDiscrepancy?: number;
  needsReview?: boolean;
  // Pronunciation data
  pronunciationScore?: number;
  cefrLevel?: string;
  pronunciationDetails?: any;
  // Vocabulary analysis
  vocabularyScore?: number;
  cefrVocabularyLevel?: string;
  vocabularyJustification?: string;
  vocabularyDistribution?: Record<string, number>;
  // Pause quality analysis
  pauseAnalysis?: any;
  fluencyScore?: number;
  cefrFluencyLevel?: string;
}

// New interfaces for enhanced grammar and syntax analysis
export interface GrammaticalError {
  type: 'agreement' | 'tense' | 'article' | 'preposition' | 'other';
  context: string;
  suggestion?: string;
}

export interface SyntaxComplexity {
  averageSentenceLength: number;
  complexSentenceRatio: number; // Proportion of sentences with multiple clauses
  structuralVariety: number; // 1-10 score based on different sentence patterns
  subordinationIndex: number; // Average number of dependent clauses per sentence
}
