
import { AssessmentStep } from './types/assessmentTypes';

interface AssessmentFlowActionsProps {
  initializeSession: (withEmail: boolean) => string;
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
  const initializeAssessmentFlow = (withEmail: boolean = false) => {
    console.log("Initializing assessment with email:", withEmail);
    initializeSession(withEmail);
    initializePromptQueue();
    resetScoring();
    resetStoredResponses();
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
