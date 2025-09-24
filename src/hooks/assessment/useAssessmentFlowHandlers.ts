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
  processAllStoredResponses: (sessionId?: string, studentName?: string, promptHistoryUpdate?: any) => Promise<any>;
  setCurrentStep: (step: AssessmentStep) => void;
  finishAssessment: (
    finalAssessmentResult: any,
    setFinalResult: (result: any) => void,
    storeAssessmentData: (studentInfo: any, promptHistory: any[], finalResult: any) => Promise<any>,
    studentInfo: any,
    promptHistory: any[],
    emailResults: boolean,
    bypassScoringDelay: boolean
  ) => void;
  setFinalResult: (result: any) => void;
  storeAssessmentData: (studentInfo: any, promptHistory: any[], finalResult: any) => Promise<any>;
  studentInfo: any;
  promptHistory: any[];
  emailResults: boolean;
  bypassScoringDelay: boolean;
  sessionId?: string;
  readAloudStage: ReadAloudStage;
  setReadAloudStage: (stage: ReadAloudStage | ((prev: ReadAloudStage) => ReadAloudStage)) => void;
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
    console.info(`[FS_SAVE_START] Current step: ${currentPromptIndex + 1}, A1 stage:`, {
      ready: readAloudStage.a1.ready,
      done: readAloudStage.a1.done,
      index: readAloudStage.a1.index
    });
    
    // Validate audio before storing
    if (!audioBlob || audioBlob.size === 0) {
      console.error(`[FS_SAVE_FAIL] Invalid audio blob - cannot proceed`);
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
      console.error(`[FS_SAVE_FAIL] Failed to store response - not proceeding`);
      return;
    }
    
    console.info(`[FS_SAVE_OK] Response stored successfully`);
    
    // Check if we just completed Q4 (A1 free-speaking) - trigger A1 Read-Aloud
    if (currentPromptIndex === 3) { // Q4 = index 3
      console.info("[RA_A1_TRIGGER] Q4 completed - starting A1 Read-Aloud stage");
      initializeA1ReadAloud();
      return;
    }
    
    // Check if we're in A1 Read-Aloud stage and need to continue
    if (readAloudStage.a1.ready && !readAloudStage.a1.done) {
      console.info(`[RA_A1_CONTINUE] A1 Read-Aloud item ${readAloudStage.a1.index + 1}/3 completed - calling handleA1ReadAloudProgress`);
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
    
    // Set up A1 Read-Aloud items using functional update
    setReadAloudStage(prevStage => ({
      ...prevStage,
      a1: {
        ready: true,
        done: false,
        index: 0,
        items: [...A1_READ_ALOUD_SENTENCES]
      }
    }));
    
    // Transition to READ_ALOUD step
    setTimeout(() => {
      console.info("[RA_A1_START] Starting A1 Read-Aloud - item 1/3");
      setCurrentStep(AssessmentStep.READ_ALOUD);
    }, 300); // Reduced timeout for faster transition
  };

  // Handle A1 Read-Aloud progress - FIXED VERSION
  const handleA1ReadAloudProgress = async () => {
    console.info(`[RA_A1_PROGRESS_START] Current index: ${readAloudStage.a1.index}`);
    
    // Use functional update to get fresh state and avoid stale closures
    setReadAloudStage(prevStage => {
      const currentIndex = prevStage.a1.index;
      const nextIndex = currentIndex + 1;
      
      console.info(`[RA_A1_PROGRESS] Current: ${currentIndex}, Next: ${nextIndex}`);
      
      if (nextIndex < 3) {
        // Move to next A1 item
        console.info(`[RA_A1_NEXT] Moving to A1 Read-Aloud item ${nextIndex + 1}/3`);
        return {
          ...prevStage,
          a1: { 
            ...prevStage.a1, 
            index: nextIndex 
          }
        };
      } else {
        // A1 Read-Aloud complete - mark as done
        console.info("[RA_A1_COMPLETE] A1 Read-Aloud stage completed - marking as done");
        
        // Schedule the transition to Q5 after state update
        setTimeout(() => {
          const nextPrompt = moveToNextPrompt(); // This should give us Q5
          if (nextPrompt) {
            console.info(`[FS_RESUME] Resuming free-speaking at Q5: ${nextPrompt.text.substring(0, 50)}...`);
            handlePromptSelect(nextPrompt);
            handleReset();
            setCurrentStep(AssessmentStep.RECORDING);
          }
        }, 50);
        
        return {
          ...prevStage,
          a1: { 
            ...prevStage.a1, 
            done: true 
          }
        };
      }
    });
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
      
      if (lastResult) {
        setFinalResult(lastResult);
        
        // Only store assessment data if student info is available
        if (studentInfo) {
          try {
            const assessmentData = await storeAssessmentData(studentInfo, promptHistory, lastResult);
            console.log("💾 Assessment data stored successfully:", assessmentData);
          } catch (error) {
            console.error("❌ Failed to store assessment data:", error);
          }
        }
        
        setCurrentStep(AssessmentStep.RESULTS);
      } else {
        console.warn("⚠️ No result from batch processing");
        finishAssessment(null, setFinalResult, storeAssessmentData, studentInfo, promptHistory, emailResults, bypassScoringDelay); // Fallback to finish
      }
    } catch (error) {
      console.error("❌ Error during batch processing:", error);
      finishAssessment(null, setFinalResult, storeAssessmentData, studentInfo, promptHistory, emailResults, bypassScoringDelay); // Fallback to finish on error
    }
  };

  // Skip to next prompt in the queue
  const skipToNextPrompt = () => {
    // Check if we're in A1 Read-Aloud stage
    if (readAloudStage.a1.ready && !readAloudStage.a1.done) {
      console.info(`[RA_A1_SKIP] Skipping A1 Read-Aloud item ${readAloudStage.a1.index + 1}/3`);
      handleA1ReadAloudProgress();
      return;
    }
    
    const nextPrompt = moveToNextPrompt();
    
    if (nextPrompt) {
      console.info(`[SKIP] Moving to Q${currentPromptIndex + 2}/${totalPrompts}: ${nextPrompt.text.substring(0, 50)}...`);
      handlePromptSelect(nextPrompt);
      handleReset();
    } else {
      console.info("[SKIP_COMPLETE] No more prompts - finishing assessment");
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