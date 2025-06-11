
import { useState } from 'react';
import { SpeakingPrompt, AssessmentResult, AudioAnalysisResult } from '@/types/assessment';
import { useStudentInfo } from './useStudentInfo';
import { usePromptSelection } from './usePromptSelection';
import { useAssessmentResult } from './useAssessmentResult';
import { usePromptManagement } from './usePromptManagement';
import { useAssessmentScoring } from './useAssessmentScoring';
import { useAdminControls } from './useAdminControls';
import { useSessionManagement } from './useSessionManagement';
import { useResponseStorage } from './useResponseStorage';
import { useAssessmentControl } from './useAssessmentControl';
import { AssessmentStep, AssessmentFlowConfig } from './types/assessmentTypes';

export { AssessmentStep } from './types/assessmentTypes';
export type { AssessmentFlowConfig } from './types/assessmentTypes';

export const useAssessmentFlow = (config: Partial<AssessmentFlowConfig> = {}) => {
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
  } = usePromptManagement(config.promptsCount || 10);
  
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

  // Response storage and processing
  const {
    storedResponses,
    isProcessingAllResponses,
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

  // Handle recording completion - now just stores the response
  const handleResponseComplete = async (audioBlob: Blob, transcript?: string, audioAnalysis?: AudioAnalysisResult) => {
    console.log("Response completed, storing for later analysis...");
    
    // Store the response without processing
    storeResponse(selectedPrompt!, audioBlob, transcript, audioAnalysis);
    
    // Move to next prompt immediately
    const nextPrompt = moveToNextPrompt();
    if (nextPrompt) {
      console.log("Moving to next prompt:", nextPrompt.text);
      handlePromptSelect(nextPrompt);
      handleReset(); // Clear previous recording state
    } else {
      console.log("No more prompts, processing all responses");
      await processAllStoredResponsesAndFinish();
    }
  };

  // Process all stored responses and finish assessment
  const processAllStoredResponsesAndFinish = async () => {
    setCurrentStep(AssessmentStep.PROCESSING);
    
    const lastResult = await processAllStoredResponses(
      sessionId,
      studentInfo?.name,
      setPromptHistory
    );
    
    finishAssessment(
      lastResult,
      setFinalResult,
      storeAssessmentData,
      studentInfo,
      promptHistory,
      emailResults,
      bypassScoringDelay
    );
  };
  
  // Skip to next prompt
  const skipToNextPrompt = () => {
    console.log("Skipping to next prompt");
    const nextPrompt = moveToNextPrompt();
    
    if (nextPrompt) {
      handlePromptSelect(nextPrompt);
      handleReset();
    } else {
      processAllStoredResponsesAndFinish();
    }
  };

  // Wrapper functions for control hooks
  const initializeAssessmentFlow = (withEmail: boolean = false) => {
    initializeAssessment(
      initializeSession,
      initializePromptQueue,
      resetScoring,
      resetStoredResponses,
      withEmail
    );
  };

  const startAssessmentFlow = () => {
    startAssessment(promptQueue, handlePromptSelect);
  };

  const resetAssessmentFlow = () => {
    resetAssessment(
      handleReset,
      resetSession,
      resetScoring,
      setPromptHistory,
      resetStoredResponses
    );
  };
  
  return {
    // State
    currentStep,
    studentInfo,
    emailResults,
    sessionId,
    promptQueue,
    promptHistory,
    currentPromptIndex,
    currentPrompt,
    finalResult,
    consistentScores,
    bypassScoringDelay,
    showRawScoring,
    isProcessing: isProcessing || isProcessingAllResponses,
    detailedFeedback,
    storedResponses,
    
    // Assessment result state
    assessmentResult,
    
    // Methods
    setCurrentStep,
    initializeAssessment: initializeAssessmentFlow,
    startAssessment: startAssessmentFlow,
    handleResponseComplete,
    skipToNextPrompt,
    finishAssessment: processAllStoredResponsesAndFinish,
    resetAssessment: resetAssessmentFlow,
    toggleAdminReviewMode,
    handleStudentInfoSubmit,
    processAllStoredResponses: processAllStoredResponsesAndFinish,
    
    // Configuration
    flowConfig,
    totalPrompts
  };
};
