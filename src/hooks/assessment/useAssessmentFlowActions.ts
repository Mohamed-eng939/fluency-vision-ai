
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
    
    try {
      // Initialize session (fallback to anonymous if auth fails)
      const sessionId = await initializeSession(withEmail);
      console.log("✅ INIT: Session initialized with ID:", sessionId);
      
      // Initialize prompt queue
      initializePromptQueue();
      console.log("✅ INIT: Prompt queue initialized, count:", promptQueue.length);
      
      // Reset scoring and stored responses
      resetScoring();
      resetStoredResponses();
      console.log("✅ INIT: Scoring and responses reset");
      
    } catch (error) {
      console.error("❌ INIT: Error during initialization:", error);
      // Continue anyway - we still want to show the welcome step
    }
    
    // ALWAYS transition to WELCOME step, even if some init steps failed
    console.log("🎯 INIT: setCurrentStep(WELCOME)");
    setCurrentStep(AssessmentStep.WELCOME);
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
