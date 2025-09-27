import { AudioAnalysisResult } from '@/types/assessment';
import { AssessmentStep, ReadAloudStage, READ_ALOUD_SENTENCES } from './types/assessmentTypes';

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
    console.info(`[RESPONSE_COMPLETE] Q${currentPromptIndex + 1}, ReadAloud stage:`, {
      ready: readAloudStage.ready,
      done: readAloudStage.done,
      currentIndex: readAloudStage.currentIndex,
      totalItems: readAloudStage.totalItems
    });
    
    // Validate audio before storing
    if (!audioBlob || audioBlob.size === 0) {
      console.error(`[SAVE_FAIL] Invalid audio blob - cannot proceed`);
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
      console.error(`[SAVE_FAIL] Failed to store response - not proceeding`);
      return;
    }
    
    console.info(`[SAVE_OK] Response stored successfully`);
    
    // Check if we just completed Q23 (last free-speaking) - trigger Read-Aloud stage
    if (currentPromptIndex === 22) { // Q23 = index 22
      console.info("[RA_TRIGGER] Q23 completed - starting Read-Aloud stage with all 15 sentences");
      initializeReadAloudStage();
      return;
    }
    
    // Check if we're in Read-Aloud stage and need to continue
    if (readAloudStage.ready && !readAloudStage.done) {
      console.info(`[RA_CONTINUE] Read-Aloud item ${readAloudStage.currentIndex + 1}/${readAloudStage.totalItems} completed`);
      await handleReadAloudProgress();
      return;
    }
    
    // Move to next prompt immediately
    const nextPrompt = moveToNextPrompt();
    if (nextPrompt) {
      console.info(`[NEXT] Moving from Q${currentPromptIndex + 1}→Q${currentPromptIndex + 2}/${totalPrompts}: ${nextPrompt.text.substring(0, 50)}...`);
      
      handlePromptSelect(nextPrompt);
      handleReset(); // Clear previous recording state
    } else {
      console.info("[ASSESSMENT_COMPLETE] All questions completed - starting batch processing");
      await processBatchAndFinish();
    }
  };

  // Initialize Read-Aloud stage after Q23 with all 15 sentences
  const initializeReadAloudStage = () => {
    console.info("[RA_INIT] Initializing Read-Aloud stage with all 15 sentences");
    
    setCurrentStep(AssessmentStep.READ_ALOUD_LOADING);
    
    // Set up all 15 Read-Aloud items
    setReadAloudStage({
      ready: true,
      done: false,
      currentIndex: 0,
      totalItems: READ_ALOUD_SENTENCES.length,
      items: [...READ_ALOUD_SENTENCES]
    });
    
    // Transition to READ_ALOUD step
    console.info("[RA_START] Starting Read-Aloud - item 1/15");
    setCurrentStep(AssessmentStep.READ_ALOUD);
  };

  // Handle Read-Aloud progress through all 15 sentences
  const handleReadAloudProgress = async () => {
    const currentIndex = readAloudStage.currentIndex;
    const nextIndex = currentIndex + 1;
    
    console.info(`[RA_PROGRESS] Current: ${currentIndex + 1}, Next: ${nextIndex + 1}, Total: ${readAloudStage.totalItems}`);
    
    if (nextIndex < readAloudStage.totalItems) {
      // Move to next Read-Aloud item
      console.info(`[RA_NEXT] Moving to Read-Aloud item ${nextIndex + 1}/${readAloudStage.totalItems}`);
      setReadAloudStage(prevStage => ({
        ...prevStage,
        currentIndex: nextIndex
      }));
    } else {
      // Read-Aloud stage complete - mark as done and finish assessment
      console.info("[RA_COMPLETE] Read-Aloud stage completed - finishing assessment");
      
      setReadAloudStage(prevStage => ({
        ...prevStage,
        done: true
      }));
      
      // Proceed to final processing
      await processBatchAndFinish();
    }
  };

  // Process all stored responses and finish assessment
  const processBatchAndFinish = async () => {
    // Block processing if Read-Aloud stage is not complete
    if (readAloudStage.ready && !readAloudStage.done) {
      console.warn("[PROCESS_BLOCKED] Read-Aloud stage not complete - blocking PROCESSING/RESULTS");
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
    // Check if we're in Read-Aloud stage
    if (readAloudStage.ready && !readAloudStage.done) {
      console.info(`[RA_SKIP] Skipping Read-Aloud item ${readAloudStage.currentIndex + 1}/${readAloudStage.totalItems}`);
      handleReadAloudProgress();
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
    initializeReadAloudStage,
    handleReadAloudProgress
  };
};