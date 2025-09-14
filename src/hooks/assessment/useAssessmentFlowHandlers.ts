
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
    console.info(`[FS_SAVE_START] Q${currentPromptIndex + 1}: Storing response without scoring...`);
    
    // Validate audio before storing
    if (!audioBlob || audioBlob.size === 0) {
      console.error(`[FS_SAVE_FAIL] Q${currentPromptIndex + 1}: Invalid audio blob - cannot proceed`);
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
      console.error(`[FS_SAVE_FAIL] Q${currentPromptIndex + 1}: Failed to store response - not proceeding`);
      return;
    }
    
    console.info(`[FS_SAVE_OK] Q${currentPromptIndex + 1}: Response stored successfully`);
    
    // Move to next prompt immediately
    const nextPrompt = moveToNextPrompt();
    if (nextPrompt) {
      console.info(`[FS_NEXT] Moving from Q${currentPromptIndex}→Q${currentPromptIndex + 1}/${totalPrompts}: ${nextPrompt.text.substring(0, 50)}...`);
      
      handlePromptSelect(nextPrompt);
      handleReset(); // Clear previous recording state
    } else {
      console.info("[ASSESSMENT_COMPLETE] All 38 questions completed - starting batch processing");
      await processBatchAndFinish();
    }
  };

  // Process all stored responses and finish assessment
  const processBatchAndFinish = async () => {
    console.log("🔄 Starting batch processing phase for all stored responses");
    console.log("🔄 Session ID:", sessionId);
    console.log("🔄 Student Info:", studentInfo);
    
    setCurrentStep(AssessmentStep.PROCESSING);
    
    try {
      const lastResult = await processAllStoredResponses(
        sessionId,
        studentInfo?.name,
        undefined // Let the parent handle prompt history updates
      );
      
      console.log("✅ Batch processing completed, result:", lastResult);
      
      // Set the final result first
      setFinalResult(lastResult);
      
      // Then call finishAssessment to transition to RESULTS step and store data
      console.log("🏁 Calling finishAssessment with storage...");
      finishAssessment(
        lastResult,
        setFinalResult,
        storeAssessmentData,
        studentInfo,
        promptHistory,
        emailResults,
        bypassScoringDelay
      );
    } catch (error) {
      console.error("❌ Error in batch processing:", error);
      // Even if processing fails, set null result and finish
      setFinalResult(null);
      finishAssessment(
        null,
        setFinalResult,
        storeAssessmentData,
        studentInfo,
        promptHistory,
        emailResults,
        bypassScoringDelay
      );
    }
  };
  
  // Skip to next prompt
  const skipToNextPrompt = () => {
    console.info(`[SKIP] Q${currentPromptIndex + 1}: Skipping to next prompt`);
    const nextPrompt = moveToNextPrompt();
    
    if (nextPrompt) {
      handlePromptSelect(nextPrompt);
      handleReset();
    } else {
      console.info("[SKIP_COMPLETE] No more prompts - starting batch processing");
      processBatchAndFinish();
    }
  };

  return {
    handleResponseComplete,
    processBatchAndFinish,
    skipToNextPrompt
  };
};
