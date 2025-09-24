
import { AudioAnalysisResult } from '@/types/assessment';
import { AssessmentStep, ReadAloudStage, A1_READ_ALOUD_SENTENCES } from './types/assessmentTypes';

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
  readAloudStage: ReadAloudStage;
  setReadAloudStage: (stage: ReadAloudStage) => void;
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
  sessionId,
  readAloudStage,
  setReadAloudStage
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
    
    // Check if we just completed Q4 (A1 free-speaking) - trigger A1 Read-Aloud
    if (currentPromptIndex === 3) { // Q4 = index 3
      console.info("[RA_A1_TRIGGER] Q4 completed - starting A1 Read-Aloud stage");
      initializeA1ReadAloud();
      return;
    }
    
    // Check if we're in A1 Read-Aloud stage and need to continue
    if (readAloudStage.a1.ready && !readAloudStage.a1.done) {
      console.info(`[RA_A1_CONTINUE] A1 Read-Aloud item ${readAloudStage.a1.index + 1}/3 completed`);
      await handleA1ReadAloudProgress();
      return;
    }
    
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

  // Initialize A1 Read-Aloud stage after Q4
  const initializeA1ReadAloud = () => {
    console.info("[RA_A1_INIT] Initializing A1 Read-Aloud stage with 3 sentences");
    
    setCurrentStep(AssessmentStep.READ_ALOUD_LOADING);
    
    // Set up A1 Read-Aloud items
    const updatedStage = {
      ...readAloudStage,
      a1: {
        ready: true,
        done: false,
        index: 0,
        items: [...A1_READ_ALOUD_SENTENCES]
      }
    };
    
    setReadAloudStage(updatedStage);
    
    // Transition to READ_ALOUD step
    setTimeout(() => {
      console.info("[RA_A1_START] Starting A1 Read-Aloud - item 1/3");
      setCurrentStep(AssessmentStep.READ_ALOUD);
    }, 500);
  };

  // Handle A1 Read-Aloud progress
  const handleA1ReadAloudProgress = async () => {
    const nextIndex = readAloudStage.a1.index + 1;
    
    if (nextIndex < 3) {
      // Move to next A1 item
      console.info(`[RA_A1_NEXT] Moving to A1 Read-Aloud item ${nextIndex + 1}/3`);
      const updatedStage = {
        ...readAloudStage,
        a1: { ...readAloudStage.a1, index: nextIndex }
      };
      setReadAloudStage(updatedStage);
      
      // Force a brief step change to trigger re-render
      setCurrentStep(AssessmentStep.READ_ALOUD_LOADING);
      setTimeout(() => {
        setCurrentStep(AssessmentStep.READ_ALOUD);
      }, 100);
    } else {
      // A1 Read-Aloud complete - return to free-speaking at Q5
      console.info("[RA_A1_COMPLETE] A1 Read-Aloud stage completed - resuming at Q5");
      setReadAloudStage({
        ...readAloudStage,
        a1: { ...readAloudStage.a1, done: true }
      });
      
      // Move to Q5 (A2 free-speaking)
      const nextPrompt = moveToNextPrompt(); // This should give us Q5
      if (nextPrompt) {
        console.info(`[FS_RESUME] Resuming free-speaking at Q5: ${nextPrompt.text.substring(0, 50)}...`);
        handlePromptSelect(nextPrompt);
        handleReset();
        setCurrentStep(AssessmentStep.RECORDING);
      }
    }
  };

  // Process all stored responses and finish assessment
  const processBatchAndFinish = async () => {
    // Block processing if A1 Read-Aloud stage is not complete
    if (readAloudStage.a1.ready && !readAloudStage.a1.done) {
      console.warn("[PROCESS_BLOCKED] A1 Read-Aloud stage not complete - blocking PROCESSING/RESULTS");
      return;
    }
    
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
    skipToNextPrompt,
    initializeA1ReadAloud,
    handleA1ReadAloudProgress
  };
};
