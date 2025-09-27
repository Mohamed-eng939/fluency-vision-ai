
import { AssessmentStep, ReadAloudStage } from './types/assessmentTypes';

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
  setReadAloudStage: (stage: ReadAloudStage) => void;
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
  setPromptHistory,
  setReadAloudStage
}: AssessmentFlowActionsProps) => {
  
  // Initialize the assessment
  const initializeAssessmentFlow = async (withEmail: boolean = false) => {
    console.log("Initializing assessment with email:", withEmail);
    await initializeSession(withEmail);
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
    
    // Reset read-aloud stage
    setReadAloudStage({
      ready: false,
      done: false,
      currentIndex: 0,
      totalItems: 0,
      items: []
    });
  };

  return {
    initializeAssessmentFlow,
    startAssessmentFlow,
    resetAssessmentFlow
  };
};
