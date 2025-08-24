
// Define the assessment flow steps
export enum AssessmentStep {
  ENTRY = 'entry',
  WELCOME = 'welcome',
  RECORDING = 'recording',
  READ_ALOUD = 'read_aloud',
  PROCESSING = 'processing',
  RESULTS = 'results',
  ADMIN_REVIEW = 'admin_review'
}

// Configuration type for assessment flow
export interface AssessmentFlowConfig {
  promptsCount: number;
  requiredConsistentScores: number;
  emailDelay: number; // in milliseconds
  showAdminControls: boolean;
}

// Default configuration
export const DEFAULT_CONFIG: AssessmentFlowConfig = {
  promptsCount: 38, // 23 free response + 15 read aloud tasks
  requiredConsistentScores: 4,
  emailDelay: 15 * 60 * 1000, // 15 minutes
  showAdminControls: false
};
