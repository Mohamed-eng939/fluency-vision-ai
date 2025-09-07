
import { useState } from 'react';
import { AssessmentStep, AssessmentFlowConfig, DEFAULT_CONFIG } from './types/assessmentTypes';
import { AssessmentResult } from '@/types/assessment';

export const useAssessmentControl = (config: Partial<AssessmentFlowConfig> = {}) => {
  // Merge provided config with defaults
  const flowConfig = { ...DEFAULT_CONFIG, ...config };
  
  // Assessment step state
  const [currentStep, setCurrentStep] = useState<AssessmentStep>(AssessmentStep.ENTRY);

  // Initialize the assessment
  const initializeAssessment = async (
    initializeSession: (withEmail: boolean) => Promise<string>,
    initializePromptQueue: () => void,
    resetScoring: () => void,
    resetStoredResponses: () => void,
    withEmail: boolean = false
  ) => {
    console.log("Initializing assessment with email:", withEmail);
    await initializeSession(withEmail);
    initializePromptQueue();
    resetScoring();
    resetStoredResponses();
    setCurrentStep(AssessmentStep.WELCOME);
  };

  // Start the assessment
  const startAssessment = (
    promptQueue: any[],
    handlePromptSelect: (prompt: any) => void
  ) => {
    console.log("Starting assessment, prompts available:", promptQueue.length);
    if (promptQueue.length > 0) {
      handlePromptSelect(promptQueue[0]);
      setCurrentStep(AssessmentStep.RECORDING);
    }
  };

  // Finish assessment
  const finishAssessment = (
    finalAssessmentResult: AssessmentResult | null,
    setFinalResult: (result: AssessmentResult | null) => void,
    storeAssessmentData: (studentInfo: any, promptHistory: any[], finalResult: any) => void,
    studentInfo: any,
    promptHistory: any[],
    emailResults: boolean,
    bypassScoringDelay: boolean
  ) => {
    console.log("🏁 Finishing assessment with result:", finalAssessmentResult);
    console.log("🏁 Email results:", emailResults, "Bypass delay:", bypassScoringDelay);
    
    setFinalResult(finalAssessmentResult);
    
    // Store assessment data (async but don't block UI)
    if (finalAssessmentResult) {
      Promise.resolve(storeAssessmentData(studentInfo, promptHistory, finalAssessmentResult))
        .catch(error => console.error("Failed to store assessment data:", error));
    }
    
    // Always move to results step after a brief delay for user feedback
    setTimeout(() => {
      console.log("🎯 Moving to RESULTS step");
      setCurrentStep(AssessmentStep.RESULTS);
    }, 1500); // Shorter delay for better UX
  };

  // Reset the entire assessment
  const resetAssessment = (
    handleReset: () => void,
    resetSession: () => void,
    resetScoring: () => void,
    setPromptHistory: (history: any[]) => void,
    resetStoredResponses: () => void
  ) => {
    console.log("Resetting assessment");
    handleReset();
    setCurrentStep(AssessmentStep.ENTRY);
    resetSession();
    resetScoring();
    setPromptHistory([]);
    resetStoredResponses();
  };

  return {
    currentStep,
    setCurrentStep,
    flowConfig,
    initializeAssessment,
    startAssessment,
    finishAssessment,
    resetAssessment
  };
};
