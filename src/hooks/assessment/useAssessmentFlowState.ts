
import { useState } from 'react';
import { useStudentInfo } from './useStudentInfo';
import { usePromptSelection } from './usePromptSelection';
import { useAssessmentResult } from './useAssessmentResult';
import { usePromptManagement } from './usePromptManagement';
import { useAssessmentScoring } from './useAssessmentScoring';
import { useAdminControls } from './useAdminControls';
import { useSessionManagement } from './useSessionManagement';
import { useResponseStorage } from './useResponseStorage';
import { useAssessmentControl } from './useAssessmentControl';
import { AssessmentFlowConfig } from './types/assessmentTypes';

export const useAssessmentFlowState = (config: Partial<AssessmentFlowConfig> = {}) => {
  // Student information state
  const { studentInfo, handleStudentInfoSubmit } = useStudentInfo();
  
  // Session management
  const { 
    sessionId, 
    emailResults, 
    initializeSession, 
    storeAssessmentData,
    resetSession 
  } = useSessionManagement();
  
  // Prompt management
  const { 
    promptQueue, 
    promptHistory, 
    currentPromptIndex, 
    currentPrompt,
    totalPrompts,
    initializePromptQueue,
    addToHistory,
    moveToNextPrompt,
    setPromptHistory
  } = usePromptManagement(config.promptsCount || 38);
  
  // Assessment scoring
  const { 
    finalResult, 
    setFinalResult,
    consistentScores,
    checkConsistency,
    shouldFinishAssessment,
    resetScoring
  } = useAssessmentScoring(config.requiredConsistentScores || 4);
  
  // Admin controls
  const {
    bypassScoringDelay,
    showRawScoring,
    toggleAdminReviewMode,
    resetAdminControls
  } = useAdminControls();

  // Response storage and batch processing
  const {
    storedResponses,
    isProcessingAllResponses,
    processingProgress,
    storeResponse,
    processAllStoredResponses,
    resetStoredResponses
  } = useResponseStorage();

  // Assessment control
  const {
    currentStep,
    setCurrentStep,
    flowConfig,
    initializeAssessment,
    startAssessment,
    finishAssessment,
    resetAssessment
  } = useAssessmentControl(config);
  
  // Prompt selection and assessment result hooks
  const { selectedPrompt, handlePromptSelect } = usePromptSelection();
  const { 
    assessmentResult, 
    isProcessing, 
    detailedFeedback, 
    handleRecordingComplete, 
    handleReset 
  } = useAssessmentResult({ 
    selectedPrompt, 
    studentInfo: {
      sessionId,
      name: studentInfo?.name,
    }
  });

  return {
    // Student and session state
    studentInfo,
    handleStudentInfoSubmit,
    sessionId,
    emailResults,
    initializeSession,
    storeAssessmentData,
    resetSession,

    // Prompt management state
    promptQueue,
    promptHistory,
    currentPromptIndex,
    currentPrompt,
    totalPrompts,
    initializePromptQueue,
    addToHistory,
    moveToNextPrompt,
    setPromptHistory,

    // Assessment scoring state
    finalResult,
    setFinalResult,
    consistentScores,
    checkConsistency,
    shouldFinishAssessment,
    resetScoring,

    // Admin controls state
    bypassScoringDelay,
    showRawScoring,
    toggleAdminReviewMode,
    resetAdminControls,

    // Response storage state
    storedResponses,
    isProcessingAllResponses,
    processingProgress,
    storeResponse,
    processAllStoredResponses,
    resetStoredResponses,

    // Assessment control state
    currentStep,
    setCurrentStep,
    flowConfig,
    initializeAssessment,
    startAssessment,
    finishAssessment,
    resetAssessment,

    // Prompt selection and result state
    selectedPrompt,
    handlePromptSelect,
    assessmentResult,
    isProcessing,
    detailedFeedback,
    handleRecordingComplete,
    handleReset
  };
};
