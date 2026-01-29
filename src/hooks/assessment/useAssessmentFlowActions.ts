
import { AssessmentStep } from './types/assessmentTypes';

interface AssessmentFlowActionsProps {
  initializeSession: (withEmail: boolean) => Promise<string>;
  initializePromptQueue: () => void;
  resetScoring: () => void;
  resetStoredResponses: () => void;
  promptQueue: any[];
  handlePromptSelect: (prompt: any) => void;
  setCurrentStep: (step: AssessmentStep) => void;
  handleReset: () => void;
  resetSession: () => void;
  setPromptHistory: (history: any[]) => void;
}

export const useAssessmentFlowActions = ({
  initializeSession,
  initializePromptQueue,
  resetScoring,
  resetStoredResponses,
  promptQueue,
  handlePromptSelect,
  setCurrentStep,
  handleReset,
  resetSession,
  setPromptHistory
}: AssessmentFlowActionsProps) => {
  
  // Initialize the assessment
  const initializeAssessmentFlow = async (withEmail: boolean = false) => {
    console.log("🚀 INIT: Starting assessment initialization with email:", withEmail);
    
    // CRITICAL: Set step to WELCOME FIRST, synchronously, before any async operations
    // This ensures the step changes even if auth triggers re-renders
    console.log("🎯 INIT: setCurrentStep(WELCOME) - SYNCHRONOUS");
    setCurrentStep(AssessmentStep.WELCOME);
    
    // Now do async operations - they won't affect the step
    try {
      const sessionId = await initializeSession(withEmail);
      console.log("✅ INIT: Session initialized with ID:", sessionId);
      
      initializePromptQueue();
      console.log("✅ INIT: Prompt queue initialized");
      
      resetScoring();
      resetStoredResponses();
      console.log("✅ INIT: All initializations complete");
    } catch (error) {
      console.error("❌ INIT: Error during initialization (step already set to WELCOME):", error);
    }
  };

  // Start the assessment
  const startAssessmentFlow = () => {
    console.log("Starting assessment, prompts available:", promptQueue.length);
    if (promptQueue.length > 0) {
      handlePromptSelect(promptQueue[0]);
      setCurrentStep(AssessmentStep.RECORDING);
    }
  };

  // Reset the entire assessment
  const resetAssessmentFlow = () => {
    console.log("Resetting assessment");
    handleReset();
    setCurrentStep(AssessmentStep.ENTRY);
    resetSession();
    resetScoring();
    setPromptHistory([]);
    resetStoredResponses();
  };

  return {
    initializeAssessmentFlow,
    startAssessmentFlow,
    resetAssessmentFlow
  };
};
