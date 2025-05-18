
import { useState } from 'react';
import { SpeakingPrompt, AssessmentResult, AudioAnalysisResult } from '@/types/assessment';
import { useStudentInfo } from './useStudentInfo';
import { usePromptSelection } from './usePromptSelection';
import { useAssessmentResult } from './useAssessmentResult';
import { usePromptManagement } from './usePromptManagement';
import { useAssessmentScoring } from './useAssessmentScoring';
import { useAdminControls } from './useAdminControls';
import { useSessionManagement } from './useSessionManagement';
import { AssessmentStep, AssessmentFlowConfig, DEFAULT_CONFIG } from './types/assessmentTypes';

export { AssessmentStep } from './types/assessmentTypes';
export type { AssessmentFlowConfig } from './types/assessmentTypes';

export const useAssessmentFlow = (config: Partial<AssessmentFlowConfig> = {}) => {
  // Merge provided config with defaults
  const flowConfig = { ...DEFAULT_CONFIG, ...config };
  
  // Assessment step state
  const [currentStep, setCurrentStep] = useState<AssessmentStep>(AssessmentStep.ENTRY);
  
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
  } = usePromptManagement(flowConfig.promptsCount);
  
  // Assessment scoring
  const { 
    finalResult, 
    setFinalResult,
    consistentScores,
    checkConsistency,
    shouldFinishAssessment,
    resetScoring
  } = useAssessmentScoring(flowConfig.requiredConsistentScores);
  
  // Admin controls
  const {
    bypassScoringDelay,
    showRawScoring,
    toggleAdminReviewMode,
    resetAdminControls
  } = useAdminControls();
  
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
  
  // Initialize the assessment
  const initializeAssessment = (withEmail: boolean = false) => {
    // Generate session ID and set email preference
    initializeSession(withEmail);
    
    // Initialize prompts queue
    initializePromptQueue();
    
    // Reset result and scoring
    resetScoring();
    
    // Move to welcome step
    setCurrentStep(AssessmentStep.WELCOME);
  };
  
  // Start the assessment
  const startAssessment = () => {
    if (promptQueue.length > 0) {
      // Select first prompt
      handlePromptSelect(promptQueue[0]);
      
      // Move to recording step
      setCurrentStep(AssessmentStep.RECORDING);
    }
  };
  
  // Handle recording completion
  const handleResponseComplete = (audioBlob: Blob, transcript?: string, audioAnalysis?: AudioAnalysisResult) => {
    // Process the recording
    handleRecordingComplete(audioBlob, transcript, audioAnalysis);
    
    // Wait for result to be processed
    setTimeout(() => {
      if (assessmentResult) {
        // Add to history
        const updatedHistory = addToHistory(selectedPrompt!, assessmentResult);
        
        // Check for consistency in CEFR level
        const currentLevel = assessmentResult.cefrLevel;
        const consistencyCount = checkConsistency(currentLevel);
        
        // Determine if we should continue or finish
        const shouldFinish = shouldFinishAssessment(
          consistencyCount, 
          currentPromptIndex, 
          promptQueue.length
        );
        
        if (shouldFinish) {
          finishAssessment(assessmentResult);
        } else {
          // Move to next prompt
          const nextPrompt = moveToNextPrompt();
          if (nextPrompt) {
            handlePromptSelect(nextPrompt);
          }
        }
        
        // Reset for next recording
        handleReset();
      }
    }, 500); // Small delay to ensure state updates
  };
  
  // Skip to next prompt
  const skipToNextPrompt = () => {
    const nextPrompt = moveToNextPrompt();
    
    if (nextPrompt) {
      handlePromptSelect(nextPrompt);
      handleReset();
    } else {
      // If no more prompts, finish with current result
      finishAssessment(assessmentResult || null);
    }
  };
  
  // Finish assessment
  const finishAssessment = (finalAssessmentResult: AssessmentResult | null) => {
    setFinalResult(finalAssessmentResult);
    
    if (emailResults && !bypassScoringDelay) {
      // Show processing screen if email delivery is expected
      setCurrentStep(AssessmentStep.PROCESSING);
      
      // In a real app, we would trigger email sending here
      
      // Simulate delay then show results
      setTimeout(() => {
        setCurrentStep(AssessmentStep.RESULTS);
      }, bypassScoringDelay ? 0 : 3000); // Use a shorter delay for demo purposes
    } else {
      // Show results immediately
      setCurrentStep(AssessmentStep.RESULTS);
    }
    
    // Store assessment data
    storeAssessmentData(studentInfo, promptHistory, finalAssessmentResult);
  };
  
  // Reset the entire assessment
  const resetAssessment = () => {
    handleReset();
    setCurrentStep(AssessmentStep.ENTRY);
    resetSession();
    resetScoring();
    setPromptHistory([]);
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
    isProcessing,
    detailedFeedback,
    
    // Assessment result state
    assessmentResult,
    
    // Methods
    setCurrentStep,
    initializeAssessment,
    startAssessment,
    handleResponseComplete,
    skipToNextPrompt,
    finishAssessment,
    resetAssessment,
    toggleAdminReviewMode,
    handleStudentInfoSubmit,
    
    // Configuration
    flowConfig,
    totalPrompts
  };
};
