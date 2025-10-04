
import React from 'react';
import { AssessmentStep } from '@/hooks/assessment/useAssessmentFlow';
import TestEntryStep from './TestEntryStep';
import WelcomeStep from './WelcomeStep';
import RecordingStep from './RecordingStep';
import ProcessingResults from './ProcessingResults';
import ResultsStep from './ResultsStep';
import AssessmentOptions from './AssessmentOptions';
import { StudentInfo } from '@/hooks/assessment';
import { SpeakingPrompt, AssessmentResult, AudioAnalysisResult } from '@/types/assessment';

interface AssessmentStepRendererProps {
  currentStep: AssessmentStep;
  showAssessmentOptions: boolean;
  studentInfo: StudentInfo | null;
  currentPrompt: SpeakingPrompt | null;
  currentPromptIndex: number;
  totalPrompts: number;
  finalResult: AssessmentResult | null;
  isProcessing: boolean;
  emailResults: boolean;
  detailedFeedback: Record<string, string> | null;
  promptHistory: any[];
  showRawScoring: boolean;
  showAdminControls: boolean;
  processingProgress?: { current: number; total: number };
  sessionId?: string;
  processBatchAndFinish?: () => void;

  // Methods
  onSelectQuickAssessment: () => void;
  initializeAssessment: (withEmail: boolean) => void;
  onStudentInfoSubmit: (info: StudentInfo) => void;
  startAssessment: () => void;
  handleResponseComplete: (audioBlob: Blob, transcript?: string, audioAnalysis?: AudioAnalysisResult) => void;
  skipToNextPrompt: () => void;
  finishAssessment: (result: AssessmentResult | null) => void;
  resetAssessment: () => void;
  toggleAdminReviewMode: () => void;
  onTakeFullAssessment: () => void;
}

const AssessmentStepRenderer: React.FC<AssessmentStepRendererProps> = ({
  currentStep,
  showAssessmentOptions,
  studentInfo,
  currentPrompt,
  currentPromptIndex,
  totalPrompts,
  finalResult,
  isProcessing,
  emailResults,
  detailedFeedback,
  promptHistory,
  showRawScoring,
  showAdminControls,
  processingProgress,
  sessionId,
  processBatchAndFinish,
  onSelectQuickAssessment,
  initializeAssessment,
  onStudentInfoSubmit,
  startAssessment,
  handleResponseComplete,
  skipToNextPrompt,
  finishAssessment,
  resetAssessment,
  toggleAdminReviewMode,
  onTakeFullAssessment
}) => {
  // If showing assessment options, render those first
  if (showAssessmentOptions) {
    return (
      <AssessmentOptions
        onSelectQuickAssessment={onSelectQuickAssessment}
      />
    );
  }

  switch (currentStep) {
    case AssessmentStep.ENTRY:
      return (
        <TestEntryStep 
          onStart={initializeAssessment}
          onStudentInfoSubmit={onStudentInfoSubmit}
        />
      );
    
    case AssessmentStep.WELCOME:
      return (
        <WelcomeStep 
          onStart={startAssessment}
        />
      );
    
    case AssessmentStep.RECORDING:
      if (!currentPrompt) return null;
      
      return (
        <RecordingStep 
          prompt={currentPrompt}
          currentIndex={currentPromptIndex}
          totalPrompts={totalPrompts}
          onRecordingComplete={handleResponseComplete}
          onPause={() => {}} // This would be implemented for pausing functionality
          onFinishNow={() => processBatchAndFinish?.()}
          onNext={skipToNextPrompt}
          isProcessing={isProcessing}
        />
      );
    
    case AssessmentStep.PROCESSING:
      return (
        <ProcessingResults 
          current={processingProgress?.current || 0}
          total={processingProgress?.total || 0}
          isProcessing={isProcessing}
        />
      );
    
    case AssessmentStep.RESULTS:
      return (
        <ResultsStep 
          result={finalResult}
          detailedFeedback={detailedFeedback}
          promptHistory={promptHistory}
          showRawScoring={showRawScoring && showAdminControls}
          isProcessing={isProcessing}
          onReset={() => {
            resetAssessment();
          }}
          onTakeFullAssessment={onTakeFullAssessment}
        />
      );
    
    default:
      return null;
  }
};

export default AssessmentStepRenderer;
