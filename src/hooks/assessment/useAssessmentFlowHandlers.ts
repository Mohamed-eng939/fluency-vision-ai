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
    console.info(`[RESPONSE_COMPLETE] Q${currentPromptIndex + 1}`);
    
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
    skipToNextPrompt
  };
};