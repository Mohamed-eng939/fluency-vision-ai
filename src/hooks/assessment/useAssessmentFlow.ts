
import { useState } from 'react';
import { SpeakingPrompt, AssessmentResult, AudioAnalysisResult } from '@/types/assessment';
import { useStudentInfo } from './useStudentInfo';
import { usePromptSelection } from './usePromptSelection';
import { useAssessmentResult } from './useAssessmentResult';
import { usePromptManagement } from './usePromptManagement';
import { useAssessmentScoring } from './useAssessmentScoring';
import { useAdminControls } from './useAdminControls';
import { useSessionManagement } from './useSessionManagement';
import { AssessmentStep, AssessmentFlowConfig, DEFAULT_CONFIG } from './types/assessmentTypes';
import { applyCEFRCalibration } from '@/utils/scoring/cefrAssessmentResults';
import { CEFRLevel } from '@/utils/scoring/cefrUtils';
import { processRecordingForAssessment } from '@/utils/assessment/audioProcessingUtils';

export { AssessmentStep } from './types/assessmentTypes';
export type { AssessmentFlowConfig } from './types/assessmentTypes';

interface StoredResponse {
  prompt: SpeakingPrompt;
  audioBlob: Blob;
  transcript?: string;
  audioAnalysis?: AudioAnalysisResult;
  timestamp: number;
}

