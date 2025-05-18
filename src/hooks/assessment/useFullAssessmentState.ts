
import { SpeakingPrompt, AssessmentResult } from '@/types/assessment';
import { useStudentInfo, StudentInfo } from './useStudentInfo';
import { usePromptSelection } from './usePromptSelection';
import { useAssessmentResult } from './useAssessmentResult';
import { useFullAssessment } from './useFullAssessment';

/**
 * Combined hook that provides a unified state management for the assessment flow
 * This pulls together multiple smaller hooks into a consistent API
 */
export const useFullAssessmentState = () => {
  // Use individual hooks
  const { studentInfo, handleStudentInfoSubmit } = useStudentInfo();
  const { selectedPrompt, handlePromptSelect: baseHandlePromptSelect } = usePromptSelection();
  const { 
    assessmentResult, 
    isProcessing, 
    detailedFeedback,
    handleRecordingComplete, 
    handleReset: baseHandleReset
  } = useAssessmentResult({ selectedPrompt, studentInfo });
  const {
    showFullAssessment,
    showFullAssessmentIntro,
    handleStartFullAssessment,
    handleFullAssessmentComplete: baseHandleFullAssessmentComplete,
    handleFullAssessmentExit,
    handleShowFullAssessmentIntro,
    handleCloseFullAssessmentIntro
  } = useFullAssessment();

  // Enhanced handlers that coordinate between hooks
  const handlePromptSelect = (prompt: SpeakingPrompt) => {
    baseHandlePromptSelect(prompt);
    baseHandleReset();
  };

  const handleFullAssessmentComplete = (result?: AssessmentResult) => {
    return baseHandleFullAssessmentComplete(result);
  };

  const handleReset = () => {
    baseHandleReset();
    baseHandlePromptSelect(null);
  };

  return {
    // State
    selectedPrompt,
    assessmentResult,
    isProcessing,
    showFullAssessment,
    showFullAssessmentIntro,
    detailedFeedback,
    studentInfo,
    
    // Handlers
    handlePromptSelect,
    handleRecordingComplete,
    handleStartFullAssessment,
    handleFullAssessmentComplete,
    handleFullAssessmentExit,
    handleReset,
    handleShowFullAssessmentIntro,
    handleCloseFullAssessmentIntro,
    handleStudentInfoSubmit
  };
};
