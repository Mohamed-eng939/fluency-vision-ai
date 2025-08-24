
import { AudioAnalysisResult } from '@/types/assessment';
import { AssessmentStep } from './types/assessmentTypes';

interface AssessmentFlowHandlersProps {
  selectedPrompt: any;
  storeResponse: (prompt: any, audioBlob: Blob, transcript?: string, audioAnalysis?: AudioAnalysisResult, index?: number) => boolean;
  currentPromptIndex: number;
  totalPrompts: number;
  moveToNextPrompt: () => any;
  handlePromptSelect: (prompt: any) => void;
  handleReset: () => void;
  processAllStoredResponses: (sessionId: string, studentName?: string, setPromptHistory?: (history: any[]) => void) => Promise<any>;
  setCurrentStep: (step: AssessmentStep) => void;
  finishAssessment: (result: any, setFinalResult: (result: any) => void, storeAssessmentData: (studentInfo: any, promptHistory: any[], finalResult: any) => void, studentInfo: any, promptHistory: any[], emailResults: boolean, bypassScoringDelay: boolean) => void;
  setFinalResult: (result: any) => void;
  storeAssessmentData: (studentInfo: any, promptHistory: any[], finalResult: any) => void;
  studentInfo: any;
  promptHistory: any[];
  emailResults: boolean;
  bypassScoringDelay: boolean;
  sessionId: string;
}

export const useAssessmentFlowHandlers = ({
  selectedPrompt,
  storeResponse,
  currentPromptIndex,
  totalPrompts,
  moveToNextPrompt,
  handlePromptSelect,
  handleReset,
  processAllStoredResponses,
  setCurrentStep,
  finishAssessment,
  setFinalResult,
  storeAssessmentData,
  studentInfo,
  promptHistory,
  emailResults,
  bypassScoringDelay,
  sessionId
}: AssessmentFlowHandlersProps) => {

  // Handle recording completion - immediate storage without scoring
  const handleResponseComplete = async (audioBlob: Blob, transcript?: string, audioAnalysis?: AudioAnalysisResult) => {
    console.log("Response completed, storing immediately without scoring...");
    
    // Validate audio before storing
    if (!audioBlob || audioBlob.size === 0) {
      console.error("Cannot proceed - invalid audio blob");
      return;
    }
    
    // Store the response immediately without analysis
    const success = storeResponse(
      selectedPrompt!, 
      audioBlob, 
      transcript, 
      audioAnalysis, 
      currentPromptIndex
    );
    
    if (!success) {
      console.error("Failed to store response, not proceeding to next question");
      return;
    }
    
    // Move to next prompt immediately
    const nextPrompt = moveToNextPrompt();
    if (nextPrompt) {
      console.log(`Moving to next prompt (${currentPromptIndex + 1}/${totalPrompts}):`, nextPrompt.text.substring(0, 50));
      
      // Check if we're transitioning to Read Aloud tasks (Q24+)
      if (nextPrompt.isReadAloud && currentPromptIndex === 22) { // After Q23
        console.log("Transitioning to Read Aloud phase");
        setCurrentStep(AssessmentStep.READ_ALOUD);
      }
      
      handlePromptSelect(nextPrompt);
      handleReset(); // Clear previous recording state
    } else {
      console.log("No more prompts, starting batch processing of all responses");
      await processBatchAndFinish();
    }
  };

  // Process all stored responses and finish assessment
  const processBatchAndFinish = async () => {
    console.log("Starting batch processing phase for all stored responses");
    setCurrentStep(AssessmentStep.PROCESSING);
    
    const lastResult = await processAllStoredResponses(
      sessionId,
      studentInfo?.name,
      (history) => {} // setPromptHistory handled in parent
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
      processBatchAndFinish();
    }
  };

  return {
    handleResponseComplete,
    processBatchAndFinish,
    skipToNextPrompt
  };
};