export const useAssessmentFlow = (config: Partial<AssessmentFlowConfig> = {}) => {
  // Merge provided config with defaults
  const flowConfig = { ...DEFAULT_CONFIG, ...config };
  
  // Assessment step state
  const [currentStep, setCurrentStep] = useState<AssessmentStep>(AssessmentStep.ENTRY);
  
  // Store responses for delayed processing
  const [storedResponses, setStoredResponses] = useState<StoredResponse[]>([]);
  const [isProcessingAllResponses, setIsProcessingAllResponses] = useState(false);
  
  // Student information state
  const { studentInfo, handleStudentInfoSubmit } = useStudentInfo();
  
  // Session management
  const { 
    sessionId, 
    emailResults, 
    initializeSession, 
    storeAssessmentData,
    resetSession 
  } = useSessionManagement();
  
  // Prompt management
  const { 
    promptQueue, 
    promptHistory, 
    currentPromptIndex, 
    currentPrompt,
    totalPrompts,
    initializePromptQueue,
    addToHistory,
    moveToNextPrompt,
    setPromptHistory
  } = usePromptManagement(flowConfig.promptsCount);
  
  // Assessment scoring
  const { 
    finalResult, 
    setFinalResult,
    consistentScores,
    checkConsistency,
    shouldFinishAssessment,
    resetScoring
  } = useAssessmentScoring(flowConfig.requiredConsistentScores);
  
  // Admin controls
  const {
    bypassScoringDelay,
    showRawScoring,
    toggleAdminReviewMode,
    resetAdminControls
  } = useAdminControls();
  
  // Prompt selection and assessment result hooks
  const { selectedPrompt, handlePromptSelect } = usePromptSelection();
  const { 
    assessmentResult, 
    isProcessing, 
    detailedFeedback, 
    handleRecordingComplete, 
    handleReset 
  } = useAssessmentResult({ 
    selectedPrompt, 
    studentInfo: {
      sessionId,
      name: studentInfo?.name,
    }
  });
  
  // Initialize the assessment
  const initializeAssessment = (withEmail: boolean = false) => {
    console.log("Initializing assessment with email:", withEmail);
    initializeSession(withEmail);
    initializePromptQueue();
    resetScoring();
    setStoredResponses([]);
    setCurrentStep(AssessmentStep.WELCOME);
  };
  
  // Start the assessment
  const startAssessment = () => {
    console.log("Starting assessment, prompts available:", promptQueue.length);
    if (promptQueue.length > 0) {
      handlePromptSelect(promptQueue[0]);
      setCurrentStep(AssessmentStep.RECORDING);
    }
  };
  
  // Handle recording completion - now just stores the response
  const handleResponseComplete = async (audioBlob: Blob, transcript?: string, audioAnalysis?: AudioAnalysisResult) => {
    console.log("Response completed, storing for later analysis...");
    
    // Store the response without processing
    const newResponse: StoredResponse = {
      prompt: selectedPrompt!,
      audioBlob,
      transcript,
      audioAnalysis,
      timestamp: Date.now()
    };
    
    setStoredResponses(prev => [...prev, newResponse]);
    
    // Move to next prompt immediately
    const nextPrompt = moveToNextPrompt();
    if (nextPrompt) {
      console.log("Moving to next prompt:", nextPrompt.text);
      handlePromptSelect(nextPrompt);
      handleReset(); // Clear previous recording state
    } else {
      console.log("No more prompts, processing all responses");
      await processAllStoredResponses();
    }
  };
  
  // Process all stored responses at the end of the test
  const processAllStoredResponses = async () => {
    console.log("Processing all stored responses:", storedResponses.length);
    setIsProcessingAllResponses(true);
    setCurrentStep(AssessmentStep.PROCESSING);
    
    try {
      const processedHistory: { prompt: SpeakingPrompt; result: AssessmentResult }[] = [];
      let lastResult: AssessmentResult | null = null;
      
      for (const response of storedResponses) {
        try {
          console.log("Processing response for prompt:", response.prompt.text);
          
          const result = await processRecordingForAssessment(
            response.audioBlob,
            response.transcript,
            response.audioAnalysis,
            response.prompt,
            {
              sessionId,
              name: studentInfo?.name,
            }
          );
          
          // Apply CEFR calibration
          const enhancedResult = applyCEFRCalibration(result, response.audioAnalysis);
          
          processedHistory.push({
            prompt: response.prompt,
            result: enhancedResult
          });
          
          lastResult = enhancedResult;
          
        } catch (error) {
          console.error("Error processing response:", error);
          // Continue with next response even if one fails
        }
      }
      
      // Update prompt history with processed results
      setPromptHistory(processedHistory);
      
      // Finish assessment with the last result
      finishAssessment(lastResult);
      
    } catch (error) {
      console.error("Error processing stored responses:", error);
      finishAssessment(null);
    } finally {
      setIsProcessingAllResponses(false);
    }
  };
  
  // Skip to next prompt
  const skipToNextPrompt = () => {
    console.log("Skipping to next prompt");
    const nextPrompt = moveToNextPrompt();
    
    if (nextPrompt) {
      handlePromptSelect(nextPrompt);
      handleReset();
    } else {
      processAllStoredResponses();
    }
  };
  
  // Finish assessment
  const finishAssessment = (finalAssessmentResult: AssessmentResult | null) => {
    console.log("Finishing assessment with result:", finalAssessmentResult);
    setFinalResult(finalAssessmentResult);
    
    // Store assessment data
    storeAssessmentData(studentInfo, promptHistory, finalAssessmentResult);
    
    if (emailResults && !bypassScoringDelay) {
      setCurrentStep(AssessmentStep.PROCESSING);
      setTimeout(() => {
        setCurrentStep(AssessmentStep.RESULTS);
      }, 3000);
    } else {
      setCurrentStep(AssessmentStep.RESULTS);
    }
  };
  
  // Reset the entire assessment
  const resetAssessment = () => {
    console.log("Resetting assessment");
    handleReset();
    setCurrentStep(AssessmentStep.ENTRY);
    resetSession();
    resetScoring();
    setPromptHistory([]);
    setStoredResponses([]);
  };
  
  return {
    // State
    currentStep,
    studentInfo,
    emailResults,
    sessionId,
    promptQueue,
    promptHistory,
    currentPromptIndex,
    currentPrompt,
    finalResult,
    consistentScores,
    bypassScoringDelay,
    showRawScoring,
    isProcessing: isProcessing || isProcessingAllResponses,
    detailedFeedback,
    storedResponses,
    
    // Assessment result state
    assessmentResult,
    
    // Methods
    setCurrentStep,
    initializeAssessment,
    startAssessment,
    handleResponseComplete,
    skipToNextPrompt,
    finishAssessment,
    resetAssessment,
    toggleAdminReviewMode,
    handleStudentInfoSubmit,
    processAllStoredResponses,
    
    // Configuration
    flowConfig,
    totalPrompts
  };
};
