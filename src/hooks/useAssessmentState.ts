import { useStudentInfo, StudentInfo } from './assessment/useStudentInfo';
import { usePromptSelection } from './assessment/usePromptSelection';
import { useAssessmentResult } from './assessment/useAssessmentResult';
import { useFullAssessment } from './assessment/useFullAssessment';
import { SpeakingPrompt, AssessmentResult, AudioAnalysisResult } from '@/types/assessment';

export const useAssessmentState = () => {
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
    const processedResult = baseHandleFullAssessmentComplete(result);
    if (processedResult) {
      // If we have a result, update our assessment result state
      // This is handled by the useAssessmentResult hook
    }
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

// Re-export the StudentInfo type for convenience
export type { StudentInfo };
