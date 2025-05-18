
import { useFullAssessmentState } from './assessment/useFullAssessmentState';
import type { StudentInfo } from './assessment/useStudentInfo';

/**
 * @deprecated Use useFullAssessmentState from './assessment/useFullAssessmentState' instead
 */
export const useAssessmentState = useFullAssessmentState;

// Re-export the StudentInfo type for convenience
export type { StudentInfo };
