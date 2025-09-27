
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

// Read-Aloud stage state - now handles all 15 sentences across CEFR levels
export interface ReadAloudStage {
  ready: boolean;
  done: boolean;
  currentIndex: number;
  totalItems: number;
  items: ReadAloudItem[];
}

export interface ReadAloudItem {
  sentence_id: string;
  band: string;
  text: string;
}

// All 15 Read-Aloud sentences (3 per CEFR band A1-C1)
export const READ_ALOUD_SENTENCES: ReadAloudItem[] = [
  // A1 Level (1-3)
  { sentence_id: 'RA_A1_001', band: 'A1', text: 'The sun is big and hot.' },
  { sentence_id: 'RA_A1_002', band: 'A1', text: 'I have a red book on the table.' },
  { sentence_id: 'RA_A1_003', band: 'A1', text: 'My father works in a small shop.' },
  
  // A2 Level (4-6)
  { sentence_id: 'RA_A2_001', band: 'A2', text: 'Yesterday we visited the park and played football.' },
  { sentence_id: 'RA_A2_002', band: 'A2', text: 'She is going to travel to Cairo next week.' },
  { sentence_id: 'RA_A2_003', band: 'A2', text: 'I usually drink coffee in the morning before work.' },
  
  // B1 Level (7-9)
  { sentence_id: 'RA_B1_001', band: 'B1', text: 'People should eat healthy food because it helps the body stay strong.' },
  { sentence_id: 'RA_B1_002', band: 'B1', text: 'Last year I went to the beach with my friends and we had a great time.' },
  { sentence_id: 'RA_B1_003', band: 'B1', text: 'I think technology makes life easier, but sometimes it is also a problem.' },
  
  // B2 Level (10-12)
  { sentence_id: 'RA_B2_001', band: 'B2', text: 'Although technology brings people closer, it also creates distance when overused.' },
  { sentence_id: 'RA_B2_002', band: 'B2', text: 'Many young people believe social media is useful, yet it can waste valuable time.' },
  { sentence_id: 'RA_B2_003', band: 'B2', text: 'I enjoy learning new languages because they open doors to different cultures and ideas.' },
  
  // C1 Level (13-15)
  { sentence_id: 'RA_C1_001', band: 'C1', text: 'If governments invested more in education, societies would benefit for generations to come.' },
  { sentence_id: 'RA_C1_002', band: 'C1', text: 'Balancing economic growth with environmental protection is one of the greatest challenges of our time.' },
  { sentence_id: 'RA_C1_003', band: 'C1', text: 'While globalization connects markets, it also raises difficult questions about cultural identity and sustainability.' }
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
