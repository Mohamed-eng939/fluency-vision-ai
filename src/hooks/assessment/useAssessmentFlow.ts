
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
import { applyCEFRCalibration } from '@/utils/scoring/cefrAssessmentResults';

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
    console.log("Initializing assessment with email:", withEmail);
    initializeSession(withEmail);
    initializePromptQueue();
    resetScoring();
    setCurrentStep(AssessmentStep.WELCOME);
  };
  
  // Start the assessment
  const startAssessment = () => {
    console.log("Starting assessment, prompts available:", promptQueue.length);
    if (promptQueue.length > 0) {
      handlePromptSelect(promptQueue[0]);
      setCurrentStep(AssessmentStep.RECORDING);
    }
  };
  
  // Handle recording completion
  const handleResponseComplete = async (audioBlob: Blob, transcript?: string, audioAnalysis?: AudioAnalysisResult) => {
    console.log("Response completed, processing...");
    
    try {
      // Process the recording
      await handleRecordingComplete(audioBlob, transcript, audioAnalysis);
      
      // Wait a bit for processing to complete
      setTimeout(() => {
        if (assessmentResult) {
          console.log("Assessment result received:", assessmentResult);
          
          // Apply CEFR calibration
          const enhancedResult = applyCEFRCalibration(assessmentResult, audioAnalysis);
          
          // Add to history
          addToHistory(selectedPrompt!, enhancedResult);
          
          // Check for consistency
          const currentLevel = enhancedResult.overallCEFR;
          const consistencyCount = checkConsistency(currentLevel);
          
          console.log("CEFR level:", currentLevel, "Consistency count:", consistencyCount);
          
          // Determine if we should continue or finish
          const shouldFinish = shouldFinishAssessment(
            consistencyCount, 
            currentPromptIndex, 
            promptQueue.length
          );
          
          console.log("Should finish assessment:", shouldFinish);
          
          if (shouldFinish) {
            finishAssessment(enhancedResult);
          } else {
            // Move to next prompt
            const nextPrompt = moveToNextPrompt();
            if (nextPrompt) {
              console.log("Moving to next prompt:", nextPrompt.text);
              handlePromptSelect(nextPrompt);
              handleReset(); // Clear previous recording state
            } else {
              console.log("No more prompts, finishing assessment");
              finishAssessment(enhancedResult);
            }
          }
        } else {
          console.error("No assessment result received");
          // If no result, try to finish with a basic result
          finishAssessment(null);
        }
      }, 1000);
      
    } catch (error) {
      console.error("Error in response completion:", error);
      finishAssessment(null);
    }
  };
  
  // Skip to next prompt
  const skipToNextPrompt = () => {
    console.log("Skipping to next prompt");
    const nextPrompt = moveToNextPrompt();
    
    if (nextPrompt) {
      handlePromptSelect(nextPrompt);
      handleReset();
    } else {
      finishAssessment(assessmentResult || null);
    }
  };
  
  // Finish assessment
  const finishAssessment = (finalAssessmentResult: AssessmentResult | null) => {
    console.log("Finishing assessment with result:", finalAssessmentResult);
    setFinalResult(finalAssessmentResult);
    
    // Store assessment data
    storeAssessmentData(studentInfo, promptHistory, finalAssessmentResult);
    
    if (emailResults && !bypassScoringDelay) {
      setCurrentStep(AssessmentStep.PROCESSING);
      setTimeout(() => {
        setCurrentStep(AssessmentStep.RESULTS);
      }, 3000);
    } else {
      setCurrentStep(AssessmentStep.RESULTS);
    }
  };
  
  // Reset the entire assessment
  const resetAssessment = () => {
    console.log("Resetting assessment");
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
