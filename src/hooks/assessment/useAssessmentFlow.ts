
import { useState } from 'react';
import { SpeakingPrompt, AssessmentResult, CEFRLevel } from '@/types/assessment';
import { useStudentInfo } from './useStudentInfo';
import { usePromptSelection } from './usePromptSelection';
import { useAssessmentResult } from './useAssessmentResult';
import { generateUniqueId } from '@/utils/assessmentUtils';
import { mockPrompts } from '@/utils/speaking/promptUtils';

// Define the assessment flow steps
export enum AssessmentStep {
  ENTRY = 'entry',
  WELCOME = 'welcome',
  RECORDING = 'recording',
  PROCESSING = 'processing',
  RESULTS = 'results',
  ADMIN_REVIEW = 'admin_review'
}

// Configuration type for assessment flow
export interface AssessmentFlowConfig {
  promptsCount: number;
  requiredConsistentScores: number;
  emailDelay: number; // in milliseconds
  showAdminControls: boolean;
}

// Default configuration
const DEFAULT_CONFIG: AssessmentFlowConfig = {
  promptsCount: 10,
  requiredConsistentScores: 4,
  emailDelay: 15 * 60 * 1000, // 15 minutes
  showAdminControls: false
};

export const useAssessmentFlow = (config: Partial<AssessmentFlowConfig> = {}) => {
  // Merge provided config with defaults
  const flowConfig = { ...DEFAULT_CONFIG, ...config };
  
  // Assessment step state
  const [currentStep, setCurrentStep] = useState<AssessmentStep>(AssessmentStep.ENTRY);
  
  // Student information state
  const { studentInfo, handleStudentInfoSubmit } = useStudentInfo();
  
  // Track email consent
  const [emailResults, setEmailResults] = useState(false);
  
  // Track assessment session
  const [sessionId, setSessionId] = useState<string>('');
  
  // Sort prompts by CEFR level for adaptive testing
  const sortedPrompts = [...mockPrompts].sort((a, b) => {
    // Order: A1, A2, B1, B2, C1, C2
    const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    return levels.indexOf(a.cefrLevel || 'A1') - levels.indexOf(b.cefrLevel || 'A1');
  });
  
  // Prompt queue and history
  const [promptQueue, setPromptQueue] = useState<SpeakingPrompt[]>([]);
  const [promptHistory, setPromptHistory] = useState<{
    prompt: SpeakingPrompt;
    result?: AssessmentResult;
  }[]>([]);
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  
  // Result storage
  const [finalResult, setFinalResult] = useState<AssessmentResult | null>(null);
  const [consistentScores, setConsistentScores] = useState<{
    level: CEFRLevel;
    count: number;
  }>({ level: 'A1', count: 0 });
  
  // Admin/Bypass mode
  const [bypassScoringDelay, setBypassScoringDelay] = useState(false);
  const [showRawScoring, setShowRawScoring] = useState(false);
  
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
    // Generate session ID
    const newSessionId = generateUniqueId('QA');
    setSessionId(newSessionId);
    
    // Set email preference
    setEmailResults(withEmail);
    
    // Initialize prompts queue with sorted prompts (limited by config)
    setPromptQueue(sortedPrompts.slice(0, flowConfig.promptsCount));
    
    // Reset prompt history and index
    setPromptHistory([]);
    setCurrentPromptIndex(0);
    
    // Reset result
    setFinalResult(null);
    
    // Reset consistent scores
    setConsistentScores({ level: 'A1', count: 0 });
    
    // Move to welcome step
    setCurrentStep(AssessmentStep.WELCOME);
  };
  
  // Start the assessment
  const startAssessment = () => {
    if (promptQueue.length > 0) {
      // Select first prompt
      handlePromptSelect(promptQueue[0]);
      
      // Move to recording step
      setCurrentStep(AssessmentStep.RECORDING);
    }
  };
  
  // Handle recording completion
  const handleResponseComplete = (audioBlob: Blob, transcript?: string, audioAnalysis?: any) => {
    // Process the recording
    handleRecordingComplete(audioBlob, transcript, audioAnalysis);
    
    // Wait for result to be processed
    setTimeout(() => {
      if (assessmentResult) {
        // Add to history
        const updatedHistory = [
          ...promptHistory,
          {
            prompt: selectedPrompt!,
            result: assessmentResult
          }
        ];
        setPromptHistory(updatedHistory);
        
        // Check for consistency in CEFR level
        const currentLevel = assessmentResult.cefrLevel;
        if (consistentScores.level === currentLevel) {
          setConsistentScores({
            level: currentLevel,
            count: consistentScores.count + 1
          });
        } else {
          setConsistentScores({
            level: currentLevel,
            count: 1
          });
        }
        
        // Determine if we should continue or finish
        const shouldFinish = 
          // If we've reached consistent scores threshold
          consistentScores.count >= flowConfig.requiredConsistentScores ||
          // Or if we've gone through all prompts
          currentPromptIndex >= promptQueue.length - 1;
        
        if (shouldFinish) {
          finishAssessment(assessmentResult);
        } else {
          // Move to next prompt
          const nextIndex = currentPromptIndex + 1;
          setCurrentPromptIndex(nextIndex);
          handlePromptSelect(promptQueue[nextIndex]);
        }
        
        // Reset for next recording
        handleReset();
      }
    }, 500); // Small delay to ensure state updates
  };
  
  // Skip to next prompt
  const skipToNextPrompt = () => {
    const nextIndex = currentPromptIndex + 1;
    
    if (nextIndex < promptQueue.length) {
      setCurrentPromptIndex(nextIndex);
      handlePromptSelect(promptQueue[nextIndex]);
      handleReset();
    } else {
      // If no more prompts, finish with current result
      finishAssessment(assessmentResult || null);
    }
  };
  
  // Finish assessment
  const finishAssessment = (finalAssessmentResult: AssessmentResult | null) => {
    setFinalResult(finalAssessmentResult);
    
    if (emailResults && !bypassScoringDelay) {
      // Show processing screen if email delivery is expected
      setCurrentStep(AssessmentStep.PROCESSING);
      
      // In a real app, we would trigger email sending here
      
      // Simulate delay then show results
      setTimeout(() => {
        setCurrentStep(AssessmentStep.RESULTS);
      }, bypassScoringDelay ? 0 : 3000); // Use a shorter delay for demo purposes
    } else {
      // Show results immediately
      setCurrentStep(AssessmentStep.RESULTS);
    }
    
    // Store assessment data
    storeAssessmentData();
  };
  
  // Store assessment data for future analysis
  const storeAssessmentData = () => {
    // In a real implementation, this would save to a database
    console.log('Storing assessment data', {
      sessionId,
      studentInfo,
      promptHistory,
      finalResult
    });
    
    // For now, we're just returning exportable data
    return {
      sessionId,
      studentInfo,
      promptHistory,
      finalResult,
      date: new Date().toISOString(),
      testType: 'quick'
    };
  };
  
  // Reset the entire assessment
  const resetAssessment = () => {
    handleReset();
    setCurrentStep(AssessmentStep.ENTRY);
    setSessionId('');
    setEmailResults(false);
    setPromptQueue([]);
    setPromptHistory([]);
    setCurrentPromptIndex(0);
    setFinalResult(null);
    setConsistentScores({ level: 'A1', count: 0 });
  };
  
  // Toggle admin review mode
  const toggleAdminReviewMode = () => {
    setBypassScoringDelay(!bypassScoringDelay);
    setShowRawScoring(!showRawScoring);
    
    if (currentStep === AssessmentStep.PROCESSING) {
      setCurrentStep(AssessmentStep.RESULTS);
    }
  };
  
  // Get current prompt
  const currentPrompt = promptQueue[currentPromptIndex] || null;
  
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
    isProcessing,
    detailedFeedback,
    
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
    
    // Configuration
    flowConfig,
    totalPrompts: promptQueue.length
  };
};
