
// Define the assessment flow steps
export enum AssessmentStep {
  ENTRY = 'entry',
  WELCOME = 'welcome',
  RECORDING = 'recording',
  READ_ALOUD_LOADING = 'read_aloud_loading',
  READ_ALOUD = 'read_aloud',
  PROCESSING = 'processing',
  RESULTS = 'results',
  ADMIN_REVIEW = 'admin_review'
}

// Read-Aloud stage state
export interface ReadAloudStage {
  a1: {
    ready: boolean;
    done: boolean;
    index: number;
    items: ReadAloudItem[];
  };
}

export interface ReadAloudItem {
  sentence_id: string;
  band: string;
  text: string;
}

// A1 Read-Aloud sentences
export const A1_READ_ALOUD_SENTENCES: ReadAloudItem[] = [
  { sentence_id: 'RA_A1_001', band: 'A1', text: 'The sun is big and hot.' },
  { sentence_id: 'RA_A1_002', band: 'A1', text: 'I have a red book on the table.' },
  { sentence_id: 'RA_A1_003', band: 'A1', text: 'My father works in a small shop.' }
];

// Configuration type for assessment flow
export interface AssessmentFlowConfig {
  promptsCount: number;
  requiredConsistentScores: number;
  emailDelay: number; // in milliseconds
  showAdminControls: boolean;
}

// Default configuration
export const DEFAULT_CONFIG: AssessmentFlowConfig = {
  promptsCount: 38, // All 23 speaking + 15 read aloud tasks grouped by CEFR level
  requiredConsistentScores: 4,
  emailDelay: 15 * 60 * 1000, // 15 minutes
  showAdminControls: false
};
