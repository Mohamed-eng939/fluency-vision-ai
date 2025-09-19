
import { useAssessmentFlowState } from './useAssessmentFlowState';
import { useAssessmentFlowActions } from './useAssessmentFlowActions';
import { useAssessmentFlowHandlers } from './useAssessmentFlowHandlers';
import { AssessmentStep, AssessmentFlowConfig } from './types/assessmentTypes';

export { AssessmentStep } from './types/assessmentTypes';
export type { AssessmentFlowConfig } from './types/assessmentTypes';

export const useAssessmentFlow = (config: Partial<AssessmentFlowConfig> = {}) => {
  // Get all state and actions from the state hook
  const state = useAssessmentFlowState(config);
  
  // Get assessment flow actions
  const {
    initializeAssessmentFlow,
    startAssessmentFlow,
    resetAssessmentFlow
  } = useAssessmentFlowActions({
    initializeSession: state.initializeSession,
    initializePromptQueue: state.initializePromptQueue,
    resetScoring: state.resetScoring,
    resetStoredResponses: state.resetStoredResponses,
    promptQueue: state.promptQueue,
    handlePromptSelect: state.handlePromptSelect,
    setCurrentStep: state.setCurrentStep,
    handleReset: state.handleReset,
    resetSession: state.resetSession,
    setPromptHistory: state.setPromptHistory,
    setReadAloudStage: state.setReadAloudStage
  });

  // Get assessment flow handlers
  const {
    handleResponseComplete,
    processBatchAndFinish,
    skipToNextPrompt,
    initializeA1ReadAloud,
    handleA1ReadAloudProgress
  } = useAssessmentFlowHandlers({
    selectedPrompt: state.selectedPrompt,
    storeResponse: state.storeResponse,
    currentPromptIndex: state.currentPromptIndex,
    totalPrompts: state.totalPrompts,
    moveToNextPrompt: state.moveToNextPrompt,
    handlePromptSelect: state.handlePromptSelect,
    handleReset: state.handleReset,
    processAllStoredResponses: state.processAllStoredResponses,
    setCurrentStep: state.setCurrentStep,
    finishAssessment: state.finishAssessment,
    setFinalResult: state.setFinalResult,
    storeAssessmentData: state.storeAssessmentData,
    studentInfo: state.studentInfo,
    promptHistory: state.promptHistory,
    emailResults: state.emailResults,
    bypassScoringDelay: state.bypassScoringDelay,
    sessionId: state.sessionId,
    readAloudStage: state.readAloudStage,
    setReadAloudStage: state.setReadAloudStage
  });
  
  return {
    // State
    currentStep: state.currentStep,
    studentInfo: state.studentInfo,
    emailResults: state.emailResults,
    sessionId: state.sessionId,
    promptQueue: state.promptQueue,
    promptHistory: state.promptHistory,
    currentPromptIndex: state.currentPromptIndex,
    currentPrompt: state.currentPrompt,
    finalResult: state.finalResult,
    consistentScores: state.consistentScores,
    bypassScoringDelay: state.bypassScoringDelay,
    showRawScoring: state.showRawScoring,
    isProcessing: state.isProcessing || state.isProcessingAllResponses,
    detailedFeedback: state.detailedFeedback,
    storedResponses: state.storedResponses,
    storedResponsesCount: state.storedResponses.length,
    processingProgress: state.processingProgress,
    readAloudStage: state.readAloudStage,
    
    // Assessment result state
    assessmentResult: state.assessmentResult,
    
    // Methods
    setCurrentStep: state.setCurrentStep,
    initializeAssessment: initializeAssessmentFlow,
    startAssessment: startAssessmentFlow,
    handleResponseComplete,
    skipToNextPrompt,
    finishAssessment: () => processBatchAndFinish(),
    resetAssessment: resetAssessmentFlow,
    toggleAdminReviewMode: state.toggleAdminReviewMode,
    handleStudentInfoSubmit: state.handleStudentInfoSubmit,
    processAllStoredResponses: processBatchAndFinish,
    processBatchAndFinish,
    initializeA1ReadAloud,
    handleA1ReadAloudProgress,
    
    // Configuration
    flowConfig: state.flowConfig,
    totalPrompts: state.totalPrompts
  };
};
